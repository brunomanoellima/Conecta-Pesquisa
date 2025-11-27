import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import api from './api';

// --- TELA DE LOGIN ---
function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (error) { 
      alert('Login falhou! Verifique email/senha ou se o backend está rodando.'); 
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">Conecta Pesquisa</h2>
        
        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
        <input 
          className="border w-full p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" 
          placeholder="ex: bruno@teste.com" 
          onChange={e => setForm({...form, email: e.target.value})} 
        />
        
        <label className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
        <input 
          className="border w-full p-2 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500" 
          type="password" 
          placeholder="******" 
          onChange={e => setForm({...form, password: e.target.value})} 
        />
        
        <button className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded font-bold transition">
          Entrar
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Não tem conta? <Link to="/register" className="text-blue-600 font-bold hover:underline">Cadastre-se aqui</Link>
        </p>
      </form>
    </div>
  );
}

// --- TELA DE CADASTRO (NOVA) ---
function Register() {
  const [form, setForm] = useState({ nome: '', email: '', password: '', role: 'discente' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Envia os dados para o backend criar o usuário
      await api.post('/auth/register', form);
      alert('Conta criada com sucesso! Faça login agora.');
      navigate('/');
    } catch (error) {
      alert('Erro ao criar conta. Tente outro email.');
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-blue-50">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-700">Criar Nova Conta</h2>
        
        <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo</label>
        <input className="border w-full p-2 rounded mb-3" required onChange={e => setForm({...form, nome: e.target.value})} />

        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
        <input type="email" className="border w-full p-2 rounded mb-3" required onChange={e => setForm({...form, email: e.target.value})} />

        <label className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
        <input type="password" className="border w-full p-2 rounded mb-3" required onChange={e => setForm({...form, password: e.target.value})} />

        <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Conta</label>
        <select className="border w-full p-2 rounded mb-6 bg-white" onChange={e => setForm({...form, role: e.target.value})}>
          <option value="discente">Sou Aluno (Discente)</option>
          <option value="docente">Sou Professor (Docente)</option>
        </select>

        <button className="bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded font-bold transition">
          Cadastrar
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Já tem conta? <Link to="/" className="text-blue-600 font-bold hover:underline">Voltar para Login</Link>
        </p>
      </form>
    </div>
  );
}

// --- DASHBOARD (PRINCIPAL) ---
function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [projects, setProjects] = useState([]);
  const [titulo, setTitulo] = useState('');
  const navigate = useNavigate();

  // Se não tiver usuário logado, chuta pro login
  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/');
    load();
  }, []);

  const load = async () => { try { setProjects((await api.get('/projects')).data); } catch(e){} };

  const criar = async () => {
    if(!titulo) return alert("Digite um título");
    await api.post('/projects', { titulo, prazo_inscricao: new Date() });
    setTitulo(''); load();
  };

  const candidatar = async (id) => {
    const msg = prompt('Por que você quer participar?');
    if(msg) {
      try {
        await api.post(`/projects/${id}/apply`, { mensagem: msg });
        alert('Candidatura enviada com sucesso!');
      } catch (e) { alert('Erro: Você já se candidatou ou o projeto fechou.'); }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra Superior */}
      <div className="bg-white shadow p-4 flex justify-between items-center mb-6 px-8">
        <h1 className="text-xl font-bold text-gray-800">Conecta Pesquisa</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-bold text-gray-700">{user.nome}</p>
            <p className="text-xs text-gray-500 uppercase">{user.role}</p>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} className="text-red-500 font-semibold border border-red-200 px-3 py-1 rounded hover:bg-red-50">Sair</button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4">
        {/* Painel do Docente */}
        {user.role === 'docente' && (
          <div className="bg-white p-6 rounded-lg shadow mb-8 border-l-8 border-green-500">
            <h2 className="text-lg font-bold mb-4">Criar Novo Projeto</h2>
            <div className="flex gap-2">
              <input 
                className="border p-3 flex-1 rounded bg-gray-50" 
                placeholder="Ex: Pesquisa sobre Energias Renováveis..." 
                value={titulo} 
                onChange={e => setTitulo(e.target.value)} 
              />
              <button onClick={criar} className="bg-green-600 hover:bg-green-700 text-white px-6 rounded font-bold shadow">
                + Criar
              </button>
            </div>
          </div>
        )}

        {/* Lista de Projetos */}
        <h2 className="text-2xl font-bold mb-4 text-gray-700">
          {user.role === 'docente' ? 'Meus Projetos Gerenciados' : 'Oportunidades Abertas'}
        </h2>
        
        {projects.length === 0 && <p className="text-gray-500">Nenhum projeto encontrado.</p>}

        <div className="grid gap-6 md:grid-cols-2">
          {projects.map(p => (
            <div key={p.id} className="bg-white p-6 shadow-md rounded-lg hover:shadow-xl transition border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xl text-blue-900 mb-2">{p.titulo}</h3>
                <div className="flex gap-2 mb-4">
                   <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">{p.status}</span>
                   {p.docente && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">Prof. {p.docente.nome}</span>}
                </div>
              </div>
              
              {user.role === 'discente' && (
                <button 
                  onClick={() => candidatar(p.id)} 
                  className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition"
                >
                  Quero Participar
                </button>
              )}
              {user.role === 'docente' && (
                 <div className="text-sm text-gray-500 text-center mt-2 p-2 bg-gray-50 rounded">
                    Vagas ocupadas: {p.vagas_ocupadas} / {p.vagas_totais}
                 </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- ROTAS ---
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}