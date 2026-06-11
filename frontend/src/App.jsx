import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link, Navigate } from 'react-router-dom';
import { 
  FaSearch, FaGithub, FaFileAlt, FaWhatsapp, FaCalendarAlt, FaClock, FaMapMarkerAlt, 
  FaUserGraduate, FaEnvelope, FaExternalLinkAlt, FaTimes, FaUniversity, 
  FaLayerGroup, FaClipboardList, FaUsers, FaRocket, FaUserCircle, FaPowerOff, 
  FaChevronLeft, FaChevronRight, FaBullhorn, FaPaperPlane, FaTrash, FaPlus, FaListUl, FaCheckCircle, FaEdit, FaBan, FaCheck,
  FaExclamationTriangle, FaQuestionCircle, FaInfoCircle, FaSpinner, FaEye, FaEyeSlash, FaFilter, FaLock, FaUser
} from 'react-icons/fa';
import Slider from "react-slick"; 
import api from './api';

// --- COMPONENTE DE SEGURANÇA ---
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
};

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

const safeParse = (data) => {
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) return parsed;
    return [data];
  } catch (e) {
    return [data];
  }
};

// --- FUNDOS DAS TELAS DE LOGIN E CADASTRO ---
// Coloque as imagens em:
// frontend/public/imagens/fundo-aluno.png
// frontend/public/imagens/fundo-professor.png
const getAuthBackgroundStyle = (role = 'discente') => {
  const image =
    role === 'docente'
      ? '/imagens/fundo-professor.png'
      : '/imagens/fundo-aluno.png';

  return {
    backgroundImage: `url('${image}')`,
    backgroundColor: '#0b1024',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };
};

// COMPONENTE DE LOADING GLOBAL
const LoadingSpinner = ({ message = "Carregando..." }) => (
  <div className="flex flex-col items-center justify-center p-12 text-gray-500">
    <FaSpinner className="animate-spin text-5xl text-[#1c2b36] mb-4" />
    <p className="font-bold text-lg animate-pulse text-gray-600">{message}</p>
  </div>
);

const StatusBadge = ({ status, expired }) => {
  if (status === 'ABERTO' && expired) {
    return <span className="px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest bg-gray-200 text-gray-600 border border-gray-300 shadow-sm">Prazo Vencido</span>;
  }

  const styles = {
    'ABERTO': 'bg-green-100 text-green-800 border border-green-200',
    'CONCLUIDO': 'bg-gray-100 text-gray-700 border border-gray-200',
    'PENDENTE': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    'ACEITA': 'bg-blue-100 text-blue-800 border border-blue-200',
    'RECUSADA': 'bg-red-100 text-red-800 border border-red-200',
    'NAO_AVALIADA_ENCERRADA': 'bg-gray-200 text-gray-600 border border-gray-300'
  };

  return <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-sm ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
};

