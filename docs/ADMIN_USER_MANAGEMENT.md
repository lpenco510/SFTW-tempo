# Gestión Manual de Usuarios por Administradores de IT CARGO

Este documento describe el proceso para que los Administradores del Sistema de IT CARGO creen y gestionen cuentas de usuario manualmente.

## Casos de Uso para Creación Manual

*   Incorporar clientes existentes que no utilizarán el formulario de registro online.
*   Proveer acceso proactivamente a nuevos clientes o prospectos importantes.
*   Resolver problemas de acceso o recrear cuentas si es necesario.

## Proceso de Creación Manual de un Nuevo Usuario Cliente

Los Administradores del Sistema de IT CARGO pueden seguir estos pasos:

### Paso 1: Crear el Usuario en Supabase Authentication

1.  Acceder al Dashboard del proyecto IT CARGO en Supabase.
2.  Navegar a la sección **Authentication** en el menú lateral.
3.  Dentro de la pestaña **Users**, hacer clic en el botón **"Add user"** (o **"Invite user"**).
    *   **Opción "Add user"**: Permite al administrador definir el email y la contraseña inicial del usuario. Esta contraseña deberá ser comunicada de forma segura al cliente.
    *   **Opción "Invite user"**: Envía un correo electrónico de invitación al cliente, permitiéndole establecer su propia contraseña. Esta es generalmente la opción preferida.
4.  Completar la información requerida (al menos el email).

### Paso 2: Configurar Metadatos del Usuario (Opcional pero Recomendado)

Después de crear el usuario (o al momento de crearlo si la UI lo permite), se pueden configurar:

*   **User Metadata (`user_metadata`)**: Para información no sensible que el usuario podría gestionar, como `full_name`.
    *   Ejemplo: `{ "full_name": "Nombre Apellido Cliente" }`
*   **App Metadata (`app_metadata`)**: Para información de control de acceso y estado gestionada por el administrador.
    *   Ejemplo: `{ "itc_client_status": "ACTIVE", "initial_status": "APPROVED_MANUALLY" }`

Estos metadatos se pueden establecer programáticamente o, a veces, a través de la interfaz de Supabase al editar un usuario.

### Paso 3: Crear/Asignar Perfil de Usuario

1.  Navegar a la sección **Table Editor** en el Dashboard de Supabase.
2.  Seleccionar la tabla `public.profiles`.
3.  Hacer clic en **"Insert row"**.
4.  Completar los campos:
    *   `id`: El `UUID` del usuario recién creado en `auth.users`. (Importante: este debe coincidir exactamente).
    *   `full_name`: Nombre completo del usuario.
    *   `email`: Email del usuario (debe coincidir con el de `auth.users`).
    *   `role`: Asignar un rol apropiado, ej. `client_user` (o el rol estándar para clientes).
    *   Otros campos relevantes del perfil.
5.  Guardar el nuevo registro.

### Paso 4: Crear/Asignar Empresa Cliente

1.  En el **Table Editor**, seleccionar la tabla `public.companies`.
2.  **Verificar si la empresa ya existe**: Buscar por CUIT o nombre de la empresa.
    *   **Si la empresa existe**: Obtener su `id` (UUID).
    *   **Si la empresa no existe**: Hacer clic en **"Insert row"** y crear un nuevo registro para la empresa con toda la información relevante (nombre, CUIT, dirección, etc.). Obtener el `id` de la nueva empresa.

### Paso 5: Vincular Usuario a Empresa

1.  En el **Table Editor**, seleccionar la tabla `public.user_companies`.
2.  Hacer clic en **"Insert row"**.
3.  Completar los campos:
    *   `user_id`: El `UUID` del usuario de `auth.users`.
    *   `company_id`: El `UUID` de la empresa (obtenido en el Paso 4).
    *   `role_in_company` (si aplica): El rol del usuario dentro de esa empresa (ej. `owner`, `member`). Para el Plan Básico, podría ser un rol por defecto.
4.  Guardar el nuevo registro.

### Paso 6: Comunicar al Cliente

1.  Informar al cliente que su cuenta ha sido creada.
2.  Proporcionarle las credenciales de acceso (si se usó "Add user") o recordarle que revise su correo para la invitación (si se usó "Invite user").
3.  Dirigirlo a la URL de inicio de sesión del sistema.

## Consideraciones Adicionales

*   **Seguridad**: Al definir contraseñas manualmente, asegurarse de que sean fuertes y se comuniquen de forma segura. Incentivar al usuario a cambiarla en su primer inicio de sesión.
*   **Consistencia de Datos**: Asegurar que el `email` y el `user_id` (UUID) sean consistentes entre las tablas `auth.users`, `profiles`, y `user_companies`.
*   **Automatización Futura**: Para un volumen alto de usuarios, se podría desarrollar un panel de administración interno en la propia aplicación IT CARGO para que los Administradores del Sistema realicen estas tareas de forma más ágil y menos propensa a errores que editando tablas directamente en Supabase.

Este proceso asegura que los usuarios creados manualmente estén correctamente configurados para acceder y utilizar el sistema IT CARGO según las políticas establecidas. 