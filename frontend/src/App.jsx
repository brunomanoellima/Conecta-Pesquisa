import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaGithub, FaFileAlt, FaWhatsapp, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUserGraduate, FaEnvelope, FaExternalLinkAlt } from 'react-icons/fa';
import api from './api';

// --- UTILITÁRIOS ---
const getDaysLeft = (dateString) => {
  if (!dateString) return 0;
  const diff = new Date(dateString) - new Date();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

const StatusBadge = ({ status }) => {
  const colors = {
    'ABERTO': 'bg-green-100 text-green-800',
    'CONCLUIDO': 'bg-gray-200 text-gray-800',
    'PENDENTE': 'bg-yellow-100 text-yellow-800',
    'ACEITA': 'bg-blue-100 text-blue-800',
    'RECUSADA': 'bg-red-100 text-red-800',
    'NAO_AVALIADA_ENCERRADA': 'bg-gray-300 text-gray-500'
  };
  return <span className={`px-2 py-1 rounded text-xs font-bold ${colors[status] || 'bg-gray-100'}`}>{status}</span>;
};

// --- PÁGINAS ---
function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const handle = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch { alert('Login falhou'); }
  };
  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <form onSubmit={handle} className="bg-white p-8 rounded shadow w-80">
        <h2 className="text-xl font-bold mb-4">Conecta Pesquisa</h2>
        <input className="border w-full p-2 mb-2" placeholder="Email" onChange={e=>setForm({...form, email:e.target.value})} />
        <input className="border w-full p-2 mb-4" type="password" placeholder="Senha" onChange={e=>setForm({...form, password:e.target.value})} />
        <button className="bg-blue-600 text-white w-full py-2 rounded">Entrar</button>
        <Link to="/register" className="block text-center mt-2 text-sm text-blue-600">Criar Conta</Link>
      </form>
    </div>
  );
}

function Register() {
  const [form, setForm] = useState({ nome: '', email: '', password: '', role: 'discente' });
  const navigate = useNavigate();
  const handle = async (e) => {
    e.preventDefault();
    try { await api.post('/auth/register', form); alert('Conta criada!'); navigate('/'); } catch { alert('Erro no cadastro'); }
  };
  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <form onSubmit={handle} className="bg-white p-8 rounded shadow w-80">
        <h2 className="text-xl font-bold mb-4">Nova Conta</h2>
        <input className="border w-full p-2 mb-2" placeholder="Nome" onChange={e=>setForm({...form, nome:e.target.value})} />
        <input className="border w-full p-2 mb-2" placeholder="Email" onChange={e=>setForm({...form, email:e.target.value})} />
        <input className="border w-full p-2 mb-2" type="password" placeholder="Senha" onChange={e=>setForm({...form, password:e.target.value})} />
        <select className="border w-full p-2 mb-4" onChange={e=>setForm({...form, role:e.target.value})}>
          <option value="discente">Aluno</option>
          <option value="docente">Professor</option>
        </select>
        <button className="bg-green-600 text-white w-full py-2 rounded">Cadastrar</button>
      </form>
    </div>
  );
}

