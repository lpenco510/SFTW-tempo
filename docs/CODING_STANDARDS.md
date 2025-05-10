# Estándares de Codificación - IT CARGO Comercio Exterior

Este documento define las prácticas y estándares de codificación para la plataforma de gestión de comercio exterior IT CARGO. Seguir estos lineamientos garantiza consistencia, mantenibilidad y calidad en todo el código base.

## Principios Generales

1. **Simplicidad**: Prefiera soluciones simples y directas sobre implementaciones complejas.
2. **Consistencia**: Mantenga un estilo consistente en todo el código base.
3. **Optimización**: Optimice para legibilidad primero, rendimiento después.
4. **Modularidad**: Diseñe componentes reutilizables con responsabilidades bien definidas.
5. **Mantenibilidad**: Escriba código pensando en quién lo mantendrá en el futuro.
6. **Relevancia para el dominio**: Todo desarrollo debe estar alineado con los procesos de comercio exterior argentino.

## Estilo de Código

### TypeScript / JavaScript

- Utilice TypeScript para todas las nuevas características.
- Defina tipos explícitos para todas las props, estados y valores de retorno.
- Evite usar `any` excepto en casos excepcionales documentados.
- Utilice interfaces para objetos que representan entidades del dominio (ej. `ImportDeclaration`, `ShipmentDocument`).
- Prefiera tipos para uniones, intersecciones o utilidades.
- Use `const` por defecto, `let` cuando sea necesario; evite `var`.
- Utilice funciones flecha para componentes funcionales y callbacks.
- Implemente manejo de errores adecuado para todas las operaciones asíncronas.

```typescript
// ❌ Mal
function ShipmentComponent(props) {
  var [data, setData] = useState();
  
  async function fetchData() {
    const result = await supabase.from('shipments').select('*');
    setData(result.data);
  }
}

// ✅ Bien
interface ShipmentComponentProps {
  customsOfficeId: string;
}

const ShipmentComponent: React.FC<ShipmentComponentProps> = ({ customsOfficeId }) => {
  const [shipments, setShipments] = useState<ImportShipment[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchShipments = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('shipments')
        .select('*, customs_events(*)')
        .eq('customs_office_id', customsOfficeId);
        
      if (error) throw new Error(error.message);
      setShipments(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido al cargar envíos'));
    } finally {
      setIsLoading(false);
    }
  };
};
```

### Convenciones de Nomenclatura

- **Archivos**: Use `kebab-case.tsx` para componentes, `kebab-case.ts` para utilidades.
- **Componentes**: Use `PascalCase` para nombres de componentes.
- **Funciones**: Use `camelCase` para funciones y métodos.
- **Variables**: Use `camelCase` para variables y propiedades.
- **Interfaces/Tipos**: Use `PascalCase` prefijado con la entidad (`ImportDeclaration`, `CustomsDocument`).
- **Constantes**: Use `UPPER_SNAKE_CASE` para constantes globales.
- **Términos de dominio**: Use términos consistentes con la nomenclatura aduanera argentina (ej. `despachoDeImportacion` en lugar de genéricos como `shipmentDocument`).

### Estructura del Proyecto

- Organice los archivos por característica y función, no por tipo.
- Agrupe componentes relacionados a procesos de comercio exterior específicos.
- Cree índices de barril para exportaciones limpias.

```
comercio-exterior/
  ├── componentes/       # Componentes UI específicos de comercio exterior
  │   ├── despachos/     # Componentes para gestión de despachos
  │   ├── aforo/         # Componentes para proceso de aforo
  │   └── liquidacion/   # Componentes para liquidación de divisas
  ├── hooks/             # Hooks personalizados para la característica
  ├── types.ts           # Tipos e interfaces específicos
  ├── utils.ts           # Utilidades para cálculos aduaneros
  └── index.ts           # Exportaciones
```

## React

### Componentes

- Prefiera componentes funcionales con hooks sobre componentes de clase.
- Extraiga lógica compleja a hooks personalizados.
- Divida componentes grandes en subcomponentes más pequeños y manejables.
- Utilice React.memo() para componentes que renderizen frecuentemente con las mismas props.
- Implemente `React.Suspense` y `ErrorBoundary` para carga y manejo de errores.
- Siga el principio de responsabilidad única: cada componente debe tener un propósito claro en el flujo de comercio exterior.

