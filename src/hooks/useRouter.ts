import { useNavigate, useLocation, useParams } from 'react-router-dom';

/**
 * Hook personalizado que combina utilidades de navegación
 */
export function useRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  return {
    navigate,
    location,
    params,
    pathname: location.pathname,
    query: new URLSearchParams(location.search),
    // Métodos de ayuda
    goBack: () => navigate(-1),
    goTo: (path: string) => navigate(path)
  };
}
