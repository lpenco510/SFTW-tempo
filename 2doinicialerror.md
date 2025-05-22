supabase.ts:9 [supabase.ts] VITE_SUPABASE_ANON_KEY: Definida
supabase.ts:23 [supabase.ts] Cliente Supabase creado ¡ÉXITO!
main.tsx:32 ===== DEBUG ENVIRONMENT VARIABLES (main.tsx) =====
main.tsx:33 BASE_URL: /
main.tsx:34 MODE: development
main.tsx:35 DEV: true
main.tsx:36 PROD: false
main.tsx:37 VITE_SUPABASE_URL exists: true
main.tsx:38 VITE_SUPABASE_ANON_KEY exists: true
main.tsx:39 ===========================================
main.tsx:52 Elemento 'root' encontrado. Intentando renderizar React...
main.tsx:69 React renderizado iniciado.
App.tsx:230 [App] Component rendered/updated. isLoading (useLoadingStatus): true, isConnected: null, hasTimedOut: false
App.tsx:230 [App] Component rendered/updated. isLoading (useLoadingStatus): true, isConnected: null, hasTimedOut: false
useAuth.tsx:192 [AuthProvider] Render. User: null, Session: inactive, Loading: true, InitialLoadComplete: false, AuthStatus: null
useAuth.tsx:192 [AuthProvider] Render. User: null, Session: inactive, Loading: true, InitialLoadComplete: false, AuthStatus: null
App.tsx:58 [RedirectBasedOnAuth] Component rendered/updated. Path: /login, User: null, AuthLoading: true, Session: inactive, HasChecked: false, IsProcessing: false
App.tsx:58 [RedirectBasedOnAuth] Component rendered/updated. Path: /login, User: null, AuthLoading: true, Session: inactive, HasChecked: false, IsProcessing: false
App.tsx:131 [RedirectBasedOnAuth] Pathname changed to: /login. Resetting checks. Current User: null
useAuth.tsx:242 [AuthProvider.useEffect] Mounting and setting up auth listener for initial load.
useAuth.tsx:249 [AuthProvider.useEffect] Getting initial session from Supabase.
App.tsx:234 [App] Setting up global error handlers.
App.tsx:124 [RedirectBasedOnAuth] Cleanup effect for /login. User at cleanup: null
useAuth.tsx:301 [AuthProvider.useEffect] Unmounting and unsubscribing auth listener.
App.tsx:252 [App] Cleaning up global error handlers.
App.tsx:131 [RedirectBasedOnAuth] Pathname changed to: /login. Resetting checks. Current User: null
useAuth.tsx:242 [AuthProvider.useEffect] Mounting and setting up auth listener for initial load.
useAuth.tsx:249 [AuthProvider.useEffect] Getting initial session from Supabase.
App.tsx:234 [App] Setting up global error handlers.
useAuth.tsx:276 [AuthProvider.onAuthStateChange] Event: SIGNED_IN, New Session: 50630272-4062-431a-81ba-4a9be240cff2
useAuth.tsx:208 [AuthProvider.processUserSession - AuthStateChange-SIGNED_IN] Called with session: 50630272-4062-431a-81ba-4a9be240cff2
useAuth.tsx:34 [getCurrentUser - DEBUG] Hook Called.
useAuth.tsx:40 [getCurrentUser - DEBUG] Processing for authUser ID: 50630272-4062-431a-81ba-4a9be240cff2, Email: pencolucas10@gmail.com
useAuth.tsx:41 [getCurrentUser - DEBUG] Full authUser.app_metadata received: {
  "is_itc_admin": true,
  "itc_status": "ACTIVE",
  "provider": "email",
  "providers": [
    "email"
  ]
}
useAuth.tsx:47 [getCurrentUser - DEBUG] Raw itc_status: 'ACTIVE', Normalized itc_status: 'ACTIVE'
useAuth.tsx:53 [getCurrentUser - DEBUG] itc_status is ACTIVE. Proceeding to fetch profile for user ID: 50630272-4062-431a-81ba-4a9be240cff2
useAuth.tsx:56 [getCurrentUser - DEBUG] TRY BLOCK: Attempting to fetch profile from 'profiles' table for user ID: 50630272-4062-431a-81ba-4a9be240cff2
useAuth.tsx:192 [AuthProvider] Render. User: null, Session: active, Loading: true, InitialLoadComplete: false, AuthStatus: null
useAuth.tsx:192 [AuthProvider] Render. User: null, Session: active, Loading: true, InitialLoadComplete: false, AuthStatus: null
App.tsx:58 [RedirectBasedOnAuth] Component rendered/updated. Path: /login, User: null, AuthLoading: true, Session: active, HasChecked: false, IsProcessing: false
App.tsx:58 [RedirectBasedOnAuth] Component rendered/updated. Path: /login, User: null, AuthLoading: true, Session: active, HasChecked: false, IsProcessing: false
App.tsx:124 [RedirectBasedOnAuth] Cleanup effect for /login. User at cleanup: null
App.tsx:119 [RedirectBasedOnAuth] useEffect for /login triggered. User: null, AuthLoading: true, Session: active
App.tsx:69 [RedirectBasedOnAuth] Initiating auth check for route: /login. User: null, User Obj: null, AuthLoading: true, Session: active
App.tsx:72 [RedirectBasedOnAuth] Currently on /login or /registro. No redirection needed from here.
App.tsx:58 [RedirectBasedOnAuth] Component rendered/updated. Path: /login, User: null, AuthLoading: true, Session: active, HasChecked: true, IsProcessing: false
App.tsx:58 [RedirectBasedOnAuth] Component rendered/updated. Path: /login, User: null, AuthLoading: true, Session: active, HasChecked: true, IsProcessing: false
App.tsx:124 [RedirectBasedOnAuth] Cleanup effect for /login. User at cleanup: null
App.tsx:63 [RedirectBasedOnAuth] Skipping check for /login. hasChecked: true, isProcessing: false
useLoadingStatus.ts:53 [useLoadingStatus] Performing initial connection check.
supabase.ts:60 [supabase.ts - checkConnection] Iniciando verificación...
supabase.ts:70 [supabase.ts - checkConnection] Intentando query a 'companies'...
useLoadingStatus.ts:60 
 [useLoadingStatus] Loading timeout, forcing UI render.
App.tsx:230 [App] Component rendered/updated. isLoading (useLoadingStatus): false, isConnected: null, hasTimedOut: true
App.tsx:230 [App] Component rendered/updated. isLoading (useLoadingStatus): false, isConnected: null, hasTimedOut: true
useAuth.tsx:192 [AuthProvider] Render. User: null, Session: active, Loading: true, InitialLoadComplete: false, AuthStatus: null
useAuth.tsx:192 [AuthProvider] Render. User: null, Session: active, Loading: true, InitialLoadComplete: false, AuthStatus: null
App.tsx:58 [RedirectBasedOnAuth] Component rendered/updated. Path: /login, User: null, AuthLoading: true, Session: active, HasChecked: true, IsProcessing: false
App.tsx:58 [RedirectBasedOnAuth] Component rendered/updated. Path: /login, User: null, AuthLoading: true, Session: active, HasChecked: true, IsProcessing: false