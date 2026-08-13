import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';

export function useProtectedAction() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();

  return (action: () => void, targetLocation?: string) => {
    if (user) {
      action();
    } else {
      navigate('/login', { state: { from: targetLocation || location.pathname } });
    }
  };
}
