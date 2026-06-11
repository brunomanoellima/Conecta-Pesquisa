import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link, Navigate } from 'react-router-dom';
import { 
  FaSearch, FaGithub, FaFileAlt, FaWhatsapp, FaCalendarAlt, FaClock, FaMapMarkerAlt, 
  FaUserGraduate, FaEnvelope, FaExternalLinkAlt, FaTimes, FaUniversity, 
  FaLayerGroup, FaClipboardList, FaUsers, FaRocket, FaUserCircle, FaPowerOff, 
  FaChevronLeft, FaChevronRight, FaBullhorn, FaPaperPlane, FaTrash, FaPlus, FaListUl, FaCheckCircle, FaEdit, FaBan, FaCheck,
  FaExclamationTriangle, FaQuestionCircle, FaInfoCircle, FaSpinner, FaEye, FaEyeSlash, FaFilter
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

// --- FUNDO DAS TELAS DE LOGIN E CADASTRO ---
const authBackgroundStyle = {
  backgroundImage:
    "linear-gradient(rgba(5, 18, 35, 0.45), rgba(5, 18, 35, 0.55)), url('/imagens/fundo-conecta.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
};

// COMPONENTE DE LOADING GLOBAL
const LoadingSpinner = ({ message = "Carregando..." }) => (
  <div className="flex flex-col items-center justify-center p-8 text-gray-500">
    <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
    <p className="font-medium animate-pulse">{message}</p>
  </div>
);

const StatusBadge = ({ status, expired }) => {
  if (status === 'ABERTO' && expired) {
    return <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gray-200 text-gray-600 border border-gray-300 shadow-sm">Prazo Vencido</span>;
  }

  const styles = {
    'ABERTO': 'bg-green-100 text-green-700 border border-green-200',
    'CONCLUIDO': 'bg-gray-100 text-gray-600 border border-gray-200',
    'PENDENTE': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    'ACEITA': 'bg-blue-100 text-blue-700 border border-blue-200',
    'RECUSADA': 'bg-red-50 text-red-600 border border-red-200',
    'NAO_AVALIADA_ENCERRADA': 'bg-gray-200 text-gray-500 border border-gray-300'
  };

  return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
};

// --- MENSAGENS COM ÍCONES ---
const messageIconStyles = {
  success: { icon: FaCheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  error: { icon: FaExclamationTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  warning: { icon: FaExclamationTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  info: { icon: FaInfoCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  question: { icon: FaQuestionCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
};

function FeedbackModal({ data, onClose }) {
  if (!data) return null;

  const style = messageIconStyles[data.type || 'info'];
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[70] p-4 transition-opacity">
      <div className={`bg-white p-7 rounded-2xl shadow-2xl w-full max-w-md border ${style.border} animate-slideIn`}>
        <div className={`w-14 h-14 ${style.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <Icon className={`text-3xl ${style.color}`} />
        </div>

        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">{data.title}</h3>
        <p className="text-gray-600 text-center mb-6 leading-relaxed">{data.message}</p>

        <button
          onClick={onClose}
          className="bg-blue-600 text-white w-full py-3 rounded-lg font-bold hover:bg-blue-700 transition focus:ring-4 focus:ring-blue-200"
        >
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[70] p-4">
      <div className={`bg-white p-7 rounded-2xl shadow-2xl w-full max-w-md border ${style.border} animate-slideIn`}>
        <div className={`w-14 h-14 ${style.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <Icon className={`text-3xl ${style.color}`} />
        </div>

        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">{data.title}</h3>
        <p className="text-gray-600 text-center mb-6 leading-relaxed">{data.message}</p>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="border border-gray-300 text-gray-600 py-3 rounded-lg font-bold hover:bg-gray-50 transition focus:ring-4 focus:ring-gray-100"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={data.onConfirm}
            className="bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition focus:ring-4 focus:ring-blue-200"
          >
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[70] p-4">
      <form onSubmit={submit} className={`bg-white p-7 rounded-2xl shadow-2xl w-full max-w-md border ${style.border} animate-slideIn`}>
        <div className={`w-14 h-14 ${style.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <Icon className={`text-3xl ${style.color}`} />
        </div>

        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">{data.title}</h3>
        <p className="text-gray-600 text-center mb-4 leading-relaxed">{data.message}</p>

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 min-h-[110px] mb-5 focus:ring-2 focus:ring-blue-500 outline-none transition"
          placeholder={data.placeholder || 'Digite sua resposta...'}
          autoFocus
        />

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="border border-gray-300 text-gray-600 py-3 rounded-lg font-bold hover:bg-gray-50 transition"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={!value.trim()}
            className="bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
          >
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
    <div
      className="absolute top-1/2 -translate-y-1/2 right-8 z-20 cursor-pointer text-white opacity-60 hover:opacity-100 transition-all hover:scale-110 drop-shadow-lg"
      onClick={onClick}
      aria-label="Próximo"
    >
      <FaChevronRight className="text-5xl" />
    </div>
  );
}

function SamplePrevArrow(props) {
  const { onClick } = props;

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 left-8 z-20 cursor-pointer text-white opacity-60 hover:opacity-100 transition-all hover:scale-110 drop-shadow-lg"
      onClick={onClick}
      aria-label="Anterior"
    >
      <FaChevronLeft className="text-5xl" />
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
    <div
      className="min-h-screen flex justify-center items-center p-4 relative overflow-hidden"
      style={authBackgroundStyle}
    >
      <FeedbackModal data={feedback} onClose={() => setFeedback(null)} />

      <form
        onSubmit={handle}
        className="bg-white/20 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/30 animate-fadeIn"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-white/20 text-white p-4 rounded-full shadow-lg border border-white/30">
            <FaUniversity className="text-3xl" />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-white mb-2 text-center drop-shadow">
          Conecta Pesquisa
        </h2>

        <p className="text-center text-blue-50 mb-8 text-sm">
          Acesse sua conta para continuar
        </p>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="sr-only">E-mail</label>
            <input
              required
              type="email"
              className="bg-white/85 border border-white/50 w-full p-3.5 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none transition text-gray-800 placeholder-gray-500"
              placeholder="Seu e-mail acadêmico"
              onChange={e => setForm({ ...form, email: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <label className="sr-only">Senha</label>
            <input
              required
              type={showPwd ? 'text' : 'password'}
              className="bg-white/85 border border-white/50 w-full p-3.5 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none transition pr-12 text-gray-800 placeholder-gray-500"
              placeholder="Sua senha"
              onChange={e => setForm({ ...form, password: e.target.value })}
              disabled={isLoading}
            />

            <button
              type="button"
              tabIndex="-1"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 transition"
              onClick={() => setShowPwd(!showPwd)}
            >
              {showPwd ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-700 text-white w-full py-3.5 rounded-xl font-bold hover:bg-blue-800 transition flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin" /> Entrando...
            </>
          ) : (
            'Entrar na Plataforma'
          )}
        </button>

        <div className="mt-6 text-center border-t border-white/20 pt-4">
          <span className="text-blue-50 text-sm">Novo por aqui? </span>
          <Link to="/register" className="text-sm font-bold text-white hover:underline">
            Criar Conta
          </Link>
        </div>
      </form>
    </div>
  );
}

function Register() {
  const [form, setForm] = useState({ nome: '', email: '', password: '', role: 'discente' });
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post('/auth/register', form);

      setFeedback({
        type: 'success',
        title: 'Conta criada com sucesso',
        message: 'Seu cadastro foi realizado. Redirecionando para o login...'
      });

      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Erro no cadastro',
        message: err.response?.data?.error || 'Não foi possível concluir o cadastro. Confira os dados e tente novamente.'
      });

      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center p-4 relative overflow-hidden"
      style={authBackgroundStyle}
    >
      <FeedbackModal data={feedback} onClose={() => setFeedback(null)} />

      <form
        onSubmit={handle}
        className="bg-white/20 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/30 animate-fadeIn my-8"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-white/20 text-white p-4 rounded-full shadow-lg border border-white/30">
            <FaUserGraduate className="text-3xl" />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-white mb-2 text-center drop-shadow">
          Criar Nova Conta
        </h2>

        <p className="text-center text-blue-50 mb-8 text-sm">
          Preencha os dados para acessar os projetos
        </p>
        
        <div className="space-y-4 mb-8">
          <input
            required
            className="bg-white/85 border border-white/50 w-full p-3.5 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none text-gray-800 placeholder-gray-500"
            placeholder="Nome Completo"
            onChange={e => setForm({ ...form, nome: e.target.value })}
            disabled={isLoading}
          />

          <input
            required
            type="email"
            className="bg-white/85 border border-white/50 w-full p-3.5 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none text-gray-800 placeholder-gray-500"
            placeholder="E-mail Acadêmico"
            onChange={e => setForm({ ...form, email: e.target.value })}
            disabled={isLoading}
          />
          
          <div className="relative">
            <input
              required
              type={showPwd ? 'text' : 'password'}
              minLength="6"
              className="bg-white/85 border border-white/50 w-full p-3.5 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none pr-12 text-gray-800 placeholder-gray-500"
              placeholder="Crie uma Senha"
              onChange={e => setForm({ ...form, password: e.target.value })}
              disabled={isLoading}
            />

            <button
              type="button"
              tabIndex="-1"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
              onClick={() => setShowPwd(!showPwd)}
            >
              {showPwd ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-50 mb-1">
              Eu sou um(a):
            </label>

            <select
              className="bg-white/85 border border-white/50 w-full p-3.5 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none text-gray-800"
              onChange={e => setForm({ ...form, role: e.target.value })}
              disabled={isLoading}
            >
              <option value="discente">Aluno (Discente)</option>
              <option value="docente">Professor (Docente)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-green-600 text-white w-full py-3.5 rounded-xl font-bold hover:bg-green-700 transition flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin" /> Cadastrando...
            </>
          ) : (
            'Finalizar Cadastro'
          )}
        </button>

        <div className="mt-6 text-center border-t border-white/20 pt-4">
          <span className="text-blue-50 text-sm">Já possui uma conta? </span>
          <Link to="/" className="text-sm font-bold text-white hover:underline">
            Fazer Login
          </Link>
        </div>
      </form>
    </div>
  );
}

// --- DASHBOARD ---
function Dashboard() {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

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
    if (!user) {
      localStorage.clear();
      navigate('/');
    } else {
      load();
    }
    // eslint-disable-next-line
  }, []);

  const load = async () => {
    setIsLoading(true);

    try {
      const p = await api.get('/projects');
      const a = await api.get('/applications');

      if (user.role === 'discente') {
        const prof = await api.get('/profile');

        setData({
          projects: p.data,
          applications: a.data,
          profile: prof.data
        });

        if (prof.data.habilidades) {
          setSkillsList(safeParse(prof.data.habilidades));
        }
      } else { 
        setData({
          projects: p.data,
          applications: a.data,
          profile: {}
        }); 
      }
    } catch (e) { 
      console.error(e); 

      if (e.response && e.response.status === 401) {
        localStorage.clear();
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    arrows: true,
    fade: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    appendDots: dots => <div style={{ bottom: "20px" }}><ul className="m-0 p-0"> {dots} </ul></div>,
    customPaging: i => <div className="w-3 h-3 mx-1 bg-white/50 rounded-full transition-all hover:bg-white hover:scale-110"></div>
  };

  const carouselSlides = [
    {
      id: 1,
      title: "Explore o Conhecimento",
      desc: "Conecte-se com projetos inovadores e professores experientes.",
      img: "/imagens/pesquisa.jpg",
      btnText: "Ver Pesquisas"
    },
    {
      id: 2,
      title: "Ações de Extensão",
      desc: "Conecte a universidade com a comunidade.",
      img: "/imagens/Extensao.jpg",
      btnText: "Ver Extensão"
    },
    {
      id: 3,
      title: "Trabalho Voluntário",
      desc: "Contribua com seu tempo e habilidades.",
      img: "/imagens/Volutario.jpg",
      btnText: "Ser Voluntário"
    }
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
      type: 'warning',
      title: 'Encerrar projeto?',
      message: 'As inscrições serão fechadas. Candidaturas pendentes serão marcadas como não avaliadas.',
      onConfirm: async () => {
        clearConfirm();

        try {
          await api.post(`/projects/${id}/close`);
          notify('success', 'Projeto encerrado', 'O projeto foi concluído com sucesso.');
          load();
        } catch (err) {
          notify('error', 'Erro ao encerrar', err.response?.data?.error || 'Não foi possível encerrar o projeto.');
        }
      }
    });
  };

  const handleDeleteProject = async (id) => {
    setConfirmDialog({
      type: 'warning',
      title: 'Atenção: Excluir projeto?',
      message: 'Essa ação é irreversível. O projeto e todas as candidaturas associadas serão removidos.',
      onConfirm: async () => {
        clearConfirm();

        try {
          await api.delete(`/projects/${id}`);
          notify('success', 'Projeto excluído', 'O projeto foi removido com sucesso.');
          load();
        } catch (err) {
          notify('error', 'Erro ao excluir', err.response?.data?.error || 'Não foi possível excluir o projeto.');
        }
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
      if (projectModalData && projectModalData.id) {
        await api.put(`/projects/${projectModalData.id}`, body); 
      } else {
        await api.post('/projects', body);
      }

      setProjectModalData(null); 
      setObjList([]);
      setReqList([]);

      load();
      setShowSuccessModal(true);
    } catch (err) {
      notify('error', 'Erro ao salvar', err.response?.data?.error || 'Verifique os dados preenchidos.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const addSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim()) {
      setSkillsList([...skillsList, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (i) => setSkillsList(skillsList.filter((_, idx) => idx !== i));

  const addObj = (e) => {
    e.preventDefault();
    if (objInput.trim()) {
      setObjList([...objList, objInput.trim()]);
      setObjInput('');
    }
  };

  const removeObj = (i) => setObjList(objList.filter((_, idx) => idx !== i));

  const addReq = (e) => {
    e.preventDefault();
    if (reqInput.trim()) {
      setReqList([...reqList, reqInput.trim()]);
      setReqInput('');
    }
  };

  const removeReq = (i) => setReqList(reqList.filter((_, idx) => idx !== i));

  const saveProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData);

    body.habilidades = JSON.stringify(skillsList);

    try {
      await api.put('/profile', body);
      notify('success', 'Perfil Atualizado', 'Suas informações foram salvas. Elas ajudarão os professores a te conhecerem melhor.');
      load();
    } catch (err) {
      notify('error', 'Erro ao salvar perfil', err.response?.data?.error || 'Tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const apply = async (id) => {
    setInputDialog({
      type: 'question',
      title: 'Por que você quer participar?',
      message: 'Escreva uma breve mensagem para o professor explicando seu interesse.',
      placeholder: 'Olá professor, me interessei pela pesquisa porque...',
      onConfirm: async (msg) => {
        clearInput();

        try {
          await api.post(`/projects/${id}/apply`, { mensagem: msg });
          notify('success', 'Inscrição Enviada!', 'O docente avaliará sua candidatura em breve. Fique de olho no seu painel.');
          load();
        } catch (err) {
          notify('error', 'Erro na inscrição', err.response?.data?.error || 'Não foi possível enviar sua candidatura agora.');
        }
      }
    });
  };
  
  const updateApplicationStatus = async (id, status, reason = '') => {
    try {
      await api.put(`/applications/${id}`, { status, reason });
      notify('success', 'Ação concluída', `O status do aluno foi atualizado para ${status}.`);
      load();
    } catch (err) {
      notify('error', 'Erro na atualização', err.response?.data?.error || 'Tente recarregar a página.');
    }
  };

  const manageApp = async (id, status, isRemoval) => {
    if (isRemoval) {
      setInputDialog({
        type: 'warning',
        title: 'Motivo do desligamento',
        message: 'Para manter o histórico, explique brevemente o motivo de remover este aluno da equipe.',
        placeholder: 'Falta de participação, conclusão de carga horária...',
        onConfirm: async (reason) => {
          clearInput();
          await updateApplicationStatus(id, status, reason);
        }
      });

      return;
    }

    setConfirmDialog({
      type: status === 'ACEITA' ? 'success' : 'warning',
      title: status === 'ACEITA' ? 'Aprovar Aluno?' : 'Recusar Aluno?',
      message: status === 'ACEITA'
        ? 'Este aluno será adicionado à sua equipe oficial do projeto.'
        : 'A candidatura será recusada. Esta ação não pode ser desfeita.',
      onConfirm: async () => {
        clearConfirm();
        await updateApplicationStatus(id, status);
      }
    });
  };

  const postToMural = async (projectId) => {
    const content = postContent[projectId];

    if (!content) {
      return notify('warning', 'Aviso Vazio', 'Você precisa digitar algo para publicar.');
    }

    try {
      await api.post(`/projects/${projectId}/mural`, { content });
      notify('success', 'Mural Atualizado', 'Sua mensagem já está visível para a equipe.');
      setPostContent({ ...postContent, [projectId]: '' });
      load();
    } catch (e) {
      notify('error', 'Erro ao publicar', 'Verifique sua conexão e tente novamente.');
    }
  };

  const searchStudents = async () => {
    if (!search.trim()) return;

    setIsLoading(true);

    try {
      const res = await api.get(`/users/search?nome=${search}`);
      setSearchResults(res.data);

      if (res.data.length === 0) {
        notify('info', 'Busca sem resultados', `Não encontramos nenhum aluno chamado "${search}".`);
      }
    } catch (err) {
      notify('error', 'Falha na busca', 'Erro ao contatar o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const myStatusInProject = (pid) => {
    if (user.role !== 'discente') return null;
    const app = data.applications.find(a => a.project_id === pid);
    return app ? app.status : null;
  };

  const renderList = (json) => {
    const list = safeParse(json);

    if (list.length > 0) {
      return (
        <ul className="list-disc pl-5 space-y-1">
          {list.map((x, i) => (
            <li key={i} className="text-sm text-gray-700">{x}</li>
          ))}
        </ul>
      );
    }

    return <p className="text-sm text-gray-400">Nenhum item informado.</p>;
  };

  const renderSkills = (json) => {
    const list = safeParse(json);

    if (list.length > 0) {
      return list.map((x, i) => (
        <span key={i} className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{x}</span>
      ));
    }

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
    const matchText =
      p.titulo.toLowerCase().includes(filterText.toLowerCase()) ||
      p.tipo.toLowerCase().includes(filterText.toLowerCase());

    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;

    return matchText && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <FeedbackModal data={feedback} onClose={() => setFeedback(null)} />
      <ConfirmModal data={confirmDialog} onCancel={clearConfirm} />
      <InputModal data={inputDialog} onCancel={clearInput} />
      
      <header className="bg-white shadow-sm sticky top-0 z-30 w-full border-b border-gray-200">
        <div className="w-full px-4 md:px-8 py-4 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-blue-700 text-white p-2.5 rounded-xl font-bold text-xl shadow-sm">
              <FaUniversity />
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight hidden sm:block">
                Conecta Pesquisa
              </h1>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                Painel {user.role === 'discente' ? 'do Aluno' : 'do Professor'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 hidden md:block">
              Olá, {user.nome.split(' ')[0]}
            </span>

            <button
              onClick={() => {
                localStorage.clear();
                navigate('/');
              }}
              className="group flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 transition-all duration-300 border border-gray-200 hover:border-red-200"
            >
              <FaPowerOff className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="w-full px-4 md:px-8 py-8 max-w-7xl mx-auto">
        <nav className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 w-full bg-white p-2 rounded-2xl shadow-sm border border-gray-200 overflow-x-auto" aria-label="Navegação Principal">
          {[
            { id: 'projetos', label: 'Projetos', role: 'both' },
            { id: 'candidaturas', label: 'Candidaturas', role: 'both' },
            { id: 'equipes', label: 'Minhas Equipes', role: 'docente' },
            { id: 'murais', label: 'Meus Murais', role: 'discente' },
            { id: 'perfil', label: 'Meu Perfil', role: 'discente' }
          ]
            .filter(item => item.role === 'both' || item.role === user.role)
            .map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                  tab === item.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <MenuIcon id={item.id} />
                {item.label}
              </button>
            ))}
        </nav>

        {isLoading && tab !== 'projetos' ? (
          <LoadingSpinner />
        ) : (
          <>
            {user.role === 'discente' && tab === 'projetos' && !filterText && filterStatus === 'ALL' && (
              <div className="mb-10 rounded-3xl overflow-hidden shadow-lg animate-fadeIn w-full relative group bg-gray-900">
                <Slider {...carouselSettings}>
                  {carouselSlides.map(slide => (
                    <div key={slide.id} className="h-[400px] md:h-[500px] relative overflow-hidden outline-none">
                      <div
                        className={`absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-1000 hover:scale-105 ${
                          slide.id === 1 ? 'bg-blue-900' : slide.id === 2 ? 'bg-indigo-900' : 'bg-purple-900'
                        }`}
                        style={{ backgroundImage: `url('${slide.img}')` }}
                      ></div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end items-start text-left p-10 md:p-16">
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-white drop-shadow-lg">
                          {slide.title}
                        </h2>
                        <p className="text-lg md:text-xl text-gray-200 max-w-2xl font-light mb-8">
                          {slide.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
            )}

            {tab === 'projetos' && (
              <div id="lista-projetos" className="animate-fadeIn w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex-1 w-full relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por título ou tipo (Pesquisa, Extensão...)"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                      value={filterText}
                      onChange={e => setFilterText(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 flex-1 md:flex-none">
                      <FaFilter className="text-gray-400" />
                      <select
                        className="bg-transparent border-none py-2 text-sm text-gray-700 outline-none w-full cursor-pointer focus:ring-0"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                      >
                        <option value="ALL">Todos os Status</option>
                        <option value="ABERTO">Vagas Abertas</option>
                        <option value="CONCLUIDO">Concluídos</option>
                      </select>
                    </div>

                    {user.role === 'docente' && (
                      <button
                        onClick={() => handleEditOrCreate(null)}
                        className="bg-green-600 text-white px-5 py-3 rounded-lg font-bold shadow-sm hover:bg-green-700 transition flex items-center justify-center gap-2 whitespace-nowrap flex-1 md:flex-none"
                      >
                        <FaPlus /> <span className="hidden sm:inline">Novo Projeto</span>
                      </button>
                    )}
                  </div>
                </div>

                {isLoading ? (
                  <LoadingSpinner message="Buscando projetos..." />
                ) : filteredProjects.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <FaSearch className="text-5xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Nenhum projeto encontrado com estes filtros.</p>
                    <button
                      onClick={() => {
                        setFilterText('');
                        setFilterStatus('ALL');
                      }}
                      className="mt-4 text-blue-600 hover:underline font-medium"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                    {filteredProjects.map(p => {
                      const expired = checkExpired(p.prazo_inscricao);

                      return (
                        <div
                          key={p.id}
                          className={`bg-white p-6 rounded-2xl shadow-sm border hover:shadow-lg transition-all duration-300 flex flex-col group h-full ${
                            expired || p.status === 'CONCLUIDO'
                              ? 'border-gray-200 bg-gray-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">
                              {p.tipo}
                            </span>
                            <StatusBadge status={p.status} expired={expired} />
                          </div>

                          <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-700 transition line-clamp-2" title={p.titulo}>
                            {p.titulo}
                          </h3>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-4 font-medium">
                            <span className="flex items-center gap-1.5">
                              <FaUserGraduate className="text-gray-400" /> {p.docente?.nome?.split(' ')[0]}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <FaMapMarkerAlt className="text-gray-400" /> {p.campus || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <FaClock className="text-gray-400" /> {p.carga_horaria}h
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-6 line-clamp-3 flex-grow leading-relaxed">
                            {p.descricao}
                          </p>
                          
                          {p.status === 'ABERTO' && (
                            <div className={`text-sm font-bold mb-4 flex items-center gap-2 p-2 rounded bg-gray-100/50 ${expired ? 'text-gray-500' : 'text-red-600'}`}>
                              <FaCalendarAlt className={expired ? '' : 'animate-pulse'} /> 
                              {expired ? 'Inscrições Encerradas' : `Encerra em ${getDaysLeft(p.prazo_inscricao)} dias`}
                            </div>
                          )}
                          
                          <div className="mt-auto space-y-2">
                            <button
                              onClick={() => setViewProj(p)}
                              className="w-full py-2.5 rounded-lg border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition focus:ring-4 focus:ring-gray-100"
                            >
                              Ver Detalhes
                            </button>
                            
                            {user.role === 'docente' && p.status !== 'CONCLUIDO' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditOrCreate(p)}
                                  className="flex-1 py-2 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition text-sm flex items-center justify-center gap-1"
                                  title="Editar informações do projeto"
                                >
                                  <FaEdit /> Editar
                                </button>

                                <button
                                  onClick={() => handleCloseProject(p.id)}
                                  className="flex-1 py-2 rounded-lg bg-yellow-50 text-yellow-700 font-bold hover:bg-yellow-100 transition text-sm flex items-center justify-center gap-1"
                                  title="Fechar vagas e concluir projeto"
                                >
                                  <FaBan /> Encerrar
                                </button>

                                <button
                                  onClick={() => handleDeleteProject(p.id)}
                                  className="py-2 px-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center justify-center"
                                  title="Excluir projeto permanentemente"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            )}

                            {user.role === 'discente' && p.status === 'ABERTO' && !myStatusInProject(p.id) && !expired && (
                              <button
                                onClick={() => apply(p.id)}
                                className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-sm transition focus:ring-4 focus:ring-blue-200"
                              >
                                Quero Participar
                              </button>
                            )}

                            {user.role === 'discente' && myStatusInProject(p.id) && (
                              <div className="w-full py-2.5 rounded-lg bg-gray-100 text-center text-sm font-bold text-gray-600 border border-gray-200">
                                Você já se candidatou
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {tab === 'murais' && user.role === 'discente' && (
              <div className="space-y-6 animate-fadeIn w-full max-w-4xl mx-auto">
                {data.applications.filter(app => app.status === 'ACEITA').length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
                    <FaRocket className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Seu Mural está vazio</h3>
                    <p className="text-gray-500">Você ainda não participa de nenhum projeto.</p>
                    <p className="text-sm text-gray-400 mt-2">Vá até a aba "Projetos" e candidate-se para interagir aqui.</p>
                  </div>
                ) : (
                  data.applications.filter(app => app.status === 'ACEITA').map(app => (
                    <div key={app.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white flex justify-between items-center">
                        <div>
                          <h3 className="text-2xl font-bold">{app.project?.titulo}</h3>
                          <p className="opacity-90 mt-1 flex items-center gap-2">
                            <FaUserGraduate /> Orientador: {app.project?.docente?.nome}
                          </p>
                        </div>
                        <FaCheckCircle className="text-5xl opacity-50 hidden sm:block" />
                      </div>

                      <div className="p-6">
                        <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                          <FaBullhorn className="text-blue-500" /> Quadro de Avisos do Projeto
                        </h4>

                        <div className="space-y-4">
                          {app.project?.mural_posts?.length > 0 ? (
                            app.project.mural_posts.map(post => (
                              <div key={post.id} className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 shadow-sm">
                                <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                                <p className="text-xs text-gray-500 mt-3 text-right flex items-center justify-end gap-1">
                                  <FaClock /> {formatDate(post.createdAt || post.created_at)}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                              <p className="text-gray-500 font-medium">Nenhum aviso publicado pelo professor ainda.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'equipes' && user.role === 'docente' && (
              <div className="space-y-8 animate-fadeIn w-full max-w-5xl mx-auto">
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 w-full">
                  <h3 className="font-bold text-xl mb-2 text-gray-800">Procurar Alunos</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Busque por discentes cadastrados na plataforma para convidá-los ou ver seus perfis.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        className="py-3 pl-11 pr-4 rounded-xl border border-gray-300 w-full bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="Digite o nome completo ou parcial..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && searchStudents()}
                      />
                    </div>

                    <button
                      onClick={searchStudents}
                      className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                    >
                      Pesquisar
                    </button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                      <ul className="max-h-[300px] overflow-y-auto divide-y divide-gray-200">
                        {searchResults.map(u => (
                          <li
                            key={u.id}
                            className="flex justify-between items-center bg-white p-4 hover:bg-blue-50 transition cursor-pointer group"
                            onClick={() => setViewStudent(u)}
                          >
                            <div>
                              <p className="font-bold text-gray-900 group-hover:text-blue-700 transition">{u.nome}</p>
                              <p className="text-sm text-gray-500">{u.email}</p>
                            </div>

                            <span className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition">
                              Ver Perfil
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="space-y-8">
                  {data.projects.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                      <p className="text-gray-500 font-medium">Você ainda não criou nenhum projeto.</p>
                      <p className="text-sm text-gray-400">Crie um projeto na aba correspondente para formar sua equipe.</p>
                    </div>
                  )}

                  {data.projects.map(p => (
                    <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden w-full">
                      <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-1 rounded-md uppercase mb-2 inline-block">
                            {p.tipo}
                          </span>
                          <h3 className="font-bold text-2xl text-gray-900">{p.titulo}</h3>
                        </div>

                        <span className="text-sm font-bold text-gray-600 bg-white px-4 py-2 rounded-xl border shadow-sm">
                          Vagas Preenchidas: {p.applications?.filter(a => a.status === 'ACEITA').length || 0} / {p.vagas_totais}
                        </span>
                      </div>

                      <div className="p-6 md:p-8">
                        <h4 className="text-base font-bold text-gray-800 uppercase mb-4 flex items-center gap-2 border-b pb-2">
                          <FaUsers className="text-blue-600" /> Membros da Equipe Oficial
                        </h4>

                        {(!p.applications || p.applications.filter(a => a.status === 'ACEITA').length === 0) ? (
                          <div className="bg-gray-50 border border-dashed border-gray-300 p-6 rounded-xl text-center mb-8">
                            <p className="text-gray-500 font-medium">Nenhum aluno aprovado nesta equipe.</p>
                            <p className="text-sm text-gray-400">Avalie as candidaturas pendentes na aba "Candidaturas".</p>
                          </div>
                        ) : (
                          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                            {p.applications.filter(a => a.status === 'ACEITA').map(m => (
                              <div key={m.id} className="flex flex-col p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition group">
                                <div className="flex items-center gap-3 cursor-pointer mb-4" onClick={() => setViewStudent(m.discente)}>
                                  <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg">
                                    {m.discente?.nome?.charAt(0).toUpperCase()}
                                  </div>

                                  <div className="overflow-hidden">
                                    <p className="font-bold text-sm text-gray-900 group-hover:text-blue-700 truncate w-32">
                                      {m.discente?.nome}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate w-32">
                                      {m.discente?.email}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  onClick={() => manageApp(m.id, 'RECUSADA', true)}
                                  className="mt-auto w-full text-sm text-red-600 font-bold border border-red-100 bg-red-50 py-2 rounded-lg hover:bg-red-600 hover:text-white transition"
                                >
                                  Desligar Aluno
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                          <h4 className="text-base font-bold text-blue-900 uppercase mb-4 flex items-center gap-2">
                            <FaBullhorn className="text-blue-600" /> Mural de Avisos do Projeto
                          </h4>

                          <p className="text-sm text-blue-700 mb-4">
                            Escreva um aviso importante para todos os alunos aprovados nesta equipe.
                          </p>

                          <div className="flex flex-col gap-3 mb-6">
                            <textarea
                              className="w-full border border-blue-200 rounded-xl p-4 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 shadow-sm"
                              placeholder="Ex: Pessoal, nossa próxima reunião será terça-feira no lab 3..."
                              value={postContent[p.id] || ''}
                              onChange={(e) => setPostContent({ ...postContent, [p.id]: e.target.value })}
                            />

                            <div className="flex justify-end">
                              <button
                                onClick={() => postToMural(p.id)}
                                className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-md flex items-center gap-2 transition"
                              >
                                <FaPaperPlane /> Publicar Aviso
                              </button>
                            </div>
                          </div>
                          
                          {p.mural_posts?.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 max-h-60 overflow-y-auto divide-y divide-gray-100 shadow-sm">
                              {p.mural_posts.map(post => (
                                <div key={post.id} className="p-5 hover:bg-gray-50 transition">
                                  <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>
                                  <p className="text-xs text-gray-400 mt-2 flex justify-end items-center gap-1">
                                    <FaClock /> Postado em {formatDate(post.createdAt || post.created_at)}
                                  </p>
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

            {tab === 'candidaturas' && (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <FaClipboardList className="text-5xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">Área de Candidaturas</h3>
                <p className="text-gray-500">
                  Mantenha aqui o conteúdo original da aba candidaturas do seu projeto.
                </p>
              </div>
            )}

            {tab === 'perfil' && user.role === 'discente' && (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <FaUserCircle className="text-5xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">Meu Perfil</h3>
                <p className="text-gray-500">
                  Mantenha aqui o conteúdo original da aba perfil do seu projeto.
                </p>
              </div>
            )}
          </>
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