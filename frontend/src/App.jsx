import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import api from './api';

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
    } catch (error) { alert('Login falhou: Verifique se o backend está rodando!'); }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-xl font-bold mb-4 text-center">Conecta Pesquisa</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input 
            className="border w-full p-2 rounded mt-1" 
            placeholder="admin@teste.com" 
            onChange={e => setForm({...form, email: e.target.value})} 
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Senha</label>
          <input 
            className="border w-full p-2 rounded mt-1" 
            type="password" 
            placeholder="******" 
            onChange={e => setForm({...form, password: e.target.value})} 
          />
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded font-bold">
          Entrar
        </button>
      </form>
    </div>
  );
}

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [projects, setProjects] = useState([]);
  const [titulo, setTitulo] = useState('');
  const navigate = useNavigate();

  const load = async () => { try { setProjects((await api.get('/projects')).data); } catch(e){} };
  useEffect(() => { load(); }, []);

  const criar = async () => {
    await api.post('/projects', { titulo, prazo_inscricao: new Date() });
    setTitulo(''); load();
  };

  const candidatar = async (id) => {
    const msg = prompt('Motivação:');
    if(msg) await api.post(`/projects/${id}/apply`, { mensagem: msg });
    alert('Candidatura enviada!');
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Olá, {user.nome} <span className="text-sm font-normal text-gray-500">({user.role})</span></h1>
        <button onClick={() => { localStorage.clear(); navigate('/'); }} className="text-red-500 hover:text-red-700 font-semibold">Sair</button>
      </div>

      {user.role === 'docente' && (
        <div className="mb-8 bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-2">Novo Projeto</h2>
          <div className="flex gap-2">
            <input className="border p-2 flex-1 rounded" placeholder="Título do projeto..." value={titulo} onChange={e => setTitulo(e.target.value)} />
            <button onClick={criar} className="bg-green-600 hover:bg-green-700 text-white px-6 rounded font-bold">Criar</button>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">Projetos Disponíveis</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map(p => (
          <div key={p.id} className="bg-white p-5 shadow rounded-lg border-l-4 border-blue-500 hover:shadow-lg transition">
            <h3 className="font-bold text-lg text-gray-800">{p.titulo}</h3>
            <p className="text-sm text-gray-500 mt-1">Status: <span className="font-medium">{p.status}</span></p>
            {user.role === 'discente' && (
              <button onClick={() => candidatar(p.id)} className="mt-4 w-full bg-blue-100 text-blue-700 py-2 rounded hover:bg-blue-200 font-semibold">
                Quero Participar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}