// --- MENSAGENS COM ÍCONES ---
const messageIconStyles = {
  success: { icon: FaCheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  error: { icon: FaExclamationTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  warning: { icon: FaExclamationTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  info: { icon: FaInfoCircle, color: 'text-[#1c2b36]', bg: 'bg-blue-50', border: 'border-blue-200' },
  question: { icon: FaQuestionCircle, color: 'text-[#1c2b36]', bg: 'bg-blue-50', border: 'border-blue-200' }
};

function FeedbackModal({ data, onClose }) {
  if (!data) return null;
  const style = messageIconStyles[data.type || 'info'];
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4 transition-opacity">
      <div className={`bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md border ${style.border} animate-slideIn`}>
        <div className={`w-16 h-16 ${style.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm`}>
          <Icon className={`text-4xl ${style.color}`} />
        </div>
        <h3 className="text-2xl font-extrabold text-gray-900 text-center mb-3">{data.title}</h3>
        <p className="text-gray-600 text-center mb-8 leading-relaxed font-medium">{data.message}</p>
        <button onClick={onClose} className="bg-[#1c2b36] text-white w-full py-4 rounded-2xl font-bold text-lg hover:bg-gray-900 transition shadow-lg">
          Entendi
        </button>
      </div>
    </div>
  );
}

function ConfirmModal({ data, onCancel }) {
  if (!data) return null;
  const style = messageIconStyles[data.type || 'question'];
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4 transition-opacity">
      <div className={`bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md border ${style.border} animate-slideIn`}>
        <div className={`w-16 h-16 ${style.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm`}>
          <Icon className={`text-4xl ${style.color}`} />
        </div>
        <h3 className="text-2xl font-extrabold text-gray-900 text-center mb-3">{data.title}</h3>
        <p className="text-gray-600 text-center mb-8 leading-relaxed font-medium">{data.message}</p>
        <div className="grid grid-cols-2 gap-4">
          <button type="button" onClick={onCancel} className="border-2 border-gray-200 text-gray-700 py-3.5 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-300 transition">
            Cancelar
          </button>
          <button type="button" onClick={data.onConfirm} className="bg-[#1c2b36] text-white py-3.5 rounded-2xl font-bold hover:bg-gray-900 transition shadow-lg">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

function InputModal({ data, onCancel }) {
  const [value, setValue] = useState('');
  if (!data) return null;
  const style = messageIconStyles[data.type || 'info'];
  const Icon = style.icon;

  const submit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    data.onConfirm(value.trim());
    setValue('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4 transition-opacity">
      <form onSubmit={submit} className={`bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md border ${style.border} animate-slideIn`}>
        <div className={`w-16 h-16 ${style.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm`}>
          <Icon className={`text-4xl ${style.color}`} />
        </div>
        <h3 className="text-2xl font-extrabold text-gray-900 text-center mb-3">{data.title}</h3>
        <p className="text-gray-600 text-center mb-6 leading-relaxed font-medium">{data.message}</p>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full border-2 border-gray-200 rounded-2xl p-4 min-h-[120px] mb-6 focus:border-[#1c2b36] outline-none transition text-gray-800"
          placeholder={data.placeholder || 'Digite sua resposta...'}
          autoFocus
        />
        <div className="grid grid-cols-2 gap-4">
          <button type="button" onClick={onCancel} className="border-2 border-gray-200 text-gray-700 py-3.5 rounded-2xl font-bold hover:bg-gray-50 transition">
            Cancelar
          </button>
          <button type="submit" disabled={!value.trim()} className="bg-[#1c2b36] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-2xl font-bold hover:bg-gray-900 transition shadow-lg">
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}

// --- SETAS DO CARROSSEL ---
function SampleNextArrow(props) {
  const { onClick } = props;
  return (
    <div className="absolute top-1/2 -translate-y-1/2 right-8 z-20 cursor-pointer text-white opacity-60 hover:opacity-100 transition-all hover:scale-110 drop-shadow-lg bg-black/20 p-2 rounded-full backdrop-blur-sm" onClick={onClick} aria-label="Próximo">
      <FaChevronRight className="text-4xl" />
    </div>
  );
}

function SamplePrevArrow(props) {
  const { onClick } = props;
  return (
    <div className="absolute top-1/2 -translate-y-1/2 left-8 z-20 cursor-pointer text-white opacity-60 hover:opacity-100 transition-all hover:scale-110 drop-shadow-lg bg-black/20 p-2 rounded-full backdrop-blur-sm" onClick={onClick} aria-label="Anterior">
      <FaChevronLeft className="text-4xl" />
    </div>
  );
}

// --- PÁGINAS LOGIN E REGISTER ---
function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/dashboard');
  }, [navigate]);

  const handle = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Falha no login',
        message: err.response?.data?.error || 'Verifique seu e-mail e senha e tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-4 relative overflow-hidden" style={getAuthBackgroundStyle('discente')}>
      <FeedbackModal data={feedback} onClose={() => setFeedback(null)} />

      <div className="relative bg-white/40 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] shadow-2xl w-full max-w-md border border-white/50 animate-fadeIn">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 mt-2 text-center drop-shadow-sm">
          Login
        </h2>

        <form onSubmit={handle} className="space-y-6">
          <div className="relative">
            <label className="text-gray-900 font-bold text-sm mb-1 block">Email</label>
            <div className="flex items-center border-b-2 border-gray-800 py-2 transition-colors focus-within:border-blue-600">
              <input
                required
                type="email"
                className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-600 font-medium"
                onChange={e => setForm({ ...form, email: e.target.value })}
                disabled={isLoading}
              />
              <FaEnvelope className="text-gray-800 ml-2" />
            </div>
          </div>

          <div className="relative">
            <label className="text-gray-900 font-bold text-sm mb-1 block">Senha</label>
            <div className="flex items-center border-b-2 border-gray-800 py-2 transition-colors focus-within:border-blue-600">
              <input
                required
                type={showPwd ? 'text' : 'password'}
                className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-600 font-medium"
                onChange={e => setForm({ ...form, password: e.target.value })}
                disabled={isLoading}
              />
              <button
                type="button"
                tabIndex="-1"
                className="text-gray-800 ml-2 hover:text-blue-600 transition"
                onClick={() => setShowPwd(!showPwd)}
              >
                {showPwd ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            
            <div className="flex justify-end mt-2">
              <a href="#" className="text-xs font-bold text-gray-800 hover:text-blue-700 hover:underline">Esqueceu a Senha?</a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#1c2b36] text-white w-full py-4 rounded-2xl font-bold text-lg hover:bg-gray-900 transition flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg mt-4"
          >
            {isLoading ? (
              <><FaSpinner className="animate-spin" /> Entrando...</>
            ) : (
              'Entrar'
            )}
          </button>

          <div className="text-center pt-2">
            <span className="text-gray-800 text-sm font-medium">Não tem uma conta? </span>
            <Link to="/register" className="text-sm font-extrabold text-[#1c2b36] hover:underline">
              Registrar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function Register() {
  const [form, setForm] = useState({ nome: '', email: '', password: '', role: 'discente' });
  const [confirmPwd, setConfirmPwd] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const navigate = useNavigate();

  const reqs = {
    nome: { req: form.nome.trim().length > 0, len: form.nome.trim().length >= 3 },
    email: { req: form.email.trim().length > 0, valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) },
    password: { req: form.password.length > 0, len: form.password.length >= 6, letter: /[a-zA-Z]/.test(form.password), number: /\d/.test(form.password), special: /[^a-zA-Z0-9]/.test(form.password) },
    confirm: { req: confirmPwd.length > 0, match: confirmPwd === form.password && form.password.length > 0 }
  };

  const isFormValid =
    reqs.nome.req && reqs.nome.len &&
    reqs.email.req && reqs.email.valid &&
    reqs.password.req && reqs.password.len && reqs.password.letter && reqs.password.number && reqs.password.special &&
    reqs.confirm.req && reqs.confirm.match;

  const handle = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsLoading(true);
    try {
      await api.post('/auth/register', form);
      setFeedback({ type: 'success', title: 'Conta criada com sucesso', message: 'Seu cadastro foi realizado. Redirecionando para o login...' });
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setFeedback({ type: 'error', title: 'Erro no cadastro', message: err.response?.data?.error || 'Não foi possível concluir o cadastro. Confira os dados e tente novamente.' });
      setIsLoading(false);
    }
  };

  const ValidationList = ({ checks }) => (
    <div className="mt-2 space-y-1">
      {checks.map((check, i) => (
        <div key={i} className={`text-xs flex items-center gap-1.5 transition-colors ${check.met ? 'text-green-700 font-bold' : 'text-red-500 font-medium'}`}>
          {check.met ? <FaCheckCircle /> : <FaTimes className="opacity-80" />}
          <span>{check.text}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex justify-center items-center p-4 relative overflow-hidden" style={getAuthBackgroundStyle(form.role)}>
      <FeedbackModal data={feedback} onClose={() => setFeedback(null)} />

      <div className="relative bg-white/40 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] shadow-2xl w-full max-w-lg border border-white/50 animate-fadeIn my-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="absolute top-4 right-4 bg-[#1c2b36] text-white p-2 rounded-xl shadow cursor-pointer hover:bg-gray-800 transition">
          <Link to="/"><FaTimes size={16} /></Link>
        </div>

        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 mt-2 text-center drop-shadow-sm">Registrar</h2>

        <form onSubmit={handle} className="space-y-6">
          <div className="relative">
            <label className="text-gray-900 font-bold text-sm mb-1 block">Nome Completo</label>
            <div className="flex items-center border-b-2 border-gray-800 py-2 transition-colors focus-within:border-blue-600">
              <input type="text" className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-600 font-medium" onChange={e => setForm({ ...form, nome: e.target.value })} disabled={isLoading} />
              <FaUser className="text-gray-800 ml-2" />
            </div>
            <ValidationList checks={[{ text: "O nome é obrigatório", met: reqs.nome.req }, { text: "O nome deve ter pelo menos 3 caracteres", met: reqs.nome.len }]} />
          </div>

          <div className="relative">
            <label className="text-gray-900 font-bold text-sm mb-1 block">E-mail Acadêmico</label>
            <div className="flex items-center border-b-2 border-gray-800 py-2 transition-colors focus-within:border-blue-600">
              <input type="email" className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-600 font-medium" onChange={e => setForm({ ...form, email: e.target.value })} disabled={isLoading} />
              <FaEnvelope className="text-gray-800 ml-2" />
            </div>
            <ValidationList checks={[{ text: "O e-mail é obrigatório", met: reqs.email.req }, { text: "Digite um e-mail válido, como exemplo@email.com", met: reqs.email.valid }]} />
          </div>
          
          <div className="relative">
            <label className="text-gray-900 font-bold text-sm mb-1 block">Criar Senha</label>
            <div className="flex items-center border-b-2 border-gray-800 py-2 transition-colors focus-within:border-blue-600">
              <input type={showPwd ? 'text' : 'password'} className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-600 font-medium" onChange={e => setForm({ ...form, password: e.target.value })} disabled={isLoading} />
              <button type="button" tabIndex="-1" className="text-gray-800 ml-2 hover:text-blue-600 transition" onClick={() => setShowPwd(!showPwd)}>{showPwd ? <FaEyeSlash size={18} /> : <FaEye size={18} />}</button>
            </div>
            <ValidationList checks={[{ text: "A senha é obrigatória", met: reqs.password.req }, { text: "A senha deve ter no mínimo 6 caracteres", met: reqs.password.len }, { text: "A senha deve conter pelo menos uma letra", met: reqs.password.letter }, { text: "A senha deve conter pelo menos um número", met: reqs.password.number }, { text: "A senha deve conter pelo menos um caractere especial", met: reqs.password.special }]} />
          </div>

          <div className="relative">
            <label className="text-gray-900 font-bold text-sm mb-1 block">Confirmar Senha</label>
            <div className="flex items-center border-b-2 border-gray-800 py-2 transition-colors focus-within:border-blue-600">
              <input type={showConfirmPwd ? 'text' : 'password'} className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-600 font-medium" onChange={e => setConfirmPwd(e.target.value)} disabled={isLoading} />
              <button type="button" tabIndex="-1" className="text-gray-800 ml-2 hover:text-blue-600 transition" onClick={() => setShowConfirmPwd(!showConfirmPwd)}>{showConfirmPwd ? <FaEyeSlash size={18} /> : <FaEye size={18} />}</button>
            </div>
            <ValidationList checks={[{ text: "A confirmação de senha é obrigatória", met: reqs.confirm.req }, { text: "As senhas devem ser iguais", met: reqs.confirm.match }]} />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Eu sou um(a):</label>
            <select className="bg-white/50 border border-gray-800 w-full p-4 rounded-xl focus:ring-2 focus:ring-[#1c2b36] outline-none text-gray-900 font-bold cursor-pointer" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} disabled={isLoading}>
              <option value="discente">Aluno (Discente)</option>
              <option value="docente">Professor (Docente)</option>
            </select>
          </div>

          <button type="submit" disabled={isLoading || !isFormValid} className="bg-[#1c2b36] text-white w-full py-4 rounded-2xl font-bold text-lg hover:bg-gray-900 transition flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-6">
            {isLoading ? <><FaSpinner className="animate-spin" /> Processando...</> : 'Finalizar Cadastro'}
          </button>

          <div className="text-center pt-2">
            <span className="text-gray-800 text-sm font-medium">Já possui uma conta? </span>
            <Link to="/" className="text-sm font-extrabold text-[#1c2b36] hover:underline">Fazer Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- DASHBOARD ---
function Dashboard() {
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState('projetos');
  const [data, setData] = useState({ projects: [], applications: [], profile: {} });
  
  const [skillsList, setSkillsList] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  
  const [objList, setObjList] = useState([]);
  const [objInput, setObjInput] = useState('');
  const [reqList, setReqList] = useState([]);
  const [reqInput, setReqInput] = useState('');

  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // MODAIS STATE
  const [viewProj, setViewProj] = useState(null); 
  const [projectModalData, setProjectModalData] = useState(null); 
  const [viewStudent, setViewStudent] = useState(null);
  
  const [postContent, setPostContent] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [inputDialog, setInputDialog] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const notify = (type, title, message) => setFeedback({ type, title, message });
  const clearConfirm = () => setConfirmDialog(null);
  const clearInput = () => setInputDialog(null);

  useEffect(() => { 
    if (!user) { localStorage.clear(); navigate('/'); } else { load(); }
    // eslint-disable-next-line
  }, []);

  const load = async () => {
    setIsLoading(true);
    try {
      const p = await api.get('/projects');
      const a = await api.get('/applications');
      if (user.role === 'discente') {
        const prof = await api.get('/profile');
        setData({ projects: p.data, applications: a.data, profile: prof.data });
        if (prof.data.habilidades) setSkillsList(safeParse(prof.data.habilidades));
      } else { 
        setData({ projects: p.data, applications: a.data, profile: {} }); 
      }
    } catch (e) { 
      if (e.response && e.response.status === 401) { localStorage.clear(); navigate('/'); }
    } finally {
      setIsLoading(false);
    }
  };

  const carouselSettings = { dots: true, infinite: true, speed: 1000, slidesToShow: 1, slidesToScroll: 1, autoplay: true, autoplaySpeed: 6000, arrows: true, fade: true, nextArrow: <SampleNextArrow />, prevArrow: <SamplePrevArrow />, appendDots: dots => <div style={{ bottom: "20px" }}><ul className="m-0 p-0"> {dots} </ul></div>, customPaging: i => <div className="w-3 h-3 mx-1 bg-white/50 rounded-full transition-all hover:bg-white hover:scale-110"></div> };
  const carouselSlides = [
    { id: 1, title: "Explore o Conhecimento", desc: "Conecte-se com projetos inovadores e professores experientes.", img: "/imagens/pesquisa.jpg", btnText: "Ver Pesquisas" },
    { id: 2, title: "Ações de Extensão", desc: "Conecte a universidade com a comunidade.", img: "/imagens/Extensao.jpg", btnText: "Ver Extensão" },
    { id: 3, title: "Trabalho Voluntário", desc: "Contribua com seu tempo e habilidades.", img: "/imagens/Volutario.jpg", btnText: "Ser Voluntário" }
  ];

  const handleEditOrCreate = (project) => {
    if (project) {
      setObjList(safeParse(project.objetivos));
      setReqList(safeParse(project.requisitos));
    } else {
      setObjList([]);
      setReqList([]);
    }
    setProjectModalData(project || {}); 
  };

  const handleCloseProject = async (id) => {
    setConfirmDialog({
      type: 'warning', title: 'Encerrar projeto?', message: 'As inscrições serão fechadas. Candidaturas pendentes serão marcadas como não avaliadas.',
      onConfirm: async () => {
        clearConfirm();
        try { await api.post(`/projects/${id}/close`); notify('success', 'Projeto encerrado', 'O projeto foi concluído com sucesso.'); load(); } 
        catch (err) { notify('error', 'Erro ao encerrar', err.response?.data?.error || 'Não foi possível encerrar o projeto.'); }
      }
    });
  };

  const handleDeleteProject = async (id) => {
    setConfirmDialog({
      type: 'warning', title: 'Atenção: Excluir projeto?', message: 'Essa ação é irreversível. O projeto e todas as candidaturas associadas serão removidos.',
      onConfirm: async () => {
        clearConfirm();
        try { await api.delete(`/projects/${id}`); notify('success', 'Projeto excluído', 'O projeto foi removido com sucesso.'); load(); } 
        catch (err) { notify('error', 'Erro ao excluir', err.response?.data?.error || 'Não foi possível excluir o projeto.'); }
      }
    });
  };

  const saveProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData);
    
    const prazo = new Date(body.prazo_inscricao);
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);
    
    if (prazo < hoje) {
      setIsSubmitting(false);
      return notify('warning', 'Atenção ao Prazo', 'O prazo de inscrição não pode ser uma data no passado.');
    }

    body.objetivos = JSON.stringify(objList);
    body.requisitos = JSON.stringify(reqList);

    try { 
      if (projectModalData && projectModalData.id) { await api.put(`/projects/${projectModalData.id}`, body); } 
      else { await api.post('/projects', body); }
      setProjectModalData(null); 
      setObjList([]); setReqList([]);
      load();
      setShowSuccessModal(true);
    } catch (err) { notify('error', 'Erro ao salvar', err.response?.data?.error || 'Verifique os dados preenchidos.'); } 
    finally { setIsSubmitting(false); }
  };
  
  const addSkill = (e) => { e.preventDefault(); if (skillInput.trim()) { setSkillsList([...skillsList, skillInput.trim()]); setSkillInput(''); } };
  const removeSkill = (i) => setSkillsList(skillsList.filter((_, idx) => idx !== i));
  const addObj = (e) => { e.preventDefault(); if (objInput.trim()) { setObjList([...objList, objInput.trim()]); setObjInput(''); } };
  const removeObj = (i) => setObjList(objList.filter((_, idx) => idx !== i));
  const addReq = (e) => { e.preventDefault(); if (reqInput.trim()) { setReqList([...reqList, reqInput.trim()]); setReqInput(''); } };
  const removeReq = (i) => setReqList(reqList.filter((_, idx) => idx !== i));

  const saveProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData);
    body.habilidades = JSON.stringify(skillsList);
    try { await api.put('/profile', body); notify('success', 'Perfil Atualizado', 'Suas informações foram salvas.'); load(); } 
    catch (err) { notify('error', 'Erro ao salvar perfil', err.response?.data?.error || 'Tente novamente mais tarde.'); } 
    finally { setIsSubmitting(false); }
  };

  const apply = async (id) => {
    setInputDialog({
      type: 'question', title: 'Por que você quer participar?', message: 'Escreva uma breve mensagem para o professor explicando seu interesse.', placeholder: 'Olá professor, me interessei pela pesquisa porque...',
      onConfirm: async (msg) => {
        clearInput();
        try { await api.post(`/projects/${id}/apply`, { mensagem: msg }); notify('success', 'Inscrição Enviada!', 'O docente avaliará sua candidatura em breve.'); load(); } 
        catch (err) { notify('error', 'Erro na inscrição', err.response?.data?.error || 'Não foi possível enviar sua candidatura agora.'); }
      }
    });
  };
  
  const updateApplicationStatus = async (id, status, reason = '') => {
    try { await api.put(`/applications/${id}`, { status, reason }); notify('success', 'Ação concluída', `O status da candidatura foi atualizado para ${status}.`); load(); } 
    catch (err) { notify('error', 'Erro na atualização', err.response?.data?.error || 'Tente recarregar a página.'); }
  };

  const manageApp = async (id, status, isRemoval) => {
    if (isRemoval) {
      setInputDialog({ type: 'warning', title: 'Motivo do desligamento', message: 'Explique brevemente o motivo de remover este aluno da equipe.', placeholder: 'Falta de participação...', onConfirm: async (reason) => { clearInput(); await updateApplicationStatus(id, status, reason); } });
      return;
    }
    setConfirmDialog({ type: status === 'ACEITA' ? 'success' : 'warning', title: status === 'ACEITA' ? 'Aprovar Aluno?' : 'Recusar Aluno?', message: status === 'ACEITA' ? 'Este aluno será adicionado à sua equipe oficial.' : 'A candidatura será recusada. Esta ação não pode ser desfeita.', onConfirm: async () => { clearConfirm(); await updateApplicationStatus(id, status); } });
  };

  const postToMural = async (projectId) => {
    const content = postContent[projectId];
    if (!content) return notify('warning', 'Aviso Vazio', 'Você precisa digitar algo para publicar.');
    try { await api.post(`/projects/${projectId}/mural`, { content }); notify('success', 'Mural Atualizado', 'Sua mensagem já está visível para a equipe.'); setPostContent({ ...postContent, [projectId]: '' }); load(); } 
    catch (e) { notify('error', 'Erro ao publicar', 'Verifique sua conexão e tente novamente.'); }
  };

  const searchStudents = async () => {
    if (!search.trim()) return;
    setIsLoading(true);
    try { const res = await api.get(`/users/search?nome=${search}`); setSearchResults(res.data); if (res.data.length === 0) notify('info', 'Busca sem resultados', `Não encontramos alunos com esse nome.`); } 
    catch (err) { notify('error', 'Falha na busca', 'Erro ao contatar o servidor.'); } 
    finally { setIsLoading(false); }
  };

  const myStatusInProject = (pid) => { if (user.role !== 'discente') return null; const app = data.applications.find(a => a.project_id === pid); return app ? app.status : null; };

  const renderList = (json) => {
    const list = safeParse(json);
    if (list.length > 0) return (<ul className="list-disc pl-5 space-y-2 mt-2">{list.map((x, i) => (<li key={i} className="text-sm font-medium text-gray-700">{x}</li>))}</ul>);
    return <p className="text-sm text-gray-400 mt-2">Nenhum item informado.</p>;
  };

  const renderSkills = (json) => {
    const list = safeParse(json);
    if (list.length > 0) return list.map((x, i) => (<span key={i} className="text-xs bg-[#1c2b36] text-white px-4 py-1.5 rounded-full font-bold shadow-sm">{x}</span>));
    return <span className="text-xs text-gray-400 italic">O aluno ainda não preencheu suas habilidades.</span>;
  };

  const MenuIcon = ({ id }) => {
    if (id === 'projetos') return <FaLayerGroup className="text-lg" />;
    if (id === 'candidaturas') return <FaClipboardList className="text-lg" />;
    if (id === 'equipes') return <FaUsers className="text-lg" />;
    if (id === 'murais') return <FaRocket className="text-lg" />;
    if (id === 'perfil') return <FaUserCircle className="text-lg" />;
    return null;
  };

  if (!user) return null;

  const filteredProjects = data.projects.filter(p => {
    const matchText = p.titulo.toLowerCase().includes(filterText.toLowerCase()) || p.tipo.toLowerCase().includes(filterText.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchText && matchStatus;
  });

  return (
    <div className="min-h-screen bg-[#f4f7f9] font-sans text-gray-800 relative">
      <FeedbackModal data={feedback} onClose={() => setFeedback(null)} />
      <ConfirmModal data={confirmDialog} onCancel={clearConfirm} />
      <InputModal data={inputDialog} onCancel={clearInput} />
      
      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-30 w-full border-b border-gray-200">
        <div className="w-full px-4 md:px-8 py-4 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="bg-[#1c2b36] text-white p-3 rounded-2xl font-bold text-2xl shadow-md">
              <FaUniversity />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#1c2b36] tracking-tight hidden sm:block">Conecta Pesquisa</h1>
              <p className="text-xs text-gray-500 uppercase font-extrabold tracking-widest mt-0.5">Painel {user.role === 'discente' ? 'do Aluno' : 'do Professor'}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm font-bold text-gray-700 hidden md:block">Olá, {user.nome.split(' ')[0]}</span>
            <button onClick={() => { localStorage.clear(); navigate('/'); }} className="group flex items-center gap-2 bg-gray-50 text-gray-700 px-5 py-3 rounded-2xl font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300 border-2 border-transparent">
              <FaPowerOff className="group-hover:rotate-90 transition-transform duration-300 text-lg" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="w-full px-4 md:px-8 py-8 max-w-7xl mx-auto">
        
        {/* NAVEGAÇÃO */}
        <nav className="flex flex-wrap justify-center gap-3 mb-10 w-full" aria-label="Navegação Principal">
          {[
            { id: 'projetos', label: 'Projetos', role: 'both' },
            { id: 'candidaturas', label: 'Candidaturas', role: 'both' },
            { id: 'equipes', label: 'Minhas Equipes', role: 'docente' },
            { id: 'murais', label: 'Meus Murais', role: 'discente' },
            { id: 'perfil', label: 'Meu Perfil', role: 'discente' }
          ].filter(item => item.role === 'both' || item.role === user.role).map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-extrabold transition-all duration-300 whitespace-nowrap shadow-sm border-2 ${tab === item.id ? 'bg-[#1c2b36] text-white border-[#1c2b36]' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}>
              <MenuIcon id={item.id} />{item.label}
            </button>
          ))}
        </nav>

        {isLoading && tab !== 'projetos' ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* CARROSSEL */}
            {user.role === 'discente' && tab === 'projetos' && !filterText && filterStatus === 'ALL' && (
              <div className="mb-10 rounded-[2rem] overflow-hidden shadow-xl animate-fadeIn w-full relative group bg-gray-900">
                <Slider {...carouselSettings}>
                  {carouselSlides.map(slide => (
                    <div key={slide.id} className="h-[400px] md:h-[500px] relative overflow-hidden outline-none">
                      <div className={`absolute inset-0 bg-cover bg-center opacity-50 transition-transform duration-1000 hover:scale-105 ${slide.id === 1 ? 'bg-blue-900' : slide.id === 2 ? 'bg-indigo-900' : 'bg-purple-900'}`} style={{ backgroundImage: `url('${slide.img}')` }}></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1c2b36]/90 to-transparent flex flex-col justify-end items-start text-left p-10 md:p-16">
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-white drop-shadow-md">{slide.title}</h2>
                        <p className="text-lg md:text-xl text-gray-200 max-w-2xl font-medium mb-4">{slide.desc}</p>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
            )}

            {/* ABA PROJETOS */}
            {tab === 'projetos' && (
              <div className="animate-fadeIn w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-5 rounded-[2rem] border border-gray-100 shadow-md">
                  <div className="flex-1 w-full relative">
                    <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    <input type="text" placeholder="Buscar por título ou tipo..." className="w-full pl-14 pr-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-[#1c2b36] outline-none transition font-medium text-gray-800" value={filterText} onChange={e => setFilterText(e.target.value)} />
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-2 flex-1 md:flex-none h-[56px]">
                      <FaFilter className="text-gray-400" />
                      <select className="bg-transparent border-none text-sm font-bold text-gray-700 outline-none w-full cursor-pointer focus:ring-0" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="ALL">Todos os Status</option>
                        <option value="ABERTO">Vagas Abertas</option>
                        <option value="CONCLUIDO">Concluídos</option>
                      </select>
                    </div>
                    {user.role === 'docente' && (
                      <button onClick={() => handleEditOrCreate(null)} className="bg-green-600 text-white px-8 py-4 rounded-2xl font-bold shadow-md hover:bg-green-700 transition flex items-center justify-center gap-3 whitespace-nowrap flex-1 md:flex-none h-[56px]">
                        <FaPlus /> <span className="hidden sm:inline">Novo Projeto</span>
                      </button>
                    )}
                  </div>
                </div>

                {isLoading ? ( <LoadingSpinner message="Buscando projetos..." /> ) : filteredProjects.length === 0 ? (
                  <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-gray-200 shadow-sm">
                    <FaSearch className="text-6xl text-gray-300 mx-auto mb-6" />
                    <p className="text-xl text-gray-600 font-bold">Nenhum projeto encontrado.</p>
                    <button onClick={() => { setFilterText(''); setFilterStatus('ALL'); }} className="mt-4 text-[#1c2b36] font-extrabold hover:underline">Limpar Filtros</button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                    {filteredProjects.map(p => {
                      const expired = checkExpired(p.prazo_inscricao);
                      return (
                        <div key={p.id} className={`bg-white p-8 rounded-[2rem] shadow-md border-2 hover:shadow-2xl transition-all duration-300 flex flex-col group h-full ${expired || p.status === 'CONCLUIDO' ? 'border-gray-100 bg-gray-50/50' : 'border-gray-100 hover:border-[#1c2b36]'}`}>
                          <div className="flex justify-between items-start mb-6">
                            <span className="text-xs font-extrabold text-[#1c2b36] bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest">{p.tipo}</span>
                            <StatusBadge status={p.status} expired={expired} />
                          </div>
                          <h3 className="font-extrabold text-2xl text-gray-900 mb-4 group-hover:text-[#1c2b36] transition line-clamp-2" title={p.titulo}>{p.titulo}</h3>
                          
                          <div className="flex flex-col gap-3 text-sm text-gray-600 mb-6 font-medium">
                            <span className="flex items-center gap-2"><div className="bg-gray-100 p-2 rounded-lg text-gray-500"><FaUserGraduate/></div> {p.docente?.nome?.split(' ')[0]}</span>
                            <span className="flex items-center gap-2"><div className="bg-gray-100 p-2 rounded-lg text-gray-500"><FaMapMarkerAlt/></div> {p.campus || 'Não definido'}</span>
                            <span className="flex items-center gap-2"><div className="bg-gray-100 p-2 rounded-lg text-gray-500"><FaClock/></div> {p.carga_horaria} horas</span>
                          </div>
                          
                          {p.status === 'ABERTO' && (
                            <div className={`text-sm font-extrabold mb-6 flex items-center gap-3 p-3 rounded-xl border ${expired ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
                              <FaCalendarAlt className={expired ? '' : 'animate-pulse text-lg'} /> 
                              {expired ? 'Inscrições Encerradas' : `Encerra em ${getDaysLeft(p.prazo_inscricao)} dias`}
                            </div>
                          )}
                          
                          <div className="mt-auto space-y-3">
                            <button onClick={() => setViewProj(p)} className="w-full py-3.5 rounded-2xl border-2 border-gray-200 text-gray-800 font-bold hover:bg-gray-50 hover:border-gray-300 transition">Ver Detalhes</button>
                            {user.role === 'docente' && p.status !== 'CONCLUIDO' && (
                              <div className="flex gap-2">
                                <button onClick={() => handleEditOrCreate(p)} className="flex-1 py-3 rounded-2xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition text-sm flex items-center justify-center gap-2"><FaEdit /> Editar</button>
                                <button onClick={() => handleCloseProject(p.id)} className="flex-1 py-3 rounded-2xl bg-yellow-50 text-yellow-700 font-bold hover:bg-yellow-100 transition text-sm flex items-center justify-center gap-2"><FaBan /> Fechar</button>
                                <button onClick={() => handleDeleteProject(p.id)} className="py-3 px-4 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center justify-center"><FaTrash /></button>
                              </div>
                            )}
                            {user.role === 'discente' && p.status === 'ABERTO' && !myStatusInProject(p.id) && !expired && (
                              <button onClick={() => apply(p.id)} className="w-full py-3.5 rounded-2xl bg-[#1c2b36] text-white font-bold hover:bg-gray-900 shadow-md transition">Quero Participar</button>
                            )}
                            {user.role === 'discente' && myStatusInProject(p.id) && (
                              <div className="w-full py-3.5 rounded-2xl bg-gray-100 text-center text-sm font-bold text-gray-600 border-2 border-gray-200">Candidatura Enviada</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ABA MURAIS */}
            {tab === 'murais' && user.role === 'discente' && (
              <div className="space-y-8 animate-fadeIn w-full max-w-4xl mx-auto">
                {data.applications.filter(app => app.status === 'ACEITA').length === 0 ? (
                  <div className="text-center py-24 bg-white rounded-[2rem] shadow-sm border border-gray-200">
                    <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FaRocket className="text-4xl text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Seu Mural está vazio</h3>
                    <p className="text-gray-500 font-medium">Você ainda não participa de nenhum projeto.</p>
                  </div>
                ) : (
                  data.applications.filter(app => app.status === 'ACEITA').map(app => (
                    <div key={app.id} className="bg-white rounded-[2rem] shadow-lg border border-gray-100 overflow-hidden">
                      <div className="bg-[#1c2b36] p-8 text-white flex justify-between items-center relative overflow-hidden">
                        <div className="relative z-10">
                          <h3 className="text-3xl font-extrabold mb-2">{app.project?.titulo}</h3>
                          <p className="text-gray-300 font-medium flex items-center gap-2"><FaUserGraduate /> Orientador: {app.project?.docente?.nome}</p>
                        </div>
                        <FaRocket className="text-8xl opacity-10 absolute -right-4 -bottom-4 transform rotate-12" />
                      </div>
                      <div className="p-8">
                        <h4 className="font-extrabold text-gray-900 text-xl mb-6 flex items-center gap-3"><FaBullhorn className="text-blue-500 text-2xl" /> Quadro de Avisos</h4>
                        <div className="space-y-4">
                          {app.project?.mural_posts?.length > 0 ? (
                            app.project.mural_posts.map(post => (
                              <div key={post.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                <p className="text-gray-800 whitespace-pre-wrap font-medium">{post.content}</p>
                                <p className="text-xs text-gray-500 mt-4 text-right flex items-center justify-end gap-1.5"><FaClock /> {formatDate(post.createdAt || post.created_at)}</p>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                              <p className="text-gray-500 font-bold">Nenhum aviso publicado pelo professor ainda.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ABA EQUIPES */}
            {tab === 'equipes' && user.role === 'docente' && (
              <div className="space-y-10 animate-fadeIn w-full max-w-5xl mx-auto">
                <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100 w-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-0"></div>
                  <h3 className="font-extrabold text-2xl mb-2 text-gray-900 relative z-10">Procurar Alunos</h3>
                  <p className="text-gray-500 mb-8 font-medium relative z-10">Busque por discentes cadastrados na plataforma para ver seus perfis e habilidades.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                    <div className="relative flex-1">
                      <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                      <input className="py-4 pl-14 pr-5 rounded-2xl border-2 border-gray-200 w-full bg-gray-50 focus:bg-white focus:border-[#1c2b36] outline-none transition font-medium" placeholder="Digite o nome do aluno..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchStudents()} />
                    </div>
                    <button onClick={searchStudents} className="bg-[#1c2b36] text-white px-10 py-4 rounded-2xl font-bold hover:bg-gray-900 transition shadow-md">Buscar</button>
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="mt-8 border-2 border-gray-100 rounded-2xl overflow-hidden bg-gray-50 shadow-inner relative z-10">
                      <ul className="max-h-[300px] overflow-y-auto divide-y divide-gray-200">
                        {searchResults.map(u => (
                          <li key={u.id} className="flex justify-between items-center bg-white p-5 hover:bg-blue-50 transition cursor-pointer group" onClick={() => setViewStudent(u)}>
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold">{u.nome.charAt(0)}</div>
                               <div>
                                 <p className="font-bold text-gray-900 group-hover:text-blue-700 transition">{u.nome}</p>
                                 <p className="text-sm text-gray-500">{u.email}</p>
                               </div>
                            </div>
                            <span className="text-sm font-bold text-[#1c2b36] bg-gray-100 px-4 py-2 rounded-xl group-hover:bg-[#1c2b36] group-hover:text-white transition">Ver Perfil</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="space-y-8">
                  {data.projects.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
                      <p className="text-gray-500 font-bold text-lg">Você ainda não criou nenhum projeto.</p>
                    </div>
                  )}
                  {data.projects.map(p => (
                    <div key={p.id} className="bg-white rounded-[2rem] shadow-lg border border-gray-100 overflow-hidden w-full">
                      <div className="p-8 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <span className="text-xs font-extrabold text-[#1c2b36] bg-blue-50 px-3 py-1.5 rounded-lg uppercase mb-3 inline-block tracking-widest">{p.tipo}</span>
                          <h3 className="font-extrabold text-3xl text-gray-900">{p.titulo}</h3>
                        </div>
                        <span className="text-sm font-bold text-gray-700 bg-white px-5 py-3 rounded-2xl border-2 border-gray-200 shadow-sm">
                          Vagas Preenchidas: <span className="text-[#1c2b36] font-extrabold">{p.applications?.filter(a => a.status === 'ACEITA').length || 0} / {p.vagas_totais}</span>
                        </span>
                      </div>
                      
                      <div className="p-8">
                        <h4 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center gap-3"><FaUsers className="text-blue-500" /> Membros Oficiais da Equipe</h4>
                        {(!p.applications || p.applications.filter(a => a.status === 'ACEITA').length === 0) ? (
                          <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-8 rounded-2xl text-center mb-10"><p className="text-gray-500 font-bold">Nenhum aluno aprovado nesta equipe.</p></div>
                        ) : (
                          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
                            {p.applications.filter(a => a.status === 'ACEITA').map(m => (
                              <div key={m.id} className="flex flex-col p-6 rounded-[1.5rem] border-2 border-gray-100 bg-white hover:border-[#1c2b36] hover:shadow-lg transition group">
                                <div className="flex items-center gap-4 cursor-pointer mb-6" onClick={() => setViewStudent(m.discente)}>
                                  <div className="w-14 h-14 bg-gray-100 text-[#1c2b36] rounded-2xl flex items-center justify-center font-extrabold text-xl group-hover:bg-[#1c2b36] group-hover:text-white transition">{m.discente?.nome?.charAt(0).toUpperCase()}</div>
                                  <div className="overflow-hidden">
                                    <p className="font-bold text-gray-900 truncate w-32">{m.discente?.nome}</p>
                                    <p className="text-xs text-gray-500 font-medium truncate w-32 mt-0.5">{m.discente?.email}</p>
                                  </div>
                                </div>
                                <button onClick={() => manageApp(m.id, 'RECUSADA', true)} className="mt-auto w-full text-sm text-red-600 font-bold border-2 border-red-100 bg-red-50 py-3 rounded-xl hover:bg-red-600 hover:text-white transition">Desligar Aluno</button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="bg-gray-50 p-8 rounded-[2rem] border-2 border-gray-100">
                          <h4 className="text-lg font-extrabold text-gray-900 mb-2 flex items-center gap-3"><FaBullhorn className="text-blue-500" /> Mural de Avisos da Equipe</h4>
                          <p className="text-sm text-gray-500 mb-6 font-medium">Escreva um aviso visível apenas para os alunos aprovados.</p>
                          <div className="flex flex-col gap-4 mb-8">
                            <textarea className="w-full border-2 border-gray-200 rounded-2xl p-5 text-sm bg-white focus:border-[#1c2b36] outline-none resize-none h-28 transition font-medium" placeholder="Ex: Reunião do projeto na próxima terça-feira..." value={postContent[p.id] || ''} onChange={(e) => setPostContent({ ...postContent, [p.id]: e.target.value })} />
                            <div className="flex justify-end"><button onClick={() => postToMural(p.id)} className="bg-[#1c2b36] text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-gray-900 shadow-md flex items-center gap-2 transition"><FaPaperPlane /> Publicar Aviso</button></div>
                          </div>
                          {p.mural_posts?.length > 0 && (
                            <div className="bg-white rounded-2xl border-2 border-gray-100 max-h-72 overflow-y-auto divide-y divide-gray-100 shadow-inner">
                              {p.mural_posts.map(post => (
                                <div key={post.id} className="p-6 hover:bg-gray-50 transition">
                                  <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed font-medium">{post.content}</p>
                                  <p className="text-xs text-gray-400 mt-3 flex justify-end items-center gap-1.5 font-bold"><FaClock /> Postado em {formatDate(post.createdAt || post.created_at)}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ABA CANDIDATURAS */}
            {tab === 'candidaturas' && (
              <div className="max-w-6xl mx-auto bg-white rounded-[2rem] shadow-lg border border-gray-100 overflow-hidden animate-slideIn">
                <div className="bg-[#1c2b36] p-8 text-white">
                    <h3 className="text-2xl font-extrabold flex items-center gap-3"><FaClipboardList className="text-blue-400"/> Gerenciar Candidaturas</h3>
                    <p className="text-gray-300 font-medium mt-2">Acompanhe o status das inscrições nos projetos.</p>
                </div>
                {data.applications.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50">
                        <p className="text-gray-500 font-bold text-lg">Nenhuma candidatura encontrada.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {data.applications.map(app => (
                            <div key={app.id} className="p-8 hover:bg-gray-50 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex-1">
                                    <p className="font-extrabold text-gray-900 text-xl mb-1">{app.project?.titulo}</p>
                                    {user.role === 'docente' && (
                                      <p className="text-sm text-blue-600 font-bold cursor-pointer hover:underline flex items-center gap-2 mt-2" onClick={() => setViewStudent(app.discente)}>
                                        <FaUserCircle/> Candidato: {app.discente?.nome}
                                      </p>
                                    )}
                                    <div className="mt-4 bg-gray-100 p-4 rounded-xl border border-gray-200 relative">
                                      <FaFileAlt className="absolute top-4 right-4 text-gray-300"/>
                                      <p className="text-sm text-gray-700 font-medium italic pr-6">"{app.mensagem}"</p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-start md:items-end gap-4 w-full md:w-auto">
                                    <StatusBadge status={app.status} />
                                    {user.role === 'docente' && app.status === 'PENDENTE' && (
                                        <div className="flex gap-3 w-full md:w-auto">
                                            <button onClick={()=>manageApp(app.id, 'ACEITA')} className="flex-1 md:flex-none bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 shadow-md transition">Aprovar</button>
                                            <button onClick={()=>manageApp(app.id, 'RECUSADA')} className="flex-1 md:flex-none border-2 border-red-200 text-red-600 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 transition">Recusar</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
              </div>
            )}

            {/* ABA PERFIL */}
            {tab === 'perfil' && user.role === 'discente' && (
              <form onSubmit={saveProfile} className="bg-white p-8 md:p-12 rounded-[2rem] shadow-lg border border-gray-100 max-w-4xl mx-auto animate-fadeIn relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-3 bg-[#1c2b36]"></div>
                <h3 className="font-extrabold text-3xl mb-8 text-gray-900 pb-4 border-b-2 border-gray-100 flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-2xl text-[#1c2b36]"><FaUserGraduate /></div> Meu Perfil
                </h3>
                
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Curso Acadêmico</label>
                    <input name="curso" defaultValue={data.profile.curso} className="w-full border-2 border-gray-200 p-4 rounded-2xl bg-gray-50 focus:bg-white focus:border-[#1c2b36] outline-none transition font-medium" placeholder="Ex: Engenharia de Software" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Campus</label>
                    <input name="campus" defaultValue={data.profile.campus} className="w-full border-2 border-gray-200 p-4 rounded-2xl bg-gray-50 focus:bg-white focus:border-[#1c2b36] outline-none transition font-medium" placeholder="Ex: Campus Central" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Período Atual</label>
                    <select name="periodo" defaultValue={data.profile.periodo} className="w-full border-2 border-gray-200 p-4 rounded-2xl bg-gray-50 focus:bg-white focus:border-[#1c2b36] outline-none transition font-bold text-gray-700 cursor-pointer">
                      <option value="">Selecione seu período...</option>
                      {[...Array(10)].map((_, i) => <option key={i} value={`${i+1}º`}>{i+1}º Período</option>)}
                      <option value="Finalista">Finalista</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Telefone / WhatsApp</label>
                    <input name="telefone" defaultValue={data.profile.telefone} className="w-full border-2 border-gray-200 p-4 rounded-2xl bg-gray-50 focus:bg-white focus:border-[#1c2b36] outline-none transition font-medium" placeholder="(00) 00000-0000" />
                  </div>
                </div>

                <div className="mb-10 bg-gray-50 p-6 rounded-[2rem] border-2 border-gray-100">
                  <label className="block text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-2"><FaRocket className="text-blue-500"/> Minhas Habilidades</label>
                  <p className="text-sm text-gray-500 font-medium mb-4">Adicione ferramentas, linguagens ou competências que você domina.</p>
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <input value={skillInput} onChange={e => setSkillInput(e.target.value)} className="w-full border-2 border-gray-200 p-4 rounded-2xl bg-white focus:border-[#1c2b36] outline-none transition font-medium" placeholder="Ex: Python, React, Gestão de Projetos..." onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(e); } }}/>
                    <button type="button" onClick={addSkill} className="bg-[#1c2b36] text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-900 transition shadow-md whitespace-nowrap">Adicionar</button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[60px] p-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
                    {skillsList.length === 0 ? <p className="text-sm text-gray-400 font-medium italic w-full text-center mt-2">Nenhuma habilidade adicionada ainda.</p> : null}
                    {skillsList.map((skill, index) => (
                        <span key={index} className="bg-[#1c2b36] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-3 shadow-sm">
                          {skill}
                          <button type="button" onClick={() => removeSkill(index)} className="text-gray-300 hover:text-red-400 transition"><FaTimes/></button>
                        </span>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-10">
                  <div className="relative">
                    <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2"><FaFileAlt className="text-gray-500"/> Link do Currículo Lattes</label>
                    <input name="link_lattes" defaultValue={data.profile.link_lattes} className="w-full border-2 border-gray-200 p-4 rounded-2xl bg-gray-50 focus:bg-white focus:border-[#1c2b36] outline-none transition font-medium text-blue-600" placeholder="https://lattes.cnpq.br/..." />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2"><FaGithub className="text-gray-500"/> Link do GitHub / Portfólio</label>
                    <input name="link_github" defaultValue={data.profile.link_github} className="w-full border-2 border-gray-200 p-4 rounded-2xl bg-gray-50 focus:bg-white focus:border-[#1c2b36] outline-none transition font-medium text-blue-600" placeholder="https://github.com/..." />
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="bg-green-600 text-white w-full py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-green-700 transition flex items-center justify-center gap-2">
                  {isSubmitting ? <><FaSpinner className="animate-spin" /> Salvando...</> : 'Salvar Alterações do Perfil'}
                </button>
              </form>
            )}
          </>
        )}

        {/* -------------------------------------------------------------------------
            🚨 MODAIS DE CRIAÇÃO, VISUALIZAÇÃO DE PROJETO E ALUNO 🚨 
            ------------------------------------------------------------------------- */}

        {/* MODAL DE CRIAR/EDITAR PROJETO */}
        {projectModalData && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[80] p-4 transition-opacity">
            <form onSubmit={saveProject} className="bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative animate-slideIn custom-scrollbar">
              <button type="button" onClick={() => setProjectModalData(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition bg-gray-100 p-2 rounded-xl">
                <FaTimes size={18} />
              </button>
              
              <h3 className="font-extrabold text-3xl mb-8 text-gray-900 border-b-2 border-gray-100 pb-4">
                {projectModalData.id ? 'Editar Projeto' : 'Criar Novo Projeto'}
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Título do Projeto</label>
                  <input name="titulo" defaultValue={projectModalData.titulo} required className="w-full border-2 border-gray-200 p-4 rounded-2xl bg-gray-50 focus:bg-white focus:border-[#1c2b36] outline-none transition font-medium text-lg" placeholder="Ex: Impactos da IA na Educação..." />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Descrição Detalhada</label>
                  <textarea name="descricao" defaultValue={projectModalData.descricao} required className="w-full border-2 border-gray-200 p-4 rounded-2xl bg-gray-50 focus:bg-white focus:border-[#1c2b36] outline-none transition h-32 resize-none font-medium" placeholder="Explique os detalhes, metodologia e o que espera alcançar..." />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-gray-100">
                    <label className="block text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-2"><FaListUl className="text-blue-500"/> Objetivos do Projeto</label>
                    <div className="flex flex-col gap-3 mb-2">
                      <input value={objInput} onChange={e => setObjInput(e.target.value)} className="w-full border-2 border-gray-200 p-3.5 rounded-xl bg-white outline-none focus:border-[#1c2b36] transition font-medium" placeholder="Ex: Desenvolver MVP..." onKeyDown={e => { if(e.key === 'Enter'){ e.preventDefault(); addObj(e); } }}/>
                      <button type="button" onClick={addObj} className="bg-[#1c2b36] text-white w-full py-3 rounded-xl font-bold hover:bg-gray-900 transition flex justify-center items-center gap-2"><FaPlus/> Adicionar Objetivo</button>
                    </div>
                    {objList.length > 0 && <ul className="mt-4 space-y-2">{objList.map((x,i) => <li key={i} className="flex justify-between items-center bg-white border border-gray-200 p-3 rounded-xl font-medium text-sm text-gray-700">{x} <button type="button" onClick={()=>removeObj(i)} className="text-gray-300 hover:text-red-500 transition p-1"><FaTimes/></button></li>)}</ul>}
                  </div>

                  <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-gray-100">
                    <label className="block text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-2"><FaCheck className="text-green-500"/> Pré-Requisitos para Alunos</label>
                    <div className="flex flex-col gap-3 mb-2">
                      <input value={reqInput} onChange={e => setReqInput(e.target.value)} className="w-full border-2 border-gray-200 p-3.5 rounded-xl bg-white outline-none focus:border-[#1c2b36] transition font-medium" placeholder="Ex: Conhecimento em Python..." onKeyDown={e => { if(e.key === 'Enter'){ e.preventDefault(); addReq(e); } }}/>
                      <button type="button" onClick={addReq} className="bg-[#1c2b36] text-white w-full py-3 rounded-xl font-bold hover:bg-gray-900 transition flex justify-center items-center gap-2"><FaPlus/> Adicionar Requisito</button>
                    </div>
                    {reqList.length > 0 && <ul className="mt-4 space-y-2">{reqList.map((x,i) => <li key={i} className="flex justify-between items-center bg-white border border-gray-200 p-3 rounded-xl font-medium text-sm text-gray-700">{x} <button type="button" onClick={()=>removeReq(i)} className="text-gray-300 hover:text-red-500 transition p-1"><FaTimes/></button></li>)}</ul>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Campus de Realização</label>
                    <input name="campus" defaultValue={projectModalData.campus} required className="w-full border-2 border-gray-200 p-4 rounded-2xl bg-gray-50 focus:bg-white focus:border-[#1c2b36] outline-none transition font-medium" placeholder="Ex: Campus Norte" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Carga Horária Total (h)</label>
                    <input name="carga_horaria" type="number" defaultValue={projectModalData.carga_horaria} required className="w-full border-2 border-gray-200 p-4 rounded-2xl bg-gray-50 focus:bg-white focus:border-[#1c2b36] outline-none transition font-medium" placeholder="Ex: 40" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-1">
                    <label className="block text-sm font-bold text-gray-900 mb-2">Tipo do Projeto</label>
                    <select name="tipo" defaultValue={projectModalData.tipo || 'PESQUISA'} className="w-full border-2 border-gray-200 p-4 rounded-2xl bg-gray-50 focus:bg-white focus:border-[#1c2b36] outline-none transition font-bold text-gray-700 cursor-pointer">
                      <option value="PESQUISA">Pesquisa</option>
                      <option value="EXTENSAO">Extensão</option>
                      <option value="VOLUNTARIO">Voluntário</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-bold text-gray-900 mb-2">Total de Vagas</label>
                    <input name="vagas_totais" type="number" min="1" defaultValue={projectModalData.vagas_totais} required className="w-full border-2 border-gray-200 p-4 rounded-2xl bg-gray-50 focus:bg-white focus:border-[#1c2b36] outline-none transition font-medium text-center" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-bold text-gray-900 mb-2">Data Limite</label>
                    <input name="prazo_inscricao" type="date" defaultValue={projectModalData.prazo_inscricao?.split('T')[0]} required className="w-full border-2 border-gray-200 p-4 rounded-2xl bg-gray-50 focus:bg-white focus:border-[#1c2b36] outline-none transition font-bold text-gray-700 cursor-pointer" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 pt-8 mt-8 border-t-2 border-gray-100">
                <button type="button" onClick={() => setProjectModalData(null)} className="px-8 py-4 text-gray-600 font-bold hover:bg-gray-100 rounded-2xl transition border-2 border-transparent">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="bg-green-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:bg-green-700 transition flex items-center gap-2 text-lg">
                  {isSubmitting ? <><FaSpinner className="animate-spin" /> Salvando...</> : (projectModalData.id ? 'Salvar Alterações' : 'Publicar Projeto')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL DE VISUALIZAR DETALHES DO PROJETO */}
        {viewProj && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[80] p-4 transition-opacity">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-slideIn custom-scrollbar">
              <button onClick={() => setViewProj(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition bg-gray-100 p-3 rounded-2xl">
                <FaTimes size={20} />
              </button>
              
              <div className="flex flex-col md:flex-row justify-between items-start mb-8 border-b-2 border-gray-100 pb-6 pr-12 gap-4">
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="bg-[#1c2b36] text-white px-4 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-widest">{viewProj.tipo}</span>
                    <StatusBadge status={viewProj.status} expired={checkExpired(viewProj.prazo_inscricao)} />
                  </div>
                  <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">{viewProj.titulo}</h2>
                  <p className="text-base text-gray-600 mt-3 flex items-center gap-2 font-medium"><FaUserGraduate className="text-blue-500 text-lg"/> Orientador: <span className="font-bold text-gray-900">{viewProj.docente?.nome}</span></p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 border-2 border-gray-100 p-5 rounded-2xl text-center"><p className="text-xs text-gray-500 font-extrabold uppercase tracking-widest mb-1">Campus</p><p className="font-extrabold text-xl text-gray-900">{viewProj.campus || '-'}</p></div>
                <div className="bg-gray-50 border-2 border-gray-100 p-5 rounded-2xl text-center"><p className="text-xs text-gray-500 font-extrabold uppercase tracking-widest mb-1">Carga Horária</p><p className="font-extrabold text-xl text-gray-900">{viewProj.carga_horaria}h</p></div>
                <div className="bg-blue-50 border-2 border-blue-100 p-5 rounded-2xl text-center"><p className="text-xs text-blue-600 font-extrabold uppercase tracking-widest mb-1">Vagas Livres</p><p className="font-extrabold text-xl text-blue-900">{Math.max(0, viewProj.vagas_totais - viewProj.vagas_ocupadas)}</p></div>
                <div className="bg-gray-50 border-2 border-gray-100 p-5 rounded-2xl text-center"><p className="text-xs text-gray-500 font-extrabold uppercase tracking-widest mb-1">Ocupação</p><p className="font-extrabold text-xl text-gray-900">{viewProj.vagas_ocupadas}/{viewProj.vagas_totais}</p></div>
              </div>
              
              <div className="space-y-8 text-gray-800">
                <div>
                  <h3 className="font-extrabold text-xl text-gray-900 mb-4 flex items-center gap-3"><div className="bg-[#1c2b36] p-2 rounded-xl text-white"><FaFileAlt size={16}/></div> Resumo do Projeto</h3>
                  <p className="leading-relaxed bg-white border-2 border-gray-100 p-6 rounded-[2rem] text-base font-medium text-gray-600">{viewProj.descricao}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white border-2 border-gray-100 p-6 rounded-[2rem]">
                      <h3 className="font-extrabold text-lg text-gray-900 mb-4 flex items-center gap-2"><FaListUl className="text-blue-500"/> Objetivos Mapeados</h3>
                      {renderList(viewProj.objetivos)}
                    </div>
                    <div className="bg-white border-2 border-gray-100 p-6 rounded-[2rem]">
                      <h3 className="font-extrabold text-lg text-gray-900 mb-4 flex items-center gap-2"><FaCheck className="text-green-500"/> Requisitos Exigidos</h3>
                      {renderList(viewProj.requisitos)}
                    </div>
                </div>
              </div>
              
              <div className="mt-10 pt-8 border-t-2 border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className={`text-base font-bold flex items-center gap-3 px-6 py-4 rounded-2xl border-2 ${checkExpired(viewProj.prazo_inscricao) ? 'bg-gray-50 text-gray-500 border-gray-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
                  <FaClock className="text-xl"/>
                  <div>
                    <p className="text-xs uppercase tracking-widest opacity-80">{checkExpired(viewProj.prazo_inscricao) ? 'Status' : 'Prazo Final'}</p>
                    <p>{checkExpired(viewProj.prazo_inscricao) ? 'Inscrições Encerradas' : new Date(viewProj.prazo_inscricao).toLocaleDateString()}</p>
                  </div>
                </div>

                {user.role === 'discente' && !myStatusInProject(viewProj.id) && viewProj.status === 'ABERTO' && !checkExpired(viewProj.prazo_inscricao) && (
                  <button onClick={() => { apply(viewProj.id); setViewProj(null); }} className="bg-[#1c2b36] text-white px-12 py-5 rounded-2xl font-bold hover:bg-gray-900 shadow-xl transition w-full md:w-auto text-lg flex items-center justify-center gap-3 hover:-translate-y-1">
                    Quero me Candidatar <FaRocket/>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE VISUALIZAR PERFIL DO ALUNO */}
        {viewStudent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[80] p-4 transition-opacity">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md relative animate-slideIn">
              <button onClick={() => setViewStudent(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition bg-gray-100 p-2 rounded-xl">
                <FaTimes size={18} />
              </button>
              
              <div className="text-center mb-8 pt-6">
                <div className="w-28 h-28 bg-[#1c2b36] text-white rounded-3xl flex items-center justify-center text-5xl font-extrabold mx-auto mb-6 shadow-xl transform rotate-3">
                  <div className="-rotate-3">{viewStudent.nome.charAt(0).toUpperCase()}</div>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">{viewStudent.nome}</h2>
                <p className="text-sm font-bold text-blue-600 mt-1">{viewStudent.email}</p>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100 text-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-extrabold text-gray-400 uppercase tracking-widest">Curso</span> 
                    <span className="font-bold text-gray-900">{viewStudent.profile?.curso || 'Não informado'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-gray-400 uppercase tracking-widest">Período</span> 
                    <span className="font-bold text-gray-900">{viewStudent.profile?.periodo || 'Não informado'}</span>
                  </div>
                </div>

                <div className="border-2 border-gray-100 p-6 rounded-2xl">
                  <h3 className="font-extrabold text-gray-900 text-sm mb-4 uppercase tracking-widest">Habilidades</h3>
                  <div className="flex flex-wrap gap-2">{renderSkills(viewStudent.profile?.habilidades)}</div>
                </div>

                {viewStudent.profile?.telefone && (
                  <div className="pt-2">
                    <a href={`https://wa.me/${viewStudent.profile.telefone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 text-white bg-green-500 py-4 rounded-2xl shadow-lg font-bold text-lg hover:bg-green-600 transition hover:-translate-y-1">
                      <FaWhatsapp className="text-2xl"/> Iniciar Conversa
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE SUCESSO (Mensagem Rápida) */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4 transition-opacity">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-sm text-center relative animate-slideIn">
              <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCheckCircle className="text-green-500 text-5xl" />
              </div>
              <h3 className="font-extrabold text-2xl text-gray-900 mb-3">Tudo Certo!</h3>
              <p className="text-gray-600 mb-8 font-medium">A operação foi salva com sucesso no sistema.</p>
              <button onClick={() => setShowSuccessModal(false)} className="bg-[#1c2b36] text-white w-full py-4 rounded-2xl font-bold text-lg hover:bg-gray-900 transition shadow-lg">
                Continuar
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}