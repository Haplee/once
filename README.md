# 🟢 Calculadora de Cambio ONCE — Edición Profesional v2.0

[![CI - ONCE App](https://github.com/Haplee/once/actions/workflows/ci.yml/badge.svg)](https://github.com/Haplee/once/actions/workflows/ci.yml)
[![Accessibility Audit](https://github.com/Haplee/once/actions/workflows/accessibility-audit.yml/badge.svg)](https://github.com/Haplee/once/actions/workflows/accessibility-audit.yml)
[![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-black)](https://vercel.com)

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)
![SpacetimeDB](https://img.shields.io/badge/SpacetimeDB-Distributed-green?style=for-the-badge)
![WCAG](https://img.shields.io/badge/WCAG-2.1_AA-blue?style=for-the-badge)

La evolución definitiva de la herramienta de cálculo accesible para la **ONCE**. Esta versión ha sido rediseñada desde los cimientos para ofrecer una robustez industrial, seguridad avanzada y una accesibilidad sin compromisos.

---

## 💎 Características Premium

### ♿ Accesibilidad Estelar (WCAG 2.1 AA)
- **Announcer Engine**: Centralización de anuncios ARIA y síntesis de voz nativa (`speechSynthesis`).
- **Navegación Fluida**: Implementación de `SkipLinks` y gestión inteligente del foco visual (`focus-visible`).
- **Diseño Adaptativo**: Soporte completo para `reduced-motion` y alto contraste.

### 🛡️ Seguridad y Resiliencia
- **Rate Limiting Inteligente**: Protección contra ataques de denegación de servicio con **Upstash Redis** (con fallback automático en memoria para desarrollo).
- **Validación Zod**: Esquemas de entorno estrictos que fallan rápido para evitar despliegues erróneos.
- **Auth Pro**: Integración de **NextAuth.js** para una gestión de sesiones segura y personalizada.

### 🚀 Infraestructura Moderna
- **SpacetimeDB**: Base de datos distribuida en tiempo real que sustituye al legacy SQLite.
- **PWA Full-Stack**: Instalable en dispositivos móviles con soporte offline robusto y banners de estado de red.
- **Exportación Accesible**: Generación de reportes en **CSV** y **PDF** (optimizado para lectores de pantalla).

---

## 🛠️ Stack Tecnológico

| Área | Tecnología |
|---|---|
| **Frontend** | React 18 + Next.js 14 (App Router) |
| **Backend** | Next.js API Routes (Serverless ready) |
| **Base de Datos** | SpacetimeDB (Cloud/Edge) |
| **Caché/Security** | Upstash Redis |
| **Testing** | Vitest + Playwright + axe-core |
| **DevOps** | Docker Multi-stage + GitHub Actions |

---

## 📦 Instalación y Despliegue

### Requisitos Previos
- Node.js 20+
- [SpacetimeDB CLI](https://spacetimedb.com/docs/install)

### Configuración Local
1. **Clonar e instalar:**
   ```bash
   npm install
   ```
2. **Setup de entorno:**
   ```bash
   cp .env.example .env.local
   # El sistema ya incluye secretos generados en .env.local para tu comodidad
   ```
3. **Lanzar servicios:**
   ```bash
   # Terminal 1: Servidor DB
   spacetime start
   
   # Terminal 2: Publicar y lanzar app
   spacetime publish --project-path spacetimedb calculadora-once
   npm run dev
   ```

### Producción con Docker
```bash
docker-compose up --build
```

---

## ☁️ Despliegue en Vercel

El proyecto está optimizado para desplegarse automáticamente en la infraestructura de Vercel.

### 1. Preparar SpacetimeDB Cloud
Publica tu módulo en la nube oficial para que sea accesible vía WebSocket:
```bash
spacetime publish --project-path spacetimedb calculadora-once --server maincloud
```

### 2. Configurar Variables en Vercel
Añade las siguientes variables en el Dashboard de tu proyecto:
- `NEXT_PUBLIC_SPACETIMEDB_URI`: `wss://maincloud.spacetimedb.com`
- `NEXT_PUBLIC_SPACETIMEDB_DB_NAME`: `calculadora-once`
- `UPSTASH_REDIS_REST_URL`: (Tu URL de Upstash)
- `UPSTASH_REDIS_REST_TOKEN`: (Tu Token de Upstash)
- `NEXTAUTH_SECRET`: (Generado con `openssl rand -base64 32`)
- `NEXTAUTH_URL`: `https://tu-proyecto.vercel.app`

### 3. Automatización GitHub Actions
Para habilitar el despliegue automático desde CI/CD, añade estos Secrets en GitHub:
- `VERCEL_TOKEN`: Obtenido en Settings > Tokens.
- `VERCEL_ORG_ID`: ID de tu organización.
- `VERCEL_PROJECT_ID`: ID del proyecto en Vercel.

---

## 🧪 Calidad y Validación

Ejecuta nuestra suite de pruebas para asegurar la integridad de la aplicación:

```bash
# Unitarias e i18n
npm run test:unit

# Auditoría de Accesibilidad E2E
npm run test:a11y

# Linter de producción
npm run lint
```

---

## 📂 Estructura del Proyecto

```
.
├── spacetimedb/           # Lógica de base de datos (Reducers/Tables)
├── src/
│   ├── app/               # Endpoints API y Páginas (App Router)
│   ├── components/        # Componentes UI con foco en Accesibilidad
│   ├── lib/               # Utilidades (Auth, DB, Ratelimit, Announcer)
│   └── data/translations/ # Diccionarios multilingües JSON
├── tests/                 # Pruebas Playwright y auditorías Axe
├── Dockerfile             # Configuración de imagen optimizada
└── .github/workflows/     # Automatización CI/CD
```

---

## 🤝 Contribuciones y Soporte

Desarrollado para la **ONCE**. Para reportar problemas de accesibilidad o sugerir mejoras, por favor abre un Issue siguiendo las pautas del proyecto.

---

### Perfiles del Proyecto
- **GitHub**: [Haplee/once](https://github.com/Haplee/once)
- **Instagram**: [Fran Vidal](https://www.instagram.com/franvidalmateo)
- **X**: [@FranVidalMateo](https://x.com/FranVidalMateo)