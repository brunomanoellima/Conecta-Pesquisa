// Página mantida para compatibilidade com versões antigas do roteamento.
// O dashboard principal atualizado está implementado diretamente em src/App.jsx.
// Este componente evita código morto com mensagens nativas sem ícones.

import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  return <Navigate to="/dashboard" replace />;
}
