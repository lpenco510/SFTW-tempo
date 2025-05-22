[supabase.ts] Intentando inicializar Supabase...
supabase.ts:8 [supabase.ts] VITE_SUPABASE_URL: Definida
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
2
App.tsx:230 [App] Component rendered/updated. isLoading (useLoadingStatus): true, isConnected: null, hasTimedOut: false
2
useAuth.tsx:192 [AuthProvider] Render. User: null, Session: inactive, Loading: true, InitialLoadComplete: false, AuthStatus: null
2
App.tsx:58 [RedirectBasedOnAuth] Component rendered/updated. Path: /, User: null, AuthLoading: true, Session: inactive, HasChecked: false, IsProcessing: false
App.tsx:131 [RedirectBasedOnAuth] Pathname changed to: /. Resetting checks. Current User: null
useAuth.tsx:242 [AuthProvider.useEffect] Mounting and setting up auth listener for initial load.
useAuth.tsx:249 [AuthProvider.useEffect] Getting initial session from Supabase.
App.tsx:234 [App] Setting up global error handlers.
App.tsx:124 [RedirectBasedOnAuth] Cleanup effect for /. User at cleanup: null
useAuth.tsx:301 [AuthProvider.useEffect] Unmounting and unsubscribing auth listener.
App.tsx:252 [App] Cleaning up global error handlers.
App.tsx:131 [RedirectBasedOnAuth] Pathname changed to: /. Resetting checks. Current User: null
useAuth.tsx:242 [AuthProvider.useEffect] Mounting and setting up auth listener for initial load.
useAuth.tsx:249 [AuthProvider.useEffect] Getting initial session from Supabase.
App.tsx:234 [App] Setting up global error handlers.
useAuth.tsx:252 [AuthProvider.useEffect] Initial getSession returned: inactive
useAuth.tsx:208 [AuthProvider.processUserSession - InitialGetSession] Called with session: inactive
useAuth.tsx:234 [AuthProvider.processUserSession - InitialGetSession] No session or user in session, setting app user to null.
useAuth.tsx:252 [AuthProvider.useEffect] Initial getSession returned: inactive
useAuth.tsx:208 [AuthProvider.processUserSession - InitialGetSession] Called with session: inactive
useAuth.tsx:234 [AuthProvider.processUserSession - InitialGetSession] No session or user in session, setting app user to null.
useAuth.tsx:264 [AuthProvider.useEffect] Initial session processing finished.
2
useAuth.tsx:192 [AuthProvider] Render. User: null, Session: inactive, Loading: false, InitialLoadComplete: true, AuthStatus: null
2
App.tsx:58 [RedirectBasedOnAuth] Component rendered/updated. Path: /, User: null, AuthLoading: false, Session: inactive, HasChecked: false, IsProcessing: false
App.tsx:124 [RedirectBasedOnAuth] Cleanup effect for /. User at cleanup: null
useAuth.tsx:276 [AuthProvider.onAuthStateChange] Event: INITIAL_SESSION, New Session: inactive
useAuth.tsx:208 [AuthProvider.processUserSession - AuthStateChange-INITIAL_SESSION] Called with session: inactive
useAuth.tsx:234 [AuthProvider.processUserSession - AuthStateChange-INITIAL_SESSION] No session or user in session, setting app user to null.
2
useAuth.tsx:192 [AuthProvider] Render. User: null, Session: inactive, Loading: false, InitialLoadComplete: true, AuthStatus: null
App.tsx:119 [RedirectBasedOnAuth] useEffect for / triggered. User: null, AuthLoading: false, Session: inactive
App.tsx:69 [RedirectBasedOnAuth] Initiating auth check for route: /. User: null, User Obj: null, AuthLoading: false, Session: inactive
App.tsx:82 [RedirectBasedOnAuth] No active session (from useAuth hook, authLoading: false). Redirecting to /login from /
App.tsx:85 [RedirectBasedOnAuth] Saved lastVisitedRoute: /
2
App.tsx:58 [RedirectBasedOnAuth] Component rendered/updated. Path: /login, User: null, AuthLoading: false, Session: inactive, HasChecked: true, IsProcessing: false
App.tsx:124 [RedirectBasedOnAuth] Cleanup effect for /. User at cleanup: null
App.tsx:63 [RedirectBasedOnAuth] Skipping check for /login. hasChecked: true, isProcessing: false
App.tsx:131 [RedirectBasedOnAuth] Pathname changed to: /login. Resetting checks. Current User: null
2
App.tsx:58 [RedirectBasedOnAuth] Component rendered/updated. Path: /login, User: null, AuthLoading: false, Session: inactive, HasChecked: false, IsProcessing: false
App.tsx:119 [RedirectBasedOnAuth] useEffect for /login triggered. User: null, AuthLoading: false, Session: inactive
App.tsx:69 [RedirectBasedOnAuth] Initiating auth check for route: /login. User: null, User Obj: null, AuthLoading: false, Session: inactive
App.tsx:72 [RedirectBasedOnAuth] Currently on /login or /registro. No redirection needed from here.
2
App.tsx:58 [RedirectBasedOnAuth] Component rendered/updated. Path: /login, User: null, AuthLoading: false, Session: inactive, HasChecked: true, IsProcessing: false
App.tsx:124 [RedirectBasedOnAuth] Cleanup effect for /login. User at cleanup: null
App.tsx:63 [RedirectBasedOnAuth] Skipping check for /login. hasChecked: true, isProcessing: false
useLoadingStatus.ts:53 [useLoadingStatus] Performing initial connection check.
supabase.ts:60 [supabase.ts - checkConnection] Iniciando verificación...
supabase.ts:70 [supabase.ts - checkConnection] Intentando query a 'companies'...
supabase.ts:75 [supabase.ts - checkConnection] Query a 'companies' completada. Status: 200, Error: null, Count: 0
supabase.ts:86 [supabase.ts - checkConnection] Verificación de conexión Supabase ¡ÉXITO! (Status: 200)
2
App.tsx:230 [App] Component rendered/updated. isLoading (useLoadingStatus): true, isConnected: true, hasTimedOut: false
2
useAuth.tsx:192 [AuthProvider] Render. User: null, Session: inactive, Loading: false, InitialLoadComplete: true, AuthStatus: null
2
App.tsx:58 [RedirectBasedOnAuth] Component rendered/updated. Path: /login, User: null, AuthLoading: false, Session: inactive, HasChecked: true, IsProcessing: false
2
App.tsx:230 [App] Component rendered/updated. isLoading (useLoadingStatus): false, isConnected: true, hasTimedOut: false
2
useAuth.tsx:192 [AuthProvider] Render. User: null, Session: inactive, Loading: false, InitialLoadComplete: true, AuthStatus: null
2
App.tsx:58 [RedirectBasedOnAuth] Component rendered/updated. Path: /login, User: null, AuthLoading: false, Session: inactive, HasChecked: true, IsProcessing: false
useLoadingStatus.ts:60 
 [useLoadingStatus] Loading timeout, forcing UI render.
