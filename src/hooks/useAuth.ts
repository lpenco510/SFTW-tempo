// Archivo simplificado para resolver problemas de exportación
// Re-exportamos tanto la versión por defecto como la nombrada

// Re-exportar la versión nombrada para importaciones como: import { useAuth } from './useAuth'
export { useAuth, AuthProvider, AuthContext, isGuestUser, getCurrentUser } from './useAuth.tsx';

// Re-exportar la versión por defecto para importaciones como: import useAuth from './useAuth'
import { useAuth as importedUseAuth } from './useAuth.tsx';
export default importedUseAuth;
