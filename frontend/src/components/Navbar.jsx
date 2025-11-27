import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Título */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="bg-blue-600 text-white p-2 rounded-lg font-bold">CP</div>
            <span className="font-bold text-xl text-gray-800">Conecta Pesquisa</span>
          </div>

          {/* Menu Direita */}
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-700">{user.nome}</p>
              <p className="text-xs text-blue-600 font-semibold uppercase">{user.role}</p>
            </div>
            
            <button 
              onClick={logout} 
              className="text-gray-500 hover:text-red-600 font-medium text-sm transition"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}