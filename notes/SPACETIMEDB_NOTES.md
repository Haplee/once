# SpacetimeDB Integration Notes

## Arquitectura: Next.js + SpacetimeDB

SpacetimeDB utiliza una arquitectura basada en WebSockets para sincronización en tiempo real. Esto presenta un desafío para las **Next.js API Routes** y **Server Components**, que son stateless y se basan en el protocolo HTTP.

### Decisiones de Diseño

1. **Proxy en API Routes**: Aunque SpacetimeDB permite conexión directa desde el cliente, para mantener la lógica de "backend" y facilitar la migración desde SQLite sin romper la estructura actual de `/api/calculate` y `/api/history`, usaremos las API Routes como puente.
2. **Cliente Singleton**: El SDK de SpacetimeDB se gestionará como un singleton en `src/lib/spacetimedb.ts`. Dado que las API Routes de Next.js se ejecutan en un entorno serverless (Vercel), la conexión WebSocket debe abrirse, realizar la operación (reducer) y cerrarse, o bien utilizar una persistencia de conexión si el entorno lo permite.
3. **Limitaciones en SSR**: El SDK de SpacetimeDB está optimizado para el navegador. Para operaciones en el servidor (SSR/API), debemos asegurar que el entorno sea compatible con WebSockets (usando `ws` si el SDK no lo incluye por defecto).

### Consideraciones para Vercel
En despliegues serverless, las conexiones WebSocket persistentes son difíciles de mantener. Cada invocación de una API Route es independiente.
- **Acción**: Cada llamada a la API abrirá una conexión temporal, ejecutará el reducer y esperará la confirmación.

### Módulo SpacetimeDB
El esquema de la base de datos se define en Rust. Esto permite que la lógica de inserción sea transaccional y se ejecute directamente en el "compute layer" de la base de datos.