2
App.tsx:230 [App] Component rendered/updated. isLoading (useLoadingStatus): false, isConnected: true, hasTimedOut: true
2
useAuth.tsx:192 [AuthProvider] Render. User: null, Session: inactive, Loading: false, InitialLoadComplete: true, AuthStatus: null
2
App.tsx:58 [RedirectBasedOnAuth] Component rendered/updated. Path: /login, User: null, AuthLoading: false, Session: inactive, HasChecked: true, IsProcessing: false
ConnectionMonitor.tsx:35 [ConnectionMonitor] Manual connection check triggered.
supabase.ts:60 [supabase.ts - checkConnection] Iniciando verificación...
supabase.ts:70 [supabase.ts - checkConnection] Intentando query a 'companies'...
supabase.ts:75 [supabase.ts - checkConnection] Query a 'companies' completada. Status: 200, Error: null, Count: 0
supabase.ts:86 [supabase.ts - checkConnection] Verificación de conexión Supabase ¡ÉXITO! (Status: 200)
App.tsx:230 [App] Component rendered/updated. isLoading (useLoadingStatus): false, isConnected: true, hasTimedOut: true
App.tsx:230 [App] Component rendered/updated. isLoading (useLoadingStatus): false, isConnected: true, hasTimedOut: true
useAuth.tsx:192 [AuthProvider] Render. User: null, Session: inactive, Loading: false, InitialLoadComplete: true, AuthStatus: null
useAuth.tsx:192 [AuthProvider] Render. User: null, Session: inactive, Loading: false, InitialLoadComplete: true, AuthStatus: null
App.tsx:58 [RedirectBasedOnAuth] Component rendered/updated. Path: /login, User: null, AuthLoading: false, Session: inactive, HasChecked: true, IsProcessing: false
App.tsx:58 [RedirectBasedOnAuth] Component rendered/updated. Path: /login, User: null, AuthLoading: false, Session: inactive, HasChecked: true, IsProcessing: false