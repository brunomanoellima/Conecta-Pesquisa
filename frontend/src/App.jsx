import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { 
  FaSearch, FaGithub, FaFileAlt, FaWhatsapp, FaCalendarAlt, FaClock, FaMapMarkerAlt, 
  FaUserGraduate, FaEnvelope, FaExternalLinkAlt, FaTimes, FaUniversity, 
  FaLayerGroup, FaClipboardList, FaUsers, FaRocket, FaUserCircle, FaPowerOff, 
  FaChevronLeft, FaChevronRight, FaBullhorn, FaPaperPlane, FaTrash, FaPlus, FaListUl, FaCheck
} from 'react-icons/fa';
import Slider from "react-slick"; 
import api from './api';

// --- UTILITÁRIOS ---
const checkExpired = (dateString) => {
  if (!dateString) return false;
  const deadline = new Date(dateString);
  deadline.setHours(23, 59, 59, 999);
  return new Date() > deadline;
};

const getDaysLeft = (dateString) => {
  if (!dateString) return 0;
  const deadline = new Date(dateString);
  deadline.setHours(23, 59, 59, 999);
  const diff = deadline - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "" : date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const StatusBadge = ({ status, expired }) => {
  if (status === 'ABERTO' && expired) {
    return <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gray-200 text-gray-600 border border-gray-300">Prazo Vencido</span>;
  }
  const styles = {
    'ABERTO': 'bg-green-100 text-green-700 border border-green-200',
    'CONCLUIDO': 'bg-gray-100 text-gray-600 border border-gray-200',
    'PENDENTE': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    'ACEITA': 'bg-blue-100 text-blue-700 border border-blue-200',
    'RECUSADA': 'bg-red-50 text-red-600 border border-red-200',
    'NAO_AVALIADA_ENCERRADA': 'bg-gray-200 text-gray-500 border border-gray-300'
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
};

// --- SETAS ---
function SampleNextArrow(props) {
  const { onClick } = props;
  return <div className="absolute top-1/2 -translate-y-1/2 right-8 z-20 cursor-pointer text-white opacity-60 hover:opacity-100 transition-all hover:scale-110 drop-shadow-lg" onClick={onClick}><FaChevronRight className="text-5xl" /></div>;
}

function SamplePrevArrow(props) {
  const { onClick } = props;
  return <div className="absolute top-1/2 -translate-y-1/2 left-8 z-20 cursor-pointer text-white opacity-60 hover:opacity-100 transition-all hover:scale-110 drop-shadow-lg" onClick={onClick}><FaChevronLeft className="text-5xl" /></div>;
}

// --- COMPONENTE DE SEGURANÇA (Obrigatório) ---
// Este componente verifica se o usuário tem um token válido.
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // Se não tiver token, redireciona para o Login (/)
  return token ? children : <Navigate to="/" replace />;
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
    } catch { alert('Login falhou.'); }
  };
  return (
    <div className="h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <form onSubmit={handle} className="bg-white p-10 rounded-2xl shadow-xl w-96 border border-white/50">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-6 text-center">Conecta Pesquisa</h2>
        <input className="border w-full p-3 rounded-lg mb-3" placeholder="Email" onChange={e=>setForm({...form, email:e.target.value})} />
        <input className="border w-full p-3 rounded-lg mb-4" type="password" placeholder="Senha" onChange={e=>setForm({...form, password:e.target.value})} />
        <button className="bg-blue-600 text-white w-full py-3 rounded-lg font-bold hover:bg-blue-700">Entrar</button>
        <Link to="/register" className="block text-center mt-4 text-sm text-blue-600 hover:underline">Criar Conta</Link>
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
    <div className="h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <form onSubmit={handle} className="bg-white p-10 rounded-2xl shadow-xl w-96 border border-white/50">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-6 text-center">Criar Conta</h2>
        <input className="border w-full p-3 rounded-lg mb-3" placeholder="Nome" onChange={e=>setForm({...form, nome:e.target.value})} />
        <input className="border w-full p-3 rounded-lg mb-3" placeholder="Email" onChange={e=>setForm({...form, email:e.target.value})} />
        <input className="border w-full p-3 rounded-lg mb-3" type="password" placeholder="Senha" onChange={e=>setForm({...form, password:e.target.value})} />
        <select className="border w-full p-3 rounded-lg mb-6" onChange={e=>setForm({...form, role:e.target.value})}>
            <option value="discente">Sou Aluno</option>
            <option value="docente">Sou Professor</option>
        </select>
        <button className="bg-green-600 text-white w-full py-3 rounded-lg font-bold hover:bg-green-700">Cadastrar</button>
        <Link to="/" className="block text-center mt-4 text-sm text-blue-600 hover:underline">Voltar para Login</Link>
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
  
  // States Perfil Aluno
  const [skillsList, setSkillsList] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  
  // States Criação de Projeto (Docente) - LISTAS DINÂMICAS
  const [objList, setObjList] = useState([]);
  const [objInput, setObjInput] = useState('');
  const [reqList, setReqList] = useState([]);
  const [reqInput, setReqInput] = useState('');

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [viewProj, setViewProj] = useState(null); 
  const [newProj, setNewProj] = useState(false); 
  const [viewStudent, setViewStudent] = useState(null);
  const [postContent, setPostContent] = useState({});

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

  const carouselSettings = {
    dots: true, infinite: true, speed: 1000, slidesToShow: 1, slidesToScroll: 1,
    autoplay: true, autoplaySpeed: 6000, arrows: true, fade: true,
    nextArrow: <SampleNextArrow />, prevArrow: <SamplePrevArrow />,
    appendDots: dots => <div style={{ bottom: "20px" }}><ul className="m-0 p-0"> {dots} </ul></div>,
    customPaging: i => <div className="w-3 h-3 mx-1 bg-white/50 rounded-full transition-all hover:bg-white hover:scale-110"></div>
  };

  const carouselSlides = [
    { id: 1, title: "Explore o Conhecimento", desc: "Conecte-se com projetos inovadores e professores experientes.", img: "/imagens/pesquisa.jpg", btnText: "Ver Pesquisas" },
    { id: 2, title: "Ações de Extensão", desc: "Conecte a universidade com a comunidade.", img: "/imagens/Extensao.jpg", btnText: "Ver Extensão" },
    { id: 3, title: "Trabalho Voluntário", desc: "Contribua com seu tempo e habilidades.", img: "/imagens/Volutario.jpg", btnText: "Ser Voluntário" }
  ];

  // --- MANIPULAÇÃO DE LISTAS ---
  const addSkill = (e) => { e.preventDefault(); if (skillInput.trim()) { setSkillsList([...skillsList, skillInput.trim()]); setSkillInput(''); } };
  const removeSkill = (i) => setSkillsList(skillsList.filter((_, idx) => idx !== i));
  
  const addObj = (e) => { e.preventDefault(); if (objInput.trim()) { setObjList([...objList, objInput.trim()]); setObjInput(''); } };
  const removeObj = (i) => setObjList(objList.filter((_, idx) => idx !== i));
  
  const addReq = (e) => { e.preventDefault(); if (reqInput.trim()) { setReqList([...reqList, reqInput.trim()]); setReqInput(''); } };
  const removeReq = (i) => setReqList(reqList.filter((_, idx) => idx !== i));

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
    
    // Salva as listas como JSON string para o backend
    body.objetivos = JSON.stringify(objList);
    body.requisitos = JSON.stringify(reqList);

    try { await api.post('/projects', body); setNewProj(false); load(); alert('Projeto Criado!'); setObjList([]); setReqList([]); } 
    catch (err) { alert(err.response?.data?.error || 'Erro'); }
  };

  const manageApp = async (id, status, isRemoval) => {
    let reason = '';
    if(isRemoval) { reason = prompt("Motivo da remoção:"); if(!reason) return; }
    try { await api.put(`/applications/${id}`, { status, reason }); load(); } catch (err) { alert(err.response?.data?.error); }
  };

  const postToMural = async (projectId) => {
    const content = postContent[projectId];
    if(!content) return;
    try { await api.post(`/projects/${projectId}/mural`, { content }); alert('Publicado!'); setPostContent({ ...postContent, [projectId]: '' }); load(); } 
    catch(e) { alert('Erro ao postar'); }
  };

  const searchStudents = async () => { const res = await api.get(`/users/search?nome=${search}`); setSearchResults(res.data); };
  const myStatusInProject = (pid) => { if(user.role!=='discente')return null; const app=data.applications.find(a=>a.project_id===pid); return app?app.status:null; };
  
  // Renderiza listas salvas como JSON (Habilidades, Objetivos, Requisitos)
  const renderList = (json, color = "blue") => { 
    try { 
      const s=JSON.parse(json); 
      if (Array.isArray(s)) return (
        <ul className="list-disc pl-5 space-y-1">
          {s.map((x,i)=><li key={i} className={`text-sm text-gray-700`}>{x}</li>)}
        </ul>
      );
      return <p className="text-sm text-gray-600 whitespace-pre-wrap">{json}</p>; // Fallback para texto antigo
    } catch { return <p className="text-sm text-gray-600 whitespace-pre-wrap">{json}</p>; } 
  };

  const renderSkills = (json) => { try { const s=JSON.parse(json); return Array.isArray(s)?s.map((x,i)=><span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{x}</span>):null; } catch { return null; } };

  const MenuIcon = ({ id }) => {
      if(id === 'projetos') return <FaLayerGroup className="text-lg"/>;
      if(id === 'candidaturas') return <FaClipboardList className="text-lg"/>;
      if(id === 'equipes') return <FaUsers className="text-lg"/>;
      if(id === 'murais') return <FaRocket className="text-lg"/>;
      if(id === 'perfil') return <FaUserCircle className="text-lg"/>;
      return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* HEADER */}
      <header className="bg-white shadow-md sticky top-0 z-30 w-full border-b border-gray-100">
        <div className="w-full px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="bg-blue-700 text-white p-2 rounded-xl font-bold text-xl shadow-md shadow-blue-100"><FaUniversity/></div>
                <div><h1 className="text-xl font-bold text-gray-800 tracking-tight">Conecta Pesquisa</h1><p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Painel {user.role}</p></div>
            </div>
            <div><button onClick={()=>{localStorage.clear(); navigate('/')}} className="group flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm border border-red-100"><FaPowerOff className="group-hover:rotate-90 transition-transform duration-300"/><span>Sair da Conta</span></button></div>
        </div>
      </header>

      <main className="w-full px-8 py-8">
        {/* MENU */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 w-full bg-white p-3 rounded-2xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
            {[
              { id: 'projetos', label: 'Projetos', role: 'both' },
              { id: 'candidaturas', label: 'Candidaturas', role: 'both' },
              { id: 'equipes', label: 'Minhas Equipes', role: 'docente' },
              { id: 'murais', label: 'Meus Murais', role: 'discente' },
              { id: 'perfil', label: 'Meu Perfil', role: 'discente' }
            ].filter(item => item.role === 'both' || item.role === user.role).map(item => (
                <button key={item.id} onClick={()=>setTab(item.id)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${tab===item.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}><MenuIcon id={item.id} />{item.label}</button>
            ))}
        </div>

        {/* CARROSSEL */}
        {user.role === 'discente' && tab === 'projetos' && (
            <div className="mb-10 rounded-2xl overflow-hidden shadow-2xl animate-fadeIn w-full relative group">
                <Slider {...carouselSettings}>
                    {carouselSlides.map(slide => (
                        <div key={slide.id} className="h-[500px] relative overflow-hidden outline-none">
                            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105" style={{backgroundImage: `url('${slide.img}')`}}></div>
                            <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center px-12">
                                <h2 className="text-5xl font-extrabold mb-4 text-white drop-shadow-xl">{slide.title}</h2>
                                <p className="text-xl text-white/90 max-w-2xl font-light leading-relaxed drop-shadow-md">{slide.desc}</p>
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        )}

        {/* ABA PROJETOS */}
        {tab === 'projetos' && (
            <div id="lista-projetos" className="animate-fadeIn w-full">
                {user.role === 'docente' && (
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Projetos Gerenciados</h2>
                        <button onClick={()=>setNewProj(true)} className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-md hover:bg-green-700 transition flex items-center gap-2"><span className="text-lg">+</span> Novo Projeto</button>
                    </div>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                    {data.projects.map(p => {
                        const expired = checkExpired(p.prazo_inscricao);
                        return (
                            <div key={p.id} className={`bg-white p-6 rounded-xl shadow-sm border hover:shadow-xl transition-all duration-300 flex flex-col group h-full ${expired ? 'border-gray-100 opacity-75' : 'border-gray-200 hover:border-blue-300'}`}>
                                <div className="flex justify-between items-start mb-4"><span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">{p.tipo}</span><StatusBadge status={p.status} expired={expired} /></div>
                                <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-700 transition line-clamp-2">{p.titulo}</h3>
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4"><span className="flex items-center gap-1"><FaMapMarkerAlt/> {p.campus || 'N/A'}</span><span className="flex items-center gap-1"><FaClock/> {p.carga_horaria}h</span></div>
                                <p className="text-sm text-gray-600 mb-6 line-clamp-3 flex-grow leading-relaxed">{p.descricao}</p>
                                {p.status === 'ABERTO' && (<div className={`text-xs font-bold mb-3 flex items-center gap-1 ${expired ? 'text-gray-500' : 'text-red-500'}`}><FaClock className={expired ? '' : 'animate-pulse'}/> {expired ? 'Encerrado' : `Encerra em ${getDaysLeft(p.prazo_inscricao)} dias`}</div>)}
                                <div className="mt-auto">
                                    <button onClick={()=>setViewProj(p)} className="w-full py-3 rounded-lg border border-blue-200 text-blue-600 font-bold hover:bg-blue-50 transition mb-2">Ver Detalhes</button>
                                    {user.role === 'discente' && p.status === 'ABERTO' && !myStatusInProject(p.id) && !expired && (<button onClick={()=>apply(p.id)} className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md transition">Quero Participar</button>)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* OUTRAS ABAS (Mural, Equipes, Candidaturas, Perfil) mantidas iguais ao anterior... */}
        {/* ... Copie o restante do código anterior para essas abas, pois só mudamos o Modal de Novo Projeto e a Visualização de Detalhes ... */}
        {/* VOU INCLUIR AQUI APENAS AS PARTES QUE MUDARAM DRASTICAMENTE (MODAL E VISUALIZAÇÃO) PARA CABER NA RESPOSTA */}
        
        {/* --- ABA MINHAS EQUIPES (COM BUSCA) --- */}
        {tab === 'equipes' && (
            <div className="space-y-8 animate-fadeIn w-full">
               <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 w-full">
                  <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2 border-b pb-2"><FaSearch className="text-blue-600"/> Buscar Alunos</h3>
                  <div className="flex gap-2 mb-4"><input className="py-2 px-3 text-sm rounded-lg border w-full bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Nome do aluno..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchStudents()} /><button onClick={searchStudents} className="bg-blue-600 text-white px-4 rounded-lg font-bold hover:bg-blue-700">Buscar</button></div>
                  {searchResults.length > 0 && <ul className="space-y-2 max-h-[300px] overflow-y-auto mt-4 border-t pt-2">{searchResults.map(u => (<li key={u.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-blue-50 transition cursor-pointer group" onClick={() => setViewStudent(u)}><div><p className="font-bold text-sm text-gray-800 group-hover:text-blue-700">{u.nome}</p><p className="text-xs text-gray-500">{u.email}</p></div><span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition">Ver Perfil</span></li>))}</ul>}
               </div>
               {/* Lista de Projetos Vertical */}
               <div className="space-y-8">
                 {data.projects.map(p => (
                   <div key={p.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden w-full">
                      <div className="p-6 border-b bg-gray-50 flex justify-between items-center"><div><h3 className="font-bold text-xl text-gray-800">{p.titulo}</h3><p className="text-xs text-gray-500 uppercase font-bold mt-1">{p.tipo}</p></div><span className="text-xs font-bold text-gray-600 bg-white px-3 py-1 rounded-full border shadow-sm">Vagas: {p.applications?p.applications.length:0}/{p.vagas_totais}</span></div>
                      <div className="p-6">
                         <h4 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2"><FaUsers className="text-blue-500"/> Membros da Equipe</h4>
                         {(!p.applications || p.applications.length === 0) ? <div className="bg-gray-50 border border-dashed border-gray-300 p-4 rounded-lg text-center mb-8"><p className="text-gray-400 italic text-sm">Nenhum aluno aprovado nesta equipe ainda.</p></div> : (<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">{p.applications.map(m => (<div key={m.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 bg-gray-50 hover:border-blue-200 hover:shadow-sm transition group"><div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewStudent(m.discente)}><div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm shadow-sm">{m.discente?.nome?.charAt(0).toUpperCase()}</div><div className="overflow-hidden"><p className="font-bold text-sm text-gray-800 group-hover:text-blue-700 truncate w-32">{m.discente?.nome}</p><p className="text-xs text-gray-500 truncate w-32">{m.discente?.email}</p></div></div><button onClick={() => manageApp(m.id, 'RECUSADA', true)} className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition" title="Remover Aluno"><FaTrash/></button></div>))}</div>)}
                         <div className="bg-blue-50 p-6 rounded-xl border border-blue-100"><h4 className="text-sm font-bold text-blue-800 uppercase mb-3 flex items-center gap-2"><FaBullhorn/> Mural de Avisos do Projeto</h4><div className="flex gap-2 mb-4"><textarea className="w-full border border-blue-200 rounded-lg p-3 text-sm bg-white focus:ring-2 focus:ring-blue-300 outline-none resize-none h-20 shadow-sm" placeholder="Escreva um aviso importante para a equipe..." value={postContent[p.id] || ''} onChange={(e) => setPostContent({ ...postContent, [p.id]: e.target.value })}/><div className="flex justify-end"><button onClick={() => postToMural(p.id)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md flex items-center gap-2 transition"><FaPaperPlane className="text-sm"/> Publicar</button></div></div>{p.mural_posts?.length > 0 && (<div className="bg-white rounded-lg border border-blue-100 max-h-60 overflow-y-auto divide-y divide-gray-100 shadow-inner">{p.mural_posts.map(post => (<div key={post.id} className="p-4 hover:bg-gray-50 transition"><p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p><p className="text-xs text-gray-400 mt-2 flex justify-end items-center gap-1"><FaClock className="text-[10px]"/> {formatDate(post.createdAt || post.created_at)}</p></div>))}</div>)}</div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
        )}

        {/* ABAS RESTANTES (Mural Discente, Candidaturas, Perfil) */}
        {tab === 'murais' && (
            <div className="space-y-6 animate-fadeIn w-full max-w-7xl mx-auto">
                {data.applications.filter(app => app.status === 'ACEITA').length === 0 && <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300"><FaUserGraduate className="text-6xl text-gray-300 mx-auto mb-4"/><p className="text-gray-500 text-lg">Você ainda não participa de nenhum projeto.</p></div>}
                {data.applications.filter(app => app.status === 'ACEITA').map(app => (
                    <div key={app.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white"><h3 className="text-2xl font-bold">{app.project?.titulo}</h3><p className="opacity-90 mt-1 flex items-center gap-2"><FaUserGraduate/> Orientador: {app.project?.docente?.nome}</p></div>
                        <div className="p-6">
                            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl flex items-start gap-4 shadow-sm mb-6"><span className="text-4xl">🎉</span><div><h4 className="font-bold text-yellow-900 text-lg mb-2">Bem-vindo(a) à Equipe!</h4><p className="text-yellow-800 leading-relaxed text-sm">Sua participação foi aprovada.</p></div></div>
                            <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2"><FaBullhorn className="text-orange-500"/> Quadro de Avisos</h4>
                            <div className="space-y-4">{app.project?.mural_posts?.length > 0 ? (app.project.mural_posts.map(post => (<div key={post.id} className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm"><p className="text-gray-800 text-sm whitespace-pre-wrap">{post.content}</p><p className="text-xs text-gray-500 mt-2 text-right">{formatDate(post.createdAt || post.created_at)}</p></div>))) : <p className="text-gray-400 italic text-sm">Nenhum aviso publicado.</p>}</div>
                        </div>
                    </div>
                ))}
            </div>
        )}
        
        {/* ABA CANDIDATURAS */}
        {tab === 'candidaturas' && (
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-slideIn">
                {data.applications.map(app => (
                    <div key={app.id} className="p-6 border-b last:border-0 hover:bg-gray-50 transition flex justify-between items-center">
                        <div><p className="font-bold text-gray-800 text-lg">{app.project?.titulo}</p>{user.role === 'docente' && <p className="text-sm text-blue-600 cursor-pointer hover:underline mt-1" onClick={() => setViewStudent(app.discente)}>Candidato: {app.discente?.nome}</p>}<p className="text-sm text-gray-500 italic mt-2 bg-gray-100 p-2 rounded inline-block">"{app.mensagem}"</p></div>
                        <div className="text-right flex flex-col items-end gap-3"><StatusBadge status={app.status} />{user.role === 'docente' && app.status === 'PENDENTE' && (<div className="flex gap-2"><button onClick={()=>manageApp(app.id, 'ACEITA')} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-green-700 shadow-sm">Aceitar</button><button onClick={()=>manageApp(app.id, 'RECUSADA')} className="border border-red-200 text-red-600 px-3 py-1.5 rounded text-sm font-bold hover:bg-red-50">Recusar</button></div>)}</div>
                    </div>
                ))}
            </div>
        )}

        {/* ABA PERFIL */}
        {tab === 'perfil' && (
            <form onSubmit={saveProfile} className="bg-white p-8 rounded-xl shadow-md border border-gray-100 max-w-3xl mx-auto animate-fadeIn">
               <h3 className="font-bold text-2xl mb-8 text-gray-800 pb-2 border-b flex items-center gap-2"><FaUserGraduate className="text-blue-600"/> Meu Perfil</h3>
               <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">Curso</label><input name="curso" defaultValue={data.profile.curso} className="border w-full p-3 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">Campus</label><input name="campus" defaultValue={data.profile.campus} className="border w-full p-3 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">Período</label><select name="periodo" defaultValue={data.profile.periodo} className="border w-full p-3 rounded-lg bg-gray-50"><option value="">Selecione...</option>{[...Array(10)].map((_, i) => <option key={i} value={`${i+1}º`}>{i+1}º Período</option>)}<option value="Finalista">Finalista</option></select></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">Telefone</label><input name="telefone" defaultValue={data.profile.telefone} className="border w-full p-3 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition" /></div>
               </div>
               <div className="mb-6"><label className="block text-sm font-bold text-gray-700 mb-2">Habilidades</label><div className="flex gap-2 mb-3"><input value={skillInput} onChange={e => setSkillInput(e.target.value)} className="border flex-1 p-3 rounded-lg" placeholder="Ex: Python..." onKeyDown={e => e.key === 'Enter' && addSkill(e)}/><button type="button" onClick={addSkill} className="bg-blue-600 text-white px-5 rounded-lg font-bold">Adicionar</button></div><div className="flex flex-wrap gap-2 min-h-[50px] p-3 border border-dashed rounded-lg bg-gray-50">{skillsList.map((skill, index) => (<span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">{skill}<button type="button" onClick={() => removeSkill(index)} className="text-blue-400 hover:text-red-500">✕</button></span>))}</div></div>
               <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">Lattes</label><input name="link_lattes" defaultValue={data.profile.link_lattes} className="border w-full p-3 rounded-lg" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">GitHub</label><input name="link_github" defaultValue={data.profile.link_github} className="border w-full p-3 rounded-lg" /></div>
               </div>
               <button className="bg-green-600 text-white w-full py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-green-700 transition">Salvar Alterações</button>
            </form>
        )}

      </main>

      {/* --- MODAIS --- */}

      {/* MODAL NOVO PROJETO (COM LISTA DINÂMICA) */}
      {newProj && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
           <form onSubmit={saveProject} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
             <div className="flex justify-between items-center mb-6 border-b pb-4"><h3 className="font-bold text-2xl text-gray-800">Novo Projeto</h3><button type="button" onClick={()=>setNewProj(false)} className="text-gray-400 hover:text-gray-600"><FaTimes className="text-xl"/></button></div>
             
             <div className="space-y-4">
               <div><label className="block text-sm font-bold text-gray-700 mb-1">Título</label><input name="titulo" required placeholder="Ex: Desenvolvimento de API..." className="border w-full p-3 rounded-lg bg-gray-50 focus:bg-white" /></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label><textarea name="descricao" placeholder="Descreva o projeto..." className="border w-full p-3 rounded-lg bg-gray-50 h-24 resize-none" /></div>
               
               {/* LISTA DINÂMICA: OBJETIVOS */}
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Objetivos</label>
                  <div className="flex gap-2 mb-2"><input value={objInput} onChange={e => setObjInput(e.target.value)} className="border flex-1 p-2 rounded bg-gray-50" placeholder="Ex: Desenvolver MVP..." onKeyDown={e => e.key === 'Enter' && addObj(e)}/><button type="button" onClick={addObj} className="bg-blue-100 text-blue-700 px-3 rounded hover:bg-blue-200 font-bold">+</button></div>
                  {objList.length > 0 && <ul className="list-disc pl-5 text-sm text-gray-700 bg-gray-50 p-2 rounded border border-dashed">{objList.map((x,i) => <li key={i} className="flex justify-between">{x} <button type="button" onClick={()=>removeObj(i)} className="text-red-400 hover:text-red-600 ml-2">x</button></li>)}</ul>}
               </div>

               {/* LISTA DINÂMICA: REQUISITOS */}
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Requisitos</label>
                  <div className="flex gap-2 mb-2"><input value={reqInput} onChange={e => setReqInput(e.target.value)} className="border flex-1 p-2 rounded bg-gray-50" placeholder="Ex: Conhecimento em React..." onKeyDown={e => e.key === 'Enter' && addReq(e)}/><button type="button" onClick={addReq} className="bg-blue-100 text-blue-700 px-3 rounded hover:bg-blue-200 font-bold">+</button></div>
                  {reqList.length > 0 && <ul className="list-disc pl-5 text-sm text-gray-700 bg-gray-50 p-2 rounded border border-dashed">{reqList.map((x,i) => <li key={i} className="flex justify-between">{x} <button type="button" onClick={()=>removeReq(i)} className="text-red-400 hover:text-red-600 ml-2">x</button></li>)}</ul>}
               </div>

               <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-bold text-gray-700 mb-1">Campus</label><input name="campus" placeholder="Ex: Centro" className="w-full p-2 border rounded-lg bg-gray-50" /></div><div><label className="block text-sm font-bold text-gray-700 mb-1">Carga Horária</label><input name="carga_horaria" type="number" placeholder="Ex: 40" className="w-full p-2 border rounded-lg bg-gray-50" /></div></div>
               <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-bold text-gray-700 mb-1">Tipo</label><select name="tipo" className="w-full p-2 border rounded-lg bg-gray-50"><option value="PESQUISA">Pesquisa</option><option value="EXTENSAO">Extensão</option><option value="VOLUNTARIO">Voluntário</option></select></div><div><label className="block text-sm font-bold text-gray-700 mb-1">Vagas</label><input name="vagas_totais" type="number" defaultValue="1" min="1" className="w-full p-2 border rounded-lg bg-gray-50" /></div></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-1">Prazo (D+1)</label><input name="prazo_inscricao" type="date" required className="w-full p-2 border rounded-lg bg-gray-50 cursor-pointer" /></div>
             </div>
             <div className="flex justify-end gap-3 pt-6 border-t mt-6"><button type="button" onClick={()=>setNewProj(false)} className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancelar</button><button className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold shadow-md hover:bg-green-700">Criar Projeto</button></div>
           </form>
         </div>
      )}

      {/* MODAL DETALHES (COM LISTA RENDERIZADA) */}
      {viewProj && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
           <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto relative">
             <button onClick={()=>setViewProj(null)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
             <div className="flex justify-between items-start mb-6 border-b pb-4"><div><h2 className="text-3xl font-bold text-gray-900">{viewProj.titulo}</h2><p className="text-sm text-gray-500 mt-1">Docente Responsável: <span className="font-semibold text-blue-800">{viewProj.docente?.nome}</span></p></div><StatusBadge status={viewProj.status} expired={checkExpired(viewProj.prazo_inscricao)} /></div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div><p className="text-xs text-blue-500 font-bold uppercase">Tipo</p><p className="font-bold text-blue-900">{viewProj.tipo}</p></div>
                <div><p className="text-xs text-blue-500 font-bold uppercase">Campus</p><p className="font-bold text-blue-900">{viewProj.campus || '-'}</p></div>
                <div><p className="text-xs text-blue-500 font-bold uppercase">Carga</p><p className="font-bold text-blue-900">{viewProj.carga_horaria}h</p></div>
                <div><p className="text-xs text-blue-500 font-bold uppercase">Vagas</p><p className="font-bold text-blue-900">{viewProj.vagas_ocupadas} / {viewProj.vagas_totais}</p></div>
             </div>
             <div className="space-y-6 text-gray-700">
                <div><h3 className="font-bold text-gray-900 mb-2">Resumo</h3><p className="leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">{viewProj.descricao}</p></div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div><h3 className="font-bold text-gray-900 mb-2 border-l-4 border-indigo-500 pl-3">Objetivos</h3>{renderList(viewProj.objetivos)}</div>
                    <div><h3 className="font-bold text-gray-900 mb-2 border-l-4 border-purple-500 pl-3">Requisitos</h3>{renderList(viewProj.requisitos)}</div>
                </div>
             </div>
             <div className="mt-8 pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4">
                <div className={`text-sm font-medium flex items-center gap-2 px-3 py-2 rounded-lg ${checkExpired(viewProj.prazo_inscricao) ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-600'}`}><FaClock/>{checkExpired(viewProj.prazo_inscricao) ? 'Inscrições Encerradas' : `Inscrições até ${new Date(viewProj.prazo_inscricao).toLocaleDateString()}`}</div>
                {user.role === 'discente' && !myStatusInProject(viewProj.id) && viewProj.status === 'ABERTO' && !checkExpired(viewProj.prazo_inscricao) && (<button onClick={()=>{apply(viewProj.id); setViewProj(null)}} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition w-full md:w-auto">Quero Participar</button>)}
             </div>
           </div>
        </div>
      )}

      {/* MODAL PERFIL ALUNO (COMPLETO E BONITO) */}
      {viewStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
           <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative animate-slideIn">
             <button onClick={()=>setViewStudent(null)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
             <div className="text-center mb-8"><div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4 shadow-lg">{viewStudent.nome.charAt(0).toUpperCase()}</div><h2 className="text-2xl font-bold text-gray-800">{viewStudent.nome}</h2><p className="text-sm text-gray-500 flex items-center justify-center gap-2 bg-gray-100 py-1 px-3 rounded-full inline-block mt-2"><FaEnvelope /> {viewStudent.email}</p></div>
             <div className="space-y-6">
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 text-sm space-y-2"><p className="flex justify-between"><span className="font-bold text-gray-600">Curso:</span> {viewStudent.profile?.curso || '-'}</p><p className="flex justify-between"><span className="font-bold text-gray-600">Campus:</span> {viewStudent.profile?.campus || '-'}</p><p className="flex justify-between"><span className="font-bold text-gray-600">Período:</span> <span className="bg-blue-100 text-blue-800 px-2 rounded-full font-bold">{viewStudent.profile?.periodo || '-'}</span></p></div>
                <div><h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2 border-b pb-2"><FaUserGraduate className="text-indigo-500"/> Competências</h3><div className="flex flex-wrap gap-2">{renderSkills(viewStudent.profile?.habilidades)}</div></div>
                <div><h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2 border-b pb-2">Contato & Links</h3><div className="flex flex-col gap-3">{viewStudent.profile?.telefone ? (<a href={`https://wa.me/55${viewStudent.profile.telefone.replace(/\D/g,'')}`} target="_blank" className="flex items-center gap-3 text-green-700 bg-green-50 p-3 rounded-lg border border-green-100 hover:bg-green-100 transition font-medium"><FaWhatsapp className="text-xl" /> WhatsApp: {viewStudent.profile.telefone}</a>) : <span className="text-sm text-gray-400 italic pl-2">Telefone não informado</span>}<div className="flex gap-3">{viewStudent.profile?.link_lattes ? (<a href={viewStudent.profile.link_lattes} target="_blank" className="flex-1 flex items-center justify-center gap-2 text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-100 hover:bg-blue-100 transition font-medium text-sm"><FaFileAlt /> Lattes <FaExternalLinkAlt className="text-xs"/></a>) : <span className="flex-1 text-sm text-gray-400 italic text-center bg-gray-50 p-3 rounded-lg border">Sem Lattes</span>}{viewStudent.profile?.link_github ? (<a href={viewStudent.profile.link_github} target="_blank" className="flex-1 flex items-center justify-center gap-2 text-gray-800 bg-gray-100 p-3 rounded-lg border border-gray-200 hover:bg-gray-200 transition font-medium text-sm"><FaGithub /> GitHub <FaExternalLinkAlt className="text-xs"/></a>) : <span className="flex-1 text-sm text-gray-400 italic text-center bg-gray-50 p-3 rounded-lg border">Sem GitHub</span>}</div></div></div>
             </div>
           </div>
        </div>
      )}

    </div>
  );
}

export default function App() { return <BrowserRouter><Routes><Route path="/" element={<Login />} /><Route path="/register" element={<Register />} /><Route path="/dashboard" element={<Dashboard />} /></Routes></BrowserRouter>; }