### Props

- Desestructure props en la firma de la función para mayor claridad.
- Proporcione valores predeterminados razonables cuando sea posible.
- Valide props con TypeScript y/o PropTypes.
- Pase solo las props necesarias; evite prop drilling usando Context cuando sea apropiado.
- Asegúrese de que las props reflejen adecuadamente los conceptos del dominio de comercio exterior.

### Estado

- Mantenga el estado lo más local posible.
- Utilice React Context para estado global o compartido.
- Considere utilizar reducers (useReducer) para lógica de estado compleja relacionada con flujos de trabajo aduaneros.
- Normalice datos complejos para facilitar las actualizaciones.
- Considere el uso de finite state machines para modelar procesos con flujos de estados bien definidos (como el estado de un despacho de aduana).

## Supabase

### Consultas a Base de Datos

- Seleccione solo las columnas necesarias para reducir el tamaño de los datos.
- Utilice joins apropiados en lugar de múltiples consultas cuando sea posible.
- Implemente paginación para conjuntos de datos grandes como catálogos de productos o historial de operaciones.
- Evite N+1 queries utilizando consultas optimizadas.
- Utilice funciones específicas de PostgreSQL para cálculos complejos de comercio exterior cuando sea apropiado.

```typescript
// ❌ Mal
const { data: despachos } = await supabase.from('despachos').select('*');
for (const despacho of despachos) {
  const { data: documentos } = await supabase
    .from('documentos')
    .select('*')
    .eq('despacho_id', despacho.id);
  // Hacer algo con documentos
}

// ✅ Bien
const { data: despachosCompletos } = await supabase
  .from('despachos')
  .select(`
    id,
    numero_despacho,
    fecha_oficializacion,
    estado,
    aduana_id,
    documentos:documentos_despacho(
      id,
      tipo_documento,
      numero,
      fecha_emision,
      archivo_url
    )
  `)
  .order('fecha_oficializacion', { ascending: false });
```

### Seguridad

- Implemente políticas RLS adecuadas para todas las tablas, considerando las restricciones de acceso apropiadas para los diferentes roles en operaciones de comercio exterior.
- Valide todos los datos de entrada antes de insertarlos en la base de datos.
- No exponga información sensible relacionada con operaciones aduaneras o comerciales en consultas del lado del cliente.
- Utilice la función `get_auth_uid()` para optimizar consultas de seguridad.
- Implemente auditoría de operaciones críticas según requerimientos legales aduaneros.

### Rendimiento

- Utilice la función optimizada `get_auth_uid()` para reducir llamadas repetitivas.
- Implemente almacenamiento en caché para datos que no cambian frecuentemente (como normativas aduaneras).
- Utilice suscripciones en tiempo real solo cuando sea necesario, como para seguimiento de estados de despachos.
- Considere el uso de índices optimizados para consultas frecuentes.
- Utilice funciones de búsqueda de texto completo para documentación aduanera.

## UI/UX

### Componentes UI

- Utilice componentes shadcn/ui como base para la interfaz.
- Extienda/modifique componentes existentes en lugar de crear nuevos desde cero.
- Mantenga consistencia visual en toda la aplicación.
- Diseñe con las expectativas y necesidades de usuarios de comercio exterior en mente (despachantes, traders, etc.).
- Incorpore componentes específicos para visualizar estados de trámites aduaneros.

### Accesibilidad

- Asegúrese de que todos los elementos interactivos sean accesibles por teclado.
- Proporcione textos alternativos para imágenes y elementos visuales.
- Use ARIA roles y atributos cuando sea necesario.
- Mantenga contraste suficiente para todos los textos.
- Considere las necesidades de usuarios con diferentes niveles de experticia en comercio exterior.

### Responsive Design

- Diseñe para móvil primero, luego escale para tablets y desktop.
- Utilice unidades relativas (rem, %) en lugar de píxeles cuando sea posible.
- Implemente breakpoints consistentes utilizando las utilidades de Tailwind.
- Asegúrese de que las tablas y formularios complejos de comercio exterior sean usables en todos los dispositivos.

## Testing

- Escriba pruebas unitarias para lógica crítica de negocio, especialmente cálculos aduaneros.
- Implemente pruebas de integración para flujos de usuario clave como creación de despachos.
- Utilice mocks para servicios externos como Supabase.
- Mantenga una cobertura de pruebas mínima del 70% para código crítico.
- Incluya pruebas específicas para validar el cumplimiento de normativas aduaneras.