// --- DASHBOARD ---
function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const [tab, setTab] = useState('projetos');
  const [data, setData] = useState({ projects: [], applications: [], profile: {} });
  
  const [skillsList, setSkillsList] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // MODAIS
  const [viewProj, setViewProj] = useState(null); 
  const [newProj, setNewProj] = useState(false); 
  const [viewStudent, setViewStudent] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const p = await api.get('/projects');
      const a = await api.get('/applications');
      if (user.role === 'discente') {
         const prof = await api.get('/profile');
         setData({ projects: p.data, applications: a.data, profile: prof.data });
         if (prof.data.habilidades) {
           try { const parsed = JSON.parse(prof.data.habilidades); setSkillsList(Array.isArray(parsed) ? parsed : []); } 
           catch { setSkillsList([prof.data.habilidades]); }
         }
      } else { setData({ projects: p.data, applications: a.data, profile: {} }); }
    } catch(e) { console.error(e); }
  };

  const addSkill = (e) => { e.preventDefault(); if (skillInput.trim()) { setSkillsList([...skillsList, skillInput.trim()]); setSkillInput(''); } };
  const removeSkill = (i) => setSkillsList(skillsList.filter((_, idx) => idx !== i));
  const saveProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData);
    body.habilidades = JSON.stringify(skillsList);
    await api.put('/profile', body);
    alert('Perfil salvo!'); load();
  };
  const apply = async (id) => {
    const msg = prompt('Mensagem de motivação:');
    if(msg) {
       try { await api.post(`/projects/${id}/apply`, { mensagem: msg }); alert('Enviado!'); load(); }
       catch (err) { alert(err.response?.data?.error || 'Erro'); }
    }
  };
  const saveProject = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData);
    try { await api.post('/projects', body); setNewProj(false); load(); } 
    catch (err) { alert(err.response?.data?.error || 'Erro'); }
  };
  const manageApp = async (id, status, isRemoval) => {
    let reason = '';
    if(isRemoval) { reason = prompt("Motivo da remoção:"); if(!reason) return; }
    try { await api.put(`/applications/${id}`, { status, reason }); load(); } catch (err) { alert(err.response?.data?.error); }
  };
  const searchStudents = async () => { const res = await api.get(`/users/search?nome=${search}`); setSearchResults(res.data); };
  const myStatusInProject = (pid) => { if(user.role!=='discente')return null; const app=data.applications.find(a=>a.project_id===pid); return app?app.status:null; };
  const renderSkills = (json) => { try { const s=JSON.parse(json); return Array.isArray(s)?s.map((x,i)=><span key={i} className="text-xs bg-blue-100 px-2 rounded mr-1">{x}</span>):null; } catch { return null; } };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Painel {user.role === 'docente' ? 'Docente' : 'Discente'}</h1>
        <div className="flex gap-4 items-center"><span>{user.nome}</span><button onClick={()=>{localStorage.clear(); navigate('/')}} className="text-red-500 font-bold">Sair</button></div>
      </div>

      <div className="flex gap-4 border-b mb-6 overflow-x-auto">
        <button onClick={()=>setTab('projetos')} className={`pb-2 px-2 ${tab==='projetos'?'border-b-2 border-blue-600':''}`}>Projetos</button>
        <button onClick={()=>setTab('candidaturas')} className={`pb-2 px-2 ${tab==='candidaturas'?'border-b-2 border-blue-600':''}`}>Candidaturas</button>
        {user.role === 'docente' && <button onClick={()=>setTab('equipes')} className={`pb-2 px-2 text-indigo-700 ${tab==='equipes'?'border-b-2 border-indigo-600 font-bold':''}`}>👥 Minhas Equipes</button>}
        {user.role === 'discente' && <button onClick={()=>setTab('murais')} className={`pb-2 px-2 text-green-700 ${tab==='murais'?'border-b-2 border-green-600 font-bold':''}`}>🚀 Meus Murais</button>}
        {user.role === 'discente' && <button onClick={()=>setTab('perfil')} className={`pb-2 px-2 ${tab==='perfil'?'border-b-2 border-blue-600 font-bold':''}`}>Meu Perfil</button>}
      </div>

      {/* --- CONTEÚDO DAS ABAS --- */}
      
      {/* PROJETOS */}
      {tab === 'projetos' && (
        <>
          {user.role === 'docente' && <button onClick={()=>setNewProj(true)} className="bg-green-600 text-white px-4 py-2 rounded mb-4">+ Novo Projeto</button>}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.projects.map(p => (
              <div key={p.id} className="bg-white p-4 rounded shadow border hover:shadow-lg transition">
                <div className="flex justify-between mb-2"><h3 className="font-bold text-lg">{p.titulo}</h3><StatusBadge status={p.status} /></div>
                <p className="text-xs text-red-600 font-bold mb-2">{p.status === 'ABERTO' ? `Encerra em ${getDaysLeft(p.prazo_inscricao)} dias` : 'Encerrado'}</p>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{p.descricao}</p>
                <button onClick={()=>setViewProj(p)} className="text-blue-600 text-sm font-bold hover:underline">Ver Detalhes &rarr;</button>
                {user.role === 'discente' && p.status === 'ABERTO' && !myStatusInProject(p.id) && <button onClick={()=>apply(p.id)} className="block w-full mt-3 bg-blue-600 text-white py-1 rounded">Quero Participar</button>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* MURAIS */}
      {tab === 'murais' && (
        <div className="space-y-6">
          {data.applications.filter(app => app.status === 'ACEITA').length === 0 && <p className="text-gray-500">Nenhum projeto ativo.</p>}
          {data.applications.filter(app => app.status === 'ACEITA').map(app => (
            <div key={app.id} className="bg-white rounded-lg shadow-md border-l-8 border-green-500 p-6">
               <h3 className="text-2xl font-bold text-gray-800">{app.project?.titulo}</h3>
               <p className="text-gray-600 mb-4">Docente: {app.project?.docente?.nome}</p>
               <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg"><p className="font-bold text-yellow-800">📢 Mural da Equipe</p><p className="text-sm text-yellow-900">Bem-vindo ao time! Entre em contato com o docente para iniciar.</p></div>
            </div>
          ))}
        </div>
      )}

      {/* EQUIPES & PESQUISA */}
      {tab === 'equipes' && (
        <div className="space-y-8">
           <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
              <h3 className="font-bold text-lg mb-4 text-gray-700">🔍 Pesquisar Alunos</h3>
              <div className="flex gap-2">
                 <div className="relative flex-1"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><FaSearch className="w-5 h-5 text-gray-400" /></span><input className="py-2 text-sm rounded-md pl-10 pr-4 border w-full bg-gray-50" placeholder="Buscar por nome..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchStudents()} /></div>
                 <button onClick={searchStudents} className="bg-blue-600 text-white px-6 rounded font-bold">Buscar</button>
              </div>
              {searchResults.length > 0 && <div className="mt-4 border-t pt-4"><ul className="space-y-2">{searchResults.map(u => (<li key={u.id} className="flex justify-between items-center bg-gray-50 p-2 rounded"><div><p className="font-bold text-sm">{u.nome}</p><p className="text-xs text-gray-500">{u.email}</p></div><button className="text-xs text-blue-600 border border-blue-200 px-3 py-1 rounded" onClick={() => setViewStudent(u)}>Ver Perfil Completo</button></li>))}</ul></div>}
           </div>
           <div>
             <h3 className="text-xl font-bold text-gray-800 mb-4 pl-2 border-l-4 border-indigo-500">Gerenciar Projetos</h3>
             <div className="space-y-6">
               {data.projects.map(p => (
                 <div key={p.id} className="bg-white rounded shadow p-6">
                    <h3 className="text-lg font-bold mb-4 flex justify-between border-b pb-2">{p.titulo}<span className="text-sm font-normal text-gray-500">Membros: {p.applications?p.applications.length:0} / {p.vagas_totais}</span></h3>
                    {(!p.applications || p.applications.length === 0) ? <p className="text-gray-400 italic text-sm">Nenhum membro.</p> : (
                       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {p.applications.map(m => (<div key={m.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded border"><div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">{m.discente?.nome?.charAt(0).toUpperCase()}</div><div className="flex-1 overflow-hidden"><p className="font-bold text-sm truncate cursor-pointer hover:underline" onClick={() => setViewStudent(m.discente)}>{m.discente?.nome}</p><p className="text-xs text-gray-500 truncate">{m.discente?.email}</p></div><button onClick={() => manageApp(m.id, 'RECUSADA', true)} className="text-gray-400 hover:text-red-600 p-1 font-bold">✕</button></div>))}
                       </div>
                    )}
                 </div>
               ))}
             </div>
           </div>
        </div>
      )}

      {/* CANDIDATURAS */}
      {tab === 'candidaturas' && (
        <div className="bg-white rounded shadow p-4">
           {data.applications.map(app => (
             <div key={app.id} className="flex justify-between items-center border-b py-3 last:border-0">
               <div><p className="font-bold">{app.project?.titulo}</p>{user.role === 'docente' && <p className="text-sm text-gray-600 cursor-pointer hover:underline" onClick={() => setViewStudent(app.discente)}>Aluno: {app.discente?.nome}</p>}<p className="text-xs italic">"{app.mensagem}"</p></div>
               <div className="flex flex-col items-end gap-2"><StatusBadge status={app.status} />{user.role === 'docente' && app.status === 'PENDENTE' && (<div className="flex gap-2"><button onClick={()=>manageApp(app.id, 'ACEITA')} className="text-xs bg-green-100 text-green-700 px-2 rounded">Aceitar</button><button onClick={()=>manageApp(app.id, 'RECUSADA')} className="text-xs bg-red-100 text-red-700 px-2 rounded">Recusar</button></div>)}</div>
             </div>
           ))}
        </div>
      )}

      {/* PERFIL */}
      {tab === 'perfil' && (
        <form onSubmit={saveProfile} className="bg-white p-8 rounded shadow max-w-2xl mx-auto">
           <h3 className="font-bold text-xl mb-6 text-gray-800 border-b pb-2">Meu Perfil Acadêmico</h3>
           <div className="grid md:grid-cols-2 gap-4 mb-4">
              <label className="block"><span className="text-sm font-bold text-gray-700">Curso</span><input name="curso" defaultValue={data.profile.curso} className="border w-full p-2 rounded mt-1 bg-gray-50" /></label>
              <label className="block"><span className="text-sm font-bold text-gray-700">Campus</span><input name="campus" defaultValue={data.profile.campus} className="border w-full p-2 rounded mt-1 bg-gray-50" /></label>
              <label className="block"><span className="text-sm font-bold text-gray-700">Período Atual</span><select name="periodo" defaultValue={data.profile.periodo} className="border w-full p-2 rounded mt-1 bg-gray-50"><option value="">Selecione...</option>{[...Array(10)].map((_, i) => <option key={i} value={`${i+1}º`}>{i+1}º Período</option>)}<option value="Finalista">Finalista</option></select></label>
              <label className="block"><span className="text-sm font-bold text-gray-700">Telefone</span><input name="telefone" defaultValue={data.profile.telefone} className="border w-full p-2 rounded mt-1 bg-gray-50" placeholder="(99) 99999-9999" /></label>
           </div>
           <div className="mb-6"><span className="text-sm font-bold text-gray-700">Habilidades</span><div className="flex gap-2 mt-1 mb-2"><input value={skillInput} onChange={e => setSkillInput(e.target.value)} className="border flex-1 p-2 rounded bg-gray-50" placeholder="Ex: Python..." onKeyDown={e => e.key === 'Enter' && addSkill(e)}/><button type="button" onClick={addSkill} className="bg-blue-600 text-white px-4 rounded font-bold">Adicionar</button></div><div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-dashed rounded bg-gray-50">{skillsList.map((skill, index) => (<span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">{skill}<button type="button" onClick={() => removeSkill(index)} className="text-blue-400 hover:text-red-500 font-bold">✕</button></span>))}</div></div>
           <div className="grid md:grid-cols-2 gap-4 mb-6">
              <label className="block"><span className="text-sm font-bold text-gray-700">Link Lattes</span><input name="link_lattes" defaultValue={data.profile.link_lattes} className="border w-full p-2 rounded mt-1 bg-gray-50" placeholder="http://lattes.cnpq.br/..." /></label>
              <label className="block"><span className="text-sm font-bold text-gray-700">Link GitHub</span><input name="link_github" defaultValue={data.profile.link_github} className="border w-full p-2 rounded mt-1 bg-gray-50" placeholder="https://github.com/..." /></label>
           </div>
           <button className="bg-green-600 text-white w-full py-3 rounded font-bold text-lg shadow">Salvar Perfil</button>
        </form>
      )}

      {/* --- MODAL NOVO PROJETO (AGORA COM TEXTOS ESPECÍFICOS) --- */}
      {newProj && (
         <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
           <form onSubmit={saveProject} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto">
             <h3 className="font-bold text-2xl mb-6 text-gray-800 border-b pb-2">Cadastrar Novo Projeto</h3>
             <div className="mb-4">
               <label className="block text-sm font-bold text-gray-700 mb-1">Título do Projeto</label>
               <input name="titulo" placeholder="Ex: Desenvolvimento de API para Gestão Hospitalar" required className="border w-full p-3 rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none" />
             </div>
             <div className="mb-4">
               <label className="block text-sm font-bold text-gray-700 mb-1">Resumo / Descrição</label>
               <textarea name="descricao" placeholder="Descreva a metodologia, o problema a ser resolvido e a área de conhecimento envolvida..." className="border w-full p-3 rounded bg-gray-50 h-24" />
             </div>
             <div className="grid grid-cols-2 gap-4 mb-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Objetivos</label><textarea name="objetivos" placeholder="Ex: Desenvolver MVP, publicar artigo no congresso X..." className="border w-full p-3 rounded bg-gray-50 h-24" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Requisitos/Competências</label><textarea name="requisitos" placeholder="Ex: Domínio de Java, disponibilidade de 20h semanais..." className="border w-full p-3 rounded bg-gray-50 h-24" /></div>
             </div>
             <div className="grid grid-cols-2 gap-4 mb-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Campus</label><input name="campus" placeholder="Ex: Centro - Bloco C" className="w-full p-2 border rounded bg-gray-50" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Carga Horária (Total)</label><input name="carga_horaria" type="number" placeholder="Ex: 60" className="w-full p-2 border rounded bg-gray-50" /></div>
             </div>
             <div className="grid grid-cols-2 gap-4 mb-6">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Tipo</label><select name="tipo" className="border w-full p-2 rounded bg-gray-50"><option value="PESQUISA">Pesquisa</option><option value="EXTENSAO">Extensão</option><option value="VOLUNTARIO">Voluntário</option></select></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Vagas Disponíveis</label><input name="vagas_totais" type="number" defaultValue="1" min="1" className="border w-full p-2 rounded bg-gray-50" /></div>
             </div>
             <div className="mb-6"><label className="block text-sm font-bold text-gray-700 mb-1">Prazo Limite Inscrição (D+1)</label><input name="prazo_inscricao" type="date" required className="w-full p-2 border rounded bg-gray-50" /></div>
             <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={()=>setNewProj(false)} className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded">Cancelar</button><button className="bg-green-600 text-white px-8 py-2 rounded font-bold hover:bg-green-700 shadow-md">Criar Projeto</button></div>
           </form>
         </div>
      )}

      {/* --- MODAL PERFIL ALUNO (AGORA COMPLETO) --- */}
      {viewStudent && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
           <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-h-[90vh] overflow-auto relative">
             <button onClick={()=>setViewStudent(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold">✕</button>
             <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-3">{viewStudent.nome.charAt(0).toUpperCase()}</div>
                <h2 className="text-2xl font-bold text-gray-800">{viewStudent.nome}</h2>
                <p className="text-sm text-gray-500 mb-1 flex items-center justify-center gap-1"><FaEnvelope className="text-xs" /> {viewStudent.email}</p>
             </div>
             <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded text-sm border">
                   <p className="mb-1"><strong className="text-gray-700">Curso:</strong> {viewStudent.profile?.curso || <span className="text-gray-400 italic">Não informado</span>}</p>
                   <p className="mb-1"><strong className="text-gray-700">Campus:</strong> {viewStudent.profile?.campus || <span className="text-gray-400 italic">Não informado</span>}</p>
                   <p><strong className="text-gray-700">Período:</strong> {viewStudent.profile?.periodo || <span className="text-gray-400 italic">Não informado</span>}</p>
                </div>
                <div>
                   <h3 className="font-bold text-gray-700 text-sm mb-2 border-b pb-1">Competências</h3>
                   <div className="flex flex-wrap gap-1">
                      {renderSkills(viewStudent.profile?.habilidades) || <span className="text-xs text-gray-400 italic">Nenhuma registrada</span>}
                   </div>
                </div>
                <div>
                   <h3 className="font-bold text-gray-700 text-sm mb-2 border-b pb-1">Contato & Links</h3>
                   <div className="flex flex-col gap-3 mt-2">
                      {viewStudent.profile?.telefone ? (
                        <a href={`https://wa.me/55${viewStudent.profile.telefone.replace(/\D/g,'')}`} target="_blank" className="flex items-center gap-2 text-green-600 text-sm hover:underline bg-green-50 p-2 rounded border border-green-100">
                           <FaWhatsapp className="text-lg" /> <strong>WhatsApp:</strong> {viewStudent.profile.telefone}
                        </a>
                      ) : <span className="text-xs text-gray-400 pl-2">Telefone não informado</span>}

                      {viewStudent.profile?.link_lattes ? (
                        <a href={viewStudent.profile.link_lattes} target="_blank" className="flex items-center gap-2 text-blue-800 text-sm hover:underline bg-blue-50 p-2 rounded border border-blue-100">
                           <FaFileAlt className="text-lg" /> <strong>Lattes:</strong> Acessar Currículo <FaExternalLinkAlt className="text-xs" />
                        </a>
                      ) : <span className="text-xs text-gray-400 pl-2">Lattes não informado</span>}

                      {viewStudent.profile?.link_github ? (
                        <a href={viewStudent.profile.link_github} target="_blank" className="flex items-center gap-2 text-gray-800 text-sm hover:underline bg-gray-100 p-2 rounded border border-gray-200">
                           <FaGithub className="text-lg" /> <strong>Portfólio/Git:</strong> Acessar Link <FaExternalLinkAlt className="text-xs" />
                        </a>
                      ) : <span className="text-xs text-gray-400 pl-2">Portfólio não informado</span>}
                   </div>
                </div>
             </div>
           </div>
        </div>
      )}

      {/* MODAL DETALHES (Mantido igual) */}
{viewProj && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
           <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto relative">
             <button onClick={()=>setViewProj(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
             
             {/* Cabeçalho */}
             <div className="flex justify-between items-start mb-6 border-b pb-4">
                <div>
                   <h2 className="text-3xl font-bold text-gray-800">{viewProj.titulo}</h2>
                   <p className="text-sm text-gray-500 mt-1">Docente Responsável: <span className="font-semibold text-gray-700">{viewProj.docente?.nome}</span></p>
                </div>
                <StatusBadge status={viewProj.status} />
             </div>

             {/* Informações Rápidas (Grid) */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div>
                   <p className="text-xs text-gray-500 font-bold uppercase">Tipo</p>
                   <p className="text-sm text-gray-800">{viewProj.tipo}</p>
                </div>
                <div>
                   <p className="text-xs text-gray-500 font-bold uppercase">Campus</p>
                   <p className="text-sm text-gray-800">{viewProj.campus || '-'}</p>
                </div>
                <div>
                   <p className="text-xs text-gray-500 font-bold uppercase">Carga Horária</p>
                   <p className="text-sm text-gray-800">{viewProj.carga_horaria ? `${viewProj.carga_horaria}h` : '-'}</p>
                </div>
                <div>
                   <p className="text-xs text-gray-500 font-bold uppercase">Vagas</p>
                   <p className="text-sm text-gray-800">{viewProj.vagas_ocupadas} / {viewProj.vagas_totais}</p>
                </div>
             </div>

             <div className="space-y-6">
               {/* Descrição */}
               <div>
                 <h3 className="text-lg font-bold text-gray-800 mb-2 border-l-4 border-blue-500 pl-2">Resumo do Projeto</h3>
                 <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{viewProj.descricao}</p>
               </div>

               {/* Objetivos */}
               <div>
                 <h3 className="text-lg font-bold text-gray-800 mb-2 border-l-4 border-indigo-500 pl-2">Objetivos</h3>
                 <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{viewProj.objetivos || "Não especificado."}</p>
               </div>

               {/* Requisitos */}
               <div>
                 <h3 className="text-lg font-bold text-gray-800 mb-2 border-l-4 border-purple-500 pl-2">Requisitos e Competências</h3>
                 <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{viewProj.requisitos || "Não especificado."}</p>
               </div>
             </div>

             {/* Rodapé com Prazo e Botão */}
             <div className="mt-8 pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm">
                   <p className="text-gray-500">Prazo de inscrição até:</p>
                   <p className="font-bold text-red-600">
                      {new Date(viewProj.prazo_inscricao).toLocaleDateString()} 
                      <span className="font-normal text-gray-500 ml-1">({getDaysLeft(viewProj.prazo_inscricao)} dias restantes)</span>
                   </p>
                </div>

                {user.role === 'discente' && !myStatusInProject(viewProj.id) && viewProj.status === 'ABERTO' && (
                   <button onClick={()=>{apply(viewProj.id); setViewProj(null)}} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg transition w-full md:w-auto">
                      Quero Participar!
                   </button>
                )}
             </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}