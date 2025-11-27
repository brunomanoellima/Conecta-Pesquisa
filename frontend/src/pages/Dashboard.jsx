import { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [novoTitulo, setNovoTitulo] = useState('');

  // Carrega dados ao abrir
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Busca projetos
      const resProj = await api.get('/projects');
      setProjects(resProj.data);

      // Busca candidaturas (Nova rota que criamos)
      const resApp = await api.get('/api/applications');
      setApplications(resApp.data || []);
    } catch (e) { console.error("Erro ao carregar dados"); }
  };

  // DOCENTE: Criar Projeto
  const handleCreateProject = async () => {
    if (!novoTitulo) return alert("Digite um título");
    await api.post('/projects', { titulo: novoTitulo, prazo_inscricao: new Date() });
    setNovoTitulo('');
    loadData();
  };

  // DOCENTE: Aceitar/Recusar Aluno
  const handleDecision = async (appId, status) => {
    if(!confirm(`Tem certeza que deseja definir como ${status}?`)) return;
    try {
      await api.put(`/api/applications/${appId}`, { status });
      alert(`Candidatura ${status}!`);
      loadData(); // Recarrega para atualizar vagas
    } catch (error) { alert("Erro ao atualizar."); }
  };

  // DISCENTE: Candidatar-se
  const handleApply = async (projectId) => {
    const msg = prompt("Escreva uma breve mensagem de motivação:");
    if (!msg) return;
    try {
      await api.post(`/projects/${projectId}/apply`, { mensagem: msg });
      alert('Inscrição enviada!');
      loadData();
    } catch (error) { alert("Erro: Você já se inscreveu ou ocorreu um problema."); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar /> {/* AQUI ESTÁ SEU MENU PRINCIPAL */}

      <div className="max-w-6xl mx-auto p-6">
        
        {/* --- VISÃO DO DOCENTE --- */}
        {user.role === 'docente' && (
          <>
            {/* Seção 1: Criar */}
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
              <h2 className="text-lg font-bold mb-4 text-gray-800">Criar Novo Projeto</h2>
              <div className="flex gap-2">
                <input 
                  className="border p-2 flex-1 rounded bg-gray-50"
                  placeholder="Título do projeto de pesquisa..."
                  value={novoTitulo}
                  onChange={e => setNovoTitulo(e.target.value)}
                />
                <button onClick={handleCreateProject} className="bg-blue-600 text-white px-6 rounded hover:bg-blue-700 font-medium">
                  Publicar
                </button>
              </div>
            </div>

            {/* Seção 2: Gerenciar Candidaturas (ÁREA NOVA) */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800 border-l-4 border-yellow-400 pl-2">
                Candidaturas Recebidas ({applications.filter(a => a.status === 'PENDENTE').length} pendentes)
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {applications.map(app => (
                  <div key={app.id} className="bg-white p-4 rounded shadow border flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">{app.discente?.nome}</p>
                      <p className="text-sm text-gray-500">Projeto: {app.project?.titulo}</p>
                      <p className="text-xs text-gray-400 mt-1 italic">"{app.mensagem}"</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {app.status === 'PENDENTE' ? (
                        <>
                          <button onClick={() => handleDecision(app.id, 'ACEITA')} className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded hover:bg-green-200 font-bold">Aceitar</button>
                          <button onClick={() => handleDecision(app.id, 'RECUSADA')} className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded hover:bg-red-200 font-bold">Recusar</button>
                        </>
                      ) : (
                        <span className={`text-xs font-bold px-2 py-1 rounded ${app.status === 'ACEITA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {app.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {applications.length === 0 && <p className="text-gray-500 italic">Nenhuma candidatura recebida ainda.</p>}
              </div>
            </div>
          </>
        )}

        {/* --- LISTA DE PROJETOS (VISÍVEL PARA TODOS) --- */}
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-l-4 border-blue-500 pl-2">
          {user.role === 'docente' ? 'Meus Projetos' : 'Oportunidades Abertas'}
        </h2>
        
        <div className="grid gap-6 md:grid-cols-3">
          {projects.map(p => (
            <div key={p.id} className="bg-white p-5 rounded-lg shadow hover:shadow-md transition border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded">{p.status}</span>
                <span className="text-xs text-gray-500">Vagas: {p.vagas_ocupadas}/{p.vagas_totais}</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{p.titulo}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{p.descricao || "Sem descrição."}</p>
              
              {user.role === 'discente' && (
                <button 
                  onClick={() => handleApply(p.id)} 
                  className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700"
                >
                  Quero Participar
                </button>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}