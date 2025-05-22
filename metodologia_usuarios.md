# Metodología de Usuarios del Sistema IT CARGO

## Visión General del Acceso

El sistema de gestión de IT CARGO está diseñado como un **beneficio exclusivo para clientes que han contratado y operan (o están en proceso de hacerlo) sus servicios de comercio exterior con IT CARGO.** El acceso no está abierto al público general. Este enfoque asegura que el sistema sirva como una herramienta de valor agregado para la clientela de IT CARGO.

**Puntos Clave del Nuevo Modelo de Acceso:**

1.  **Registro con Solicitud de Acceso**: Los nuevos interesados (leads o clientes referidos) deben completar un formulario de registro detallado. Este formulario no otorga acceso inmediato.
2.  **Aprobación Manual por IT CARGO**: Todas las solicitudes de registro son revisadas y aprobadas manualmente por el equipo de IT CARGO. Este paso incluye la verificación de datos (ej. CUIT, información de la empresa) y la confirmación de que el solicitante es un cliente actual o un prospecto calificado.
3.  **Activación de Cuenta por IT CARGO**: Una vez aprobada la solicitud, IT CARGO activa la cuenta del usuario, quien entonces podrá acceder al sistema.
4.  **Creación Manual por IT CARGO**: El equipo de IT CARGO también puede crear cuentas de usuario directamente para clientes existentes o nuevos que no pasen por el formulario de solicitud online.
5.  **Eliminación del Modo Invitado**: No existe un modo "invitado" o de demostración pública con datos ficticios. Cualquier demostración del sistema se realizará de forma controlada por el equipo de IT CARGO.

## Roles de Usuario Definidos

### 1. Solicitante de Registro (Usuario Potencial)

*   **Función**: Individuo o empresa que completa el formulario de registro para solicitar acceso al sistema.
*   **Acceso**: Ninguno al sistema hasta que su solicitud sea aprobada por IT CARGO.
*   **Proceso**:
    1.  Completa el formulario de registro online proporcionando datos personales, de empresa (si aplica), y de contacto.
    2.  Establece una contraseña durante el registro.
    3.  Acepta términos y condiciones.
    4.  Recibe una confirmación de que su solicitud ha sido enviada y está pendiente de revisión.

### 2. Cliente Registrado y Aprobado (Usuario del Sistema)

*   **Función**: Cliente de IT CARGO cuya solicitud de acceso ha sido aprobada, o para quien IT CARGO ha creado una cuenta manualmente.
*   **Acceso**: Acceso completo a las funcionalidades del "Plan Básico" del sistema, que incluye:
    *   Dashboard principal.
    *   Seguimiento de sus envíos.
    *   Gestión básica de inventario (visualización de operaciones y productos).
    *   Calculadora de costos.
    *   Envío de pre-alertas de embarque.
    *   Acceso al Marketplace (visualización de oportunidades).
*   **Permisos**:
    *   Gestionar sus propios datos de perfil.
    *   Realizar operaciones dentro de las funcionalidades asignadas a su plan.
    *   Visualizar datos y documentos pertenecientes únicamente a su empresa.
*   **Restricciones**:
    *   No puede acceder a datos de otras empresas.
    *   No puede modificar la configuración global del sistema ni acceder a funciones de administración del sistema.
    *   Las funcionalidades exactas pueden variar según el plan de suscripción futuro (Pro, Enterprise). Por ahora, todos los clientes aprobados acceden al "Plan Básico".

#### Múltiples Usuarios por Empresa Cliente (Consideración Futura para Planes Pro/Enterprise)

*   Inicialmente, se asume un login principal por empresa cliente para el Plan Básico.
*   Para futuros planes (Pro/Enterprise), se podrá implementar la funcionalidad de que un "Administrador de Empresa Cliente" pueda gestionar múltiples usuarios dentro de su propia organización, con diferentes niveles de permisos internos (ej. usuario operativo, gerente de logística de la empresa cliente). Esto NO está en el alcance del Plan Básico inicial.

### 3. Administrador del Sistema (Equipo IT CARGO)

*   **Función**: Miembro del equipo interno de IT CARGO responsable de la gestión global del sistema y sus usuarios.
*   **Acceso**: Acceso completo y privilegiado a todas las áreas del sistema y la base de datos (Supabase).
*   **Permisos Clave**:
    *   Revisar y aprobar/rechazar solicitudes de registro.
    *   Crear, modificar, activar y desactivar cuentas de usuario y empresas cliente.
    *   Asignar usuarios a empresas.
    *   Gestionar la configuración global del sistema.
    *   Monitorear la actividad del sistema y realizar auditorías.
    *   Resolver problemas técnicos y proveer soporte a los clientes usuarios.
    *   Gestionar el contenido del Marketplace (crear y administrar listados).
    *   Acceder a logs y herramientas de diagnóstico.
*   **Implementación**: Este rol se gestiona a través de cuentas de usuario especiales en Supabase con permisos elevados (ej. un `role = 'itc_admin'` en la tabla `profiles` o mediante acceso directo a Supabase con credenciales de administrador).

## Proceso de Creación de Cuenta Manual por IT CARGO

Un Administrador del Sistema de IT CARGO puede crear una cuenta para un cliente directamente:

1.  **Desde el Dashboard de Supabase**:
    *   Navegar a la sección "Authentication" -> "Users".
    *   Utilizar la opción "Invite user" (envía un email al cliente para que establezca su contraseña) o "Add user" (IT CARGO define la contraseña inicial y la comunica de forma segura).
2.  **Creación de Perfil y Empresa**:
    *   Tras crear el usuario en `auth.users`, el administrador debe:
        *   Crear un registro correspondiente en la tabla `profiles`, asignando el `user_id` y un rol apropiado (ej. `client_user`).
        *   Crear o enlazar un registro en la tabla `companies` con los detalles de la empresa del cliente.
        *   Crear un registro en `user_companies` para asociar el `user_id` con el `company_id`.
3.  **Comunicación al Cliente**: Informar al cliente sobre la creación de su cuenta y cómo acceder.

Este proceso manual es útil para incorporar clientes existentes o para casos especiales donde no se utiliza el formulario de registro online.

## Flujo de Datos de Registro (Revisado)

1.  **Solicitud**: El usuario potencial llena el formulario de registro.
2.  **Creación de Usuario (Pendiente)**: Una Edge Function crea una cuenta en `auth.users` (potencialmente con `app_metadata` indicando estado pendiente) y registra la solicitud para revisión.
3.  **Revisión ITC**: Un Administrador de IT CARGO revisa la solicitud.
4.  **Aprobación ITC**:
    *   Actualiza el estado del usuario en `auth.users` (ej. `app_metadata.status = 'APPROVED'`).
    *   Crea/Vincula registros en `profiles`, `companies`, y `user_companies`.
5.  **Acceso**: El usuario ahora puede iniciar sesión y acceder a las funcionalidades del Plan Básico. Los datos de su empresa (poblados por el admin durante la aprobación) son los que utilizarán hooks como `useCompanySettings`.

Este modelo asegura un control estricto sobre quién accede al sistema, alineándose con la estrategia de ofrecerlo como un servicio de valor para los clientes de IT CARGO.