[ConnectionMonitor] Manual connection check triggered.
supabase.ts:60 [supabase.ts - checkConnection] Iniciando verificación...
supabase.ts:70 [supabase.ts - checkConnection] Intentando query a 'companies'...
supabase.ts:75 [supabase.ts - checkConnection] Query a 'companies' completada. Status: 200, Error: null, Count: 10
supabase.ts:86 [supabase.ts - checkConnection] Verificación de conexión Supabase ¡ÉXITO! (Status: 200)
App.tsx:230 [App] Component rendered/updated. isLoading (useLoadingStatus): false, isConnected: true, hasTimedOut: true
App.tsx:230 [App] Component rendered/updated. isLoading (useLoadingStatus): false, isConnected: true, hasTimedOut: true
useAuth.tsx:192 [AuthProvider] Render. User: 50630272-4062-431a-81ba-4a9be240cff2, Session: active, Loading: false, InitialLoadComplete: true, AuthStatus: null
useAuth.tsx:192 [AuthProvider] Render. User: 50630272-4062-431a-81ba-4a9be240cff2, Session: active, Loading: false, InitialLoadComplete: true, AuthStatus: null
App.tsx:58 [RedirectBasedOnAuth] Component rendered/updated. Path: /, User: 50630272-4062-431a-81ba-4a9be240cff2, AuthLoading: false, Session: active, HasChecked: true, IsProcessing: false
App.tsx:58 [RedirectBasedOnAuth] Component rendered/updated. Path: /, User: 50630272-4062-431a-81ba-4a9be240cff2, AuthLoading: false, Session: active, HasChecked: true, IsProcessing: false
App.tsx:147 [ProtectedRoute] Component rendered/updated for /. User: 50630272-4062-431a-81ba-4a9be240cff2, User Obj: {"id":"50630272-4062-431a-81ba-4a9be240cff2","email":"pencolucas10@gmail.com","app_metadata":{"is_itc_admin":true,"itc_status":"ACTIVE","provider":"email","providers":["email"]},"full_name":"Lucas ADMIN ","nombreEmpresa":"ARUSA","identificadorFiscal":"","isAdmin":true,"companyId":null,"role":"admin","createdAt":"2025-05-16T20:37:31.45096+00:00","isGuest":false,"isVerified":true}, Loading: false, Session: active, InitialLoad: false, UserVerified: true
App.tsx:216 [ProtectedRoute] Accessing /. IsAdminRoute: false, IsUserAdmin: true. User ID: 50630272-4062-431a-81ba-4a9be240cff2, User App Metadata: {"is_itc_admin":true,"itc_status":"ACTIVE","provider":"email","providers":["email"]}
App.tsx:223 [ProtectedRoute] User (50630272-4062-431a-81ba-4a9be240cff2) granted access to /.
App.tsx:147 [ProtectedRoute] Component rendered/updated for /. User: 50630272-4062-431a-81ba-4a9be240cff2, User Obj: {"id":"50630272-4062-431a-81ba-4a9be240cff2","email":"pencolucas10@gmail.com","app_metadata":{"is_itc_admin":true,"itc_status":"ACTIVE","provider":"email","providers":["email"]},"full_name":"Lucas ADMIN ","nombreEmpresa":"ARUSA","identificadorFiscal":"","isAdmin":true,"companyId":null,"role":"admin","createdAt":"2025-05-16T20:37:31.45096+00:00","isGuest":false,"isVerified":true}, Loading: false, Session: active, InitialLoad: false, UserVerified: true
App.tsx:216 [ProtectedRoute] Accessing /. IsAdminRoute: false, IsUserAdmin: true. User ID: 50630272-4062-431a-81ba-4a9be240cff2, User App Metadata: {"is_itc_admin":true,"itc_status":"ACTIVE","provider":"email","providers":["email"]}
App.tsx:223 [ProtectedRoute] User (50630272-4062-431a-81ba-4a9be240cff2) granted access to /.

I will revert that specific line and keep getCurrentUser as it was (the version with detailed logging and robust itc_status checks) within useAuth.tsx. The rest of the simplification to AuthProvider (removing visibility listeners, streamlining useEffect and processUserSession loading logic) should remain.
Usage-based pricing is required
Please enable usage-based 