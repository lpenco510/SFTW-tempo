# Flujo de Registro de Nuevos Usuarios y Aprobación por IT CARGO

Este documento describe el proceso completo desde que un nuevo interesado (lead) solicita acceso al sistema IT CARGO hasta que su cuenta es aprobada y activada por un administrador de IT CARGO.

## Diagrama Conceptual del Flujo

```
+---------------------+     +-------------------------+     +-----------------------+     +---------------------+     +--------------------+
| 1. Lead Completa    | --> | 2. Edge Function        | --> | 3. Admin ITC Revisa   | --> | 4. Admin ITC Aprueba/ | --> | 5. Lead Accede al  |
|    Formulario de    |     |    (Sistema Automático) |     |    Cola de Aprobación |     |    Rechaza            |     |    Sistema         |
|    Registro         |     +-------------------------+     +-----------------------+     +---------------------+     +--------------------+
+---------------------+
        |                                   |                               |
        |                                   V                               V
        |                         +--------------------------+  +--------------------------+
        |                         | auth.users               |  | admin_approval_queue     |
        |                         | - Crea usuario           |  | - Nueva entrada          |
        |                         | - app_metadata:          |  |   (status: PENDING)      |
        |                         |   - status: PENDING      |  +--------------------------+
        |                         |   - submitted_details:   |
        |                         |     {datos del form}     |
        |                         +--------------------------+
        V
+---------------------+
| Pantalla de "Solicitud Recibida, Pendiente de Revisión" |
+---------------------+
```

## Pasos Detallados del Proceso

### 1. Solicitud de Acceso por el Lead

1.  **Acceso al Formulario**: El interesado (lead o cliente referido) accede al formulario de registro público del sistema IT CARGO.
2.  **Completar Información**: El lead completa todos los campos requeridos en el formulario. Estos campos incluirán:
    *   **Datos Personales**: Nombre, Apellido.
    *   **Datos de Empresa (si aplica)**: Razón Social, Tipo de Identificación (CUIT/CUIL), Número de Identificación, Dígito Verificador (DV).
    *   **Datos de Contacto**: Email, Confirmar Email, Contraseña, Confirmar Contraseña, País, Provincia, Localidad, Código Postal, Domicilio, Móvil/Whatsapp, Teléfono fijo (opcional).
    *   **Legales**: Aceptación de Términos y Condiciones.
3.  **Envío del Formulario**: Al enviar el formulario, se activa el siguiente paso.
4.  **Feedback Inmediato**: El lead recibe un mensaje en pantalla confirmando que su solicitud ha sido recibida y que está pendiente de revisión y aprobación por parte del equipo de IT CARGO. (Ej: "¡Gracias por registrarte! Tu solicitud está siendo revisada. Te notificaremos por email una vez que sea procesada.")

### 2. Procesamiento Automático por el Sistema (Edge Function)

Cuando el lead envía el formulario de registro, una **Supabase Edge Function** se encarga de las siguientes acciones:

1.  **Creación de Usuario en `auth.users`**:
    *   Se crea una nueva entrada en la tabla `auth.users` con el email y la contraseña proporcionados por el lead.
    *   En el campo `app_metadata` de este nuevo usuario, se almacena información crucial:
        *   `status: "PENDING_APPROVAL"` (o un estado similar que indique que la cuenta no está activa).
        *   `submitted_details: { ... }` (un objeto JSON con todos los datos ingresados en el formulario de registro). Esto asegura que todos los detalles estén disponibles para la revisión del administrador.
2.  **Creación de Entrada en `public.admin_approval_queue`**:
    *   Se inserta una nueva fila en la tabla `public.admin_approval_queue`.
    *   Esta fila contendrá:
        *   `user_id`: El UUID del usuario recién creado en `auth.users`.
        *   `email_submitted`: El email del lead (denormalizado para fácil visualización).
        *   `company_name_submitted`: El nombre de la empresa (denormalizado).
        *   `cuit_submitted`: El CUIT/CUIL (denormalizado).
        *   `status`: Se establece inicialmente en `'PENDING_ITC_REVIEW'`.
        *   Otros campos como `admin_notes`, `reviewed_by_admin_id`, `review_completed_at` estarán inicialmente en `NULL`.
3.  **(Opcional) Notificación Interna a IT CARGO**: La Edge Function podría enviar una notificación por email a `comercial@itc-comex.com` informando sobre la nueva solicitud pendiente.

### 3. Revisión por el Administrador de IT CARGO

1.  **Acceso a la Cola de Aprobación**: El Administrador de IT CARGO (Lucas) accede a una interfaz (que se construirá en el futuro en el panel de administración del sistema) que muestra las solicitudes de la tabla `public.admin_approval_queue` con estado `'PENDING_ITC_REVIEW'`.
2.  **Visualización de Datos**: Para cada solicitud, el administrador podrá ver la información clave denormalizada en la cola (`email`, `company_name`, `cuit`) y tendrá acceso a los detalles completos almacenados en `auth.users.app_metadata.submitted_details` para el `user_id` correspondiente.
3.  **Proceso de Verificación (Manual)**: El administrador realiza las validaciones necesarias:
    *   Verificar la validez del CUIT/CUIL.
    *   Confirmar si el solicitante es un cliente existente o un prospecto calificado.
    *   Evaluar la información proporcionada.
4.  **Toma de Decisión**: Basado en la revisión, el administrador decide si aprobar, rechazar o solicitar más información.

### 4. Acción del Administrador de IT CARGO (Aprobación / Rechazo)

#### Caso A: Aprobación

Si el administrador aprueba la solicitud:

1.  **Actualizar `public.admin_approval_queue`**:
    *   Cambiar `status` a `'APPROVED'`.
    *   Completar `reviewed_by_admin_id` con el UUID del administrador.
    *   Completar `review_completed_at` con la fecha y hora actual.
    *   Añadir notas relevantes en `admin_notes` (opcional).
2.  **Actualizar `auth.users`**:
    *   Cambiar `app_metadata.status` a `'APPROVED'` (o un estado que indique activación).
    *   (Opcional) Limpiar o reestructurar `app_metadata.submitted_details` si es necesario, o mover parte de esta información a la tabla `profiles` o `companies`.
3.  **Crear Registros Relacionados**:
    *   **Tabla `public.profiles`**: Crear una nueva entrada para el usuario, vinculada a su `auth.users.id`.
        *   Poblar campos como `full_name`, `email` (puede tomarse de `submitted_details`).
        *   Asignar un rol si aplica (ej. `'client_user'`).
    *   **Tabla `public.companies`**:
        *   Verificar si la empresa ya existe por CUIT.
        *   Si no existe, crear una nueva entrada con los datos de la empresa de `submitted_details`.
        *   Obtener el `company_id`.
    *   **Tabla `public.user_companies`**: Crear una entrada para asociar el `user_id` con el `company_id` correspondiente, definiendo el rol del usuario dentro de esa empresa (ej. `'owner'`, `'member'`).
4.  **Notificación al Usuario**: Enviar un email de bienvenida al usuario informándole que su cuenta ha sido aprobada y ya puede acceder al sistema con el email y contraseña que definió durante el registro.

#### Caso B: Rechazo

Si el administrador rechaza la solicitud:

1.  **Actualizar `public.admin_approval_queue`**:
    *   Cambiar `status` a `'REJECTED'`.
    *   Completar `reviewed_by_admin_id` y `review_completed_at`.
    *   Es **muy importante** añadir una razón clara para el rechazo en `admin_notes`.
2.  **Actualizar `auth.users`**:
    *   Cambiar `app_metadata.status` a `'REJECTED'`.
3.  **Notificación al Usuario**: Enviar un email al usuario informándole que su solicitud no pudo ser aprobada, idealmente indicando el motivo (basado en `admin_notes`, de forma general si la información es sensible).
4.  **(Opcional) Limpieza**: Considerar si el usuario en `auth.users` debe ser eliminado después de un tiempo si es rechazado, o si se mantiene para registro. Si se elimina, la entrada en `admin_approval_queue` también se eliminaría debido al `ON DELETE CASCADE`.

#### Caso C: Solicitar Más Información

1.  **Actualizar `public.admin_approval_queue`**:
    *   Cambiar `status` a `'MORE_INFO_REQUESTED_TO_LEAD'`.
    *   Añadir notas en `admin_notes` detallando qué información adicional se necesita.
2.  **Comunicación con el Lead**: El administrador contacta al lead (fuera del sistema inicialmente, o por email si se automatiza) para solicitar la información faltante.
3.  Una vez recibida la información, el proceso vuelve al paso de revisión (Paso 3).

### 5. Acceso del Usuario al Sistema

*   Si la solicitud fue **aprobada**, el usuario ahora puede iniciar sesión en el sistema IT CARGO utilizando el email y contraseña que estableció durante el registro.
*   Las políticas de seguridad (RLS) y la lógica de la aplicación se encargarán de que el usuario solo vea y acceda a la información y funcionalidades correspondientes a su perfil y empresa.

## Consideraciones Adicionales

*   **Seguridad de Contraseña**: La contraseña la establece el usuario durante el registro inicial y el sistema la almacena de forma segura (hashed) en `auth.users`.
*   **Panel de Administración**: Se necesitará desarrollar una interfaz en el frontend para que los administradores de IT CARGO gestionen la `admin_approval_queue` y realicen las acciones de aprobación/rechazo de forma eficiente.
*   **Automatización de Notificaciones**: Los emails de "solicitud recibida", "aprobado", "rechazado" idealmente deberían ser automatizados.

Este flujo asegura un control riguroso sobre quién accede al sistema, alineándose con la estrategia de IT CARGO de ofrecerlo como un servicio de valor exclusivo para sus clientes y prospectos calificados. 