## Proceso de Desarrollo

### Git

- Use ramas de características descriptivas: `feature/gestion-despacho-importacion`.
- Haga commits pequeños y descriptivos.
- Rebase antes de mergear pull requests.
- Siga [Conventional Commits](https://www.conventionalcommits.org/) para mensajes de commit.
- Etiquete claramente los cambios relacionados con actualizaciones en normativas aduaneras.

### Revisión de Código

- Revisar código en busca de claridad, no solo de correctitud.
- Verificar manejo adecuado de errores y casos límite en procesos críticos.
- Asegurarse de que nuevo código siga las convenciones establecidas.
- Documentar decisiones de diseño complejas, especialmente las relacionadas con flujos de procesos aduaneros.
- Verificar que la terminología utilizada sea consistente con los términos oficiales de comercio exterior.

## Rendimiento y Optimización

- Utilice React DevTools para identificar y resolver problemas de rendimiento.
- Implemente carga diferida (lazy loading) para componentes grandes.
- Optimice imágenes y assets para cargas rápidas.
- Minimice el número de renderizaciones utilizando memoización cuando sea apropiado.
- Priorice la optimización de funcionalidades críticas para los usuarios, como el seguimiento de envíos.

## Documentación

- Documente APIs y hooks personalizados con JSDoc.
- Mantenga documentación actualizada para configuraciones y flujos complejos de comercio exterior.
- Incluya comentarios explicativos para lógica no obvia, especialmente cálculos aduaneros.
- Utilice README.md en cada directorio para explicar su propósito y contenido.
- Documente adecuadamente todas las integraciones con sistemas externos (AFIP, Aduana, etc.).

# Estándares de Código y Seguridad

## Principios de Seguridad

### Gestión de Variables de Entorno
- Las variables de entorno sensibles DEBEN almacenarse en archivos `.env.local` y NUNCA ser incluidas en el control de versiones
- Las claves de API o tokens NUNCA deben exponerse en el código cliente sin restricciones adecuadas
- Variables de entorno críticas:
  - `VITE_SUPABASE_URL`: URL de la instancia de Supabase
  - `VITE_SUPABASE_ANON_KEY`: Clave anónima para la API de Supabase (limitada por políticas RLS)

### Manejo del Cliente Supabase
- El cliente Supabase solo debe exponerse en el objeto window para debug en entorno de desarrollo
- En producción, el cliente NUNCA debe exponerse globalmente
- Cualquier exposición global debe usar proxies con acceso limitado a métodos seguros

### Autenticación
- Modo invitado (guest mode) debe estar restringido ÚNICAMENTE a entornos de desarrollo
- Los tokens de autenticación deben manejarse de forma segura y con tiempo de expiración adecuado
- La información del usuario autenticado debe ser validada en el servidor antes de operaciones sensibles

### Desarrollo y Debug
- Las herramientas de diagnóstico solo deben estar disponibles en entorno de desarrollo
- El logging extensivo debe estar desactivado en producción o limitado a información no sensible
- Los tiempos de espera (timeouts) deben implementarse para prevenir bloqueos indefinidos

## Estructura de Código

### Manejo de Estado
- Usar React Context para estado global cuando sea necesario
- Preferir hooks personalizados para lógica reutilizable
- Mantener lógica de negocio fuera de los componentes UI

### Componentes
- Seguir principio de responsabilidad única
- Componentes pequeños y reutilizables
- Usar TypeScript con tipos estrictos para todas las propiedades

### Manejo de Errores
- Implementar captura de errores exhaustiva
- Proporcionar mensajes de error claros y accionables para el usuario
- Logging apropiado para facilitar depuración

## Requisitos para Producción

### Antes del Despliegue
- Verificar que todas las variables de entorno están configuradas correctamente
- Asegurar que no hay diagnósticos o herramientas de debug expuestas
- Verificar que las políticas RLS en Supabase están configuradas correctamente

### Optimización
- Minimizar dependencias innecesarias
- Optimizar tamaño de bundle y carga de código
- Implementar lazy loading para componentes pesados

Este documento define los estándares mínimos de seguridad y calidad de código. Cualquier excepción debe ser documentada y justificada. 