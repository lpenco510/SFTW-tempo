Usuarios Registrados
Administrador de la Empresa:
Funciones: Gestionar usuarios dentro de la empresa, configurar ajustes, y tener acceso completo a todas las funciones y datos de la cuenta.
Permisos: Crear/eliminar usuarios, modificar configuraciones, acceder a reportes y auditorías.
Restricciones: No puede acceder a datos de otras empresas, protegido por seguridad de nivel de fila (RLS) en la base de datos.
Usuario de la Empresa:
Funciones: Realizar operaciones como seguimiento de envíos, explorar oportunidades, usar calculadoras, y gestionar documentación aduanera.
Permisos: Acceso a funciones operativas, pero no puede gestionar usuarios ni modificar configuraciones.
Restricciones: Limitado a datos de su empresa, sin acceso a configuraciones globales.
Esta estructura inicial es adecuada para micro-emprendedores (un solo usuario con acceso completo) y empresas más grandes (varios usuarios con roles diferenciados). Futuras expansiones podrían incluir roles más específicos, como:

Rol Futuro	Funciones Principales	Ejemplo de Permisos
Despachante de Aduanas	Gestionar documentación aduanera, validar cumplimiento	Acceso a documentos aduaneros, seguimiento de estados
Gerente de Logística	Supervisar envíos, optimizar rutas	Tracking en tiempo real, gestión de costos logísticos
Oficial Financiero	Administrar pagos, tasas de cambio	Acceso a datos financieros, gestión de instrumentos
Estos roles pueden implementarse más adelante, según las necesidades de los clientes, siguiendo el principio de menor privilegio para mejorar la seguridad.

Usuarios Invitados
Dado que el objetivo es mostrar las funcionalidades principales para convertirlos en clientes, sugiero un entorno de demostración con datos de muestra. Los invitados:

No pueden acceder a datos reales de ninguna cuenta, asegurando la privacidad (cada cuenta es personalizable y segregada).
Pueden explorar funciones como seguimiento de envíos, calculadora de importación, y oportunidades, usando datos ficticios.
No tienen permisos para guardar configuraciones ni realizar acciones que afecten el sistema.
Podrían tener la opción de iniciar un proceso de registro desde el entorno de demostración, convirtiendo su experiencia en una cuenta real tras verificación.
Esta aproximación es común en plataformas SaaS, como Frontegg, y asegura seguridad mientras atrae clientes potenciales.

Administrador del Sistema
Es esencial tener un rol de Administrador del Sistema para tu equipo, con acceso total para gestionar todas las empresas, proporcionar soporte, y supervisar el sistema. Esto incluye:

Gestionar cuentas de empresas, resolver problemas técnicos, y realizar auditorías.
Asegurar el cumplimiento y la seguridad, especialmente dado que no hay regulaciones prioritarias actualmente, pero podrían surgir en el futuro.
Dado que usas Supabase para el backend, puedes implementar este rol mediante autenticación y permisos avanzados en la base de datos, sin necesidad de una cuenta suprema adicional, siempre que las configuraciones sean correctas (por ejemplo, variables de entorno como VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY).