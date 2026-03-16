#!/usr/bin/env bash
# verify.sh — Checklist de verificacion post-Gemini
# Ejecutar desde la raiz del proyecto: bash verify.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

ok()   { echo -e "${GREEN}  OK${NC} $1"; PASS=$((PASS+1)); }
fail() { echo -e "${RED}  FAIL${NC} $1"; FAIL=$((FAIL+1)); }
warn() { echo -e "${YELLOW}  WARN${NC} $1"; WARN=$((WARN+1)); }
info() { echo -e "${BLUE}  -->  ${NC} $1"; }

echo ""
echo "==================================================="
echo "  Verificacion Calculadora de Cambio ONCE v2.0"
echo "==================================================="
echo ""

# --- 1. ESTRUCTURA DE ARCHIVOS ---
echo ">> 1. Estructura de archivos criticos"

archivos=(
  "package.json"
  ".env.example"
  "next.config.js"
  "tsconfig.json"
  "src/app/layout.tsx"
  "src/app/page.tsx"
  "src/app/history/page.tsx"
  "src/app/api/calculate/route.ts"
  "src/app/api/history/route.ts"
  "src/lib/env.ts"
  "src/lib/ratelimit.ts"
  "src/lib/announcer.ts"
  "src/lib/spacetimedb-client.ts"
  "src/lib/spacetimedb-server.ts"
  "src/middleware.ts"
  "src/components/ErrorBoundary.tsx"
  "src/components/SkipLink.tsx"
  "src/components/OfflineBanner.tsx"
  "src/components/ExportButtons.tsx"
  "src/components/AuthButton.tsx"
  "src/providers/SpacetimeDBProvider.tsx"
  "src/app/offline/page.tsx"
  "public/manifest.json"
  "spacetimedb/src/index.ts"
  "vitest.config.ts"
  "Dockerfile"
  "docker-compose.yml"
  ".github/workflows/ci.yml"
  ".github/workflows/accessibility-audit.yml"
)

for f in "${archivos[@]}"; do
  if [ -f "$f" ]; then
    ok "$f"
  else
    fail "$f NO EXISTE"
  fi
done

if [ -d "src/module_bindings" ]; then
  ok "src/module_bindings/ (directorio presente)"
else
  warn "src/module_bindings/ No generado (ejecutar: spacetime generate)"
fi

echo ""

# --- 2. PACKAGE.JSON ---
echo ">> 2. Dependencias en package.json"

if [ -f "package.json" ]; then
  pkg=$(cat package.json)

  if echo "$pkg" | grep -q '"spacetimedb"'; then
    ok "spacetimedb (paquete correcto)"
  else
    fail "spacetimedb no encontrado en package.json"
  fi

  if echo "$pkg" | grep -q '"@clockworklabs/spacetimedb-sdk"'; then
    fail "@clockworklabs/spacetimedb-sdk PRESENTE paquete DEPRECADO eliminar"
  else
    ok "paquete deprecado @clockworklabs ausente"
  fi

  deps_requeridas=(
    "next-auth"
    "next-pwa"
    "@upstash/ratelimit"
    "@upstash/redis"
    "zod"
    "jspdf"
    "papaparse"
  )

  for dep in "${deps_requeridas[@]}"; do
    if echo "$pkg" | grep -q "\"$dep\""; then
      ok "$dep"
    else
      fail "$dep falta en package.json"
    fi
  done

  dev_deps=(
    "vitest"
    "@axe-core/playwright"
    "@testing-library/react"
  )

  for dep in "${dev_deps[@]}"; do
    if echo "$pkg" | grep -q "\"$dep\""; then
      ok "$dep devDep"
    else
      fail "$dep falta en devDependencies"
    fi
  done

  echo ""
  echo "  Scripts npm:"
  for script in "test:unit" "test:e2e" "test"; do
    if echo "$pkg" | grep -q "\"$script\""; then
      ok "script: $script"
    else
      fail "script: $script no definido"
    fi
  done
else
  fail "package.json no existe"
fi

echo ""

# --- 3. ENV.EXAMPLE ---
echo ">> 3. Variables de entorno (.env.example)"

if [ -f ".env.example" ]; then
  env_vars=(
    "NEXT_PUBLIC_SPACETIMEDB_URI"
    "NEXT_PUBLIC_SPACETIMEDB_DB_NAME"
    "SPACETIMEDB_URI"
    "SPACETIMEDB_DB_NAME"
    "UPSTASH_REDIS_REST_URL"
    "UPSTASH_REDIS_REST_TOKEN"
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL"
  )
  for v in "${env_vars[@]}"; do
    if grep -q "$v" .env.example; then
      ok "$v"
    else
      fail "$v no esta en .env.example"
    fi
  done
else
  fail ".env.example no existe"
fi

echo ""

# --- 4. SPACETIMEDB MODULE ---
echo ">> 4. Modulo SpacetimeDB"

if [ -f "spacetimedb/src/index.ts" ]; then
  stdb_content=$(cat spacetimedb/src/index.ts)

  if echo "$stdb_content" | grep -q "OperationHistory"; then
    ok "Tabla OperationHistory definida"
  else
    fail "Tabla OperationHistory no encontrada en el modulo"
  fi

  if echo "$stdb_content" | grep -q "addOperation"; then
    ok "Reducer addOperation definido"
  else
    fail "Reducer addOperation no encontrado"
  fi

  if echo "$stdb_content" | grep -q "clearHistory"; then
    ok "Reducer clearHistory definido"
  else
    fail "Reducer clearHistory no encontrado"
  fi
else
  fail "spacetimedb/src/index.ts no existe"
fi

echo ""

# --- 5. ACCESIBILIDAD ---
echo ">> 5. Accesibilidad (revision estatica)"

if [ -f "src/app/page.tsx" ]; then
  if grep -q "aria-live" src/app/page.tsx; then
    ok "aria-live presente en page.tsx"
  else
    fail "aria-live NO encontrado en page.tsx resultados no se anuncian a screen readers"
  fi

  if grep -q "htmlFor\|aria-label" src/app/page.tsx; then
    ok "htmlFor / aria-label presentes en page.tsx"
  else
    warn "htmlFor / aria-label no detectados en page.tsx revisar manualmente"
  fi
else
  fail "src/app/page.tsx no existe"
fi

if [ -f "src/app/layout.tsx" ]; then
  if grep -q "SkipLink\|skip-link\|skipLink" src/app/layout.tsx; then
    ok "SkipLink integrado en layout.tsx"
  else
    fail "SkipLink NO integrado en layout.tsx"
  fi

  if grep -q "ErrorBoundary" src/app/layout.tsx; then
    ok "ErrorBoundary integrado en layout.tsx"
  else
    fail "ErrorBoundary NO integrado en layout.tsx"
  fi

  if grep -q "SpacetimeDBProvider\|spacetimedb" src/app/layout.tsx; then
    ok "SpacetimeDBProvider integrado en layout.tsx"
  else
    warn "SpacetimeDBProvider no detectado en layout.tsx verificar integracion"
  fi

  if grep -q 'lang=' src/app/layout.tsx; then
    ok "Atributo lang presente en layout"
  else
    fail "Atributo lang NO encontrado en html critico para accesibilidad"
  fi
else
  fail "src/app/layout.tsx no existe"
fi

if [ -f "src/app/history/page.tsx" ]; then
  if grep -q "caption\|scope=" src/app/history/page.tsx; then
    ok "Tabla accesible en history/page.tsx caption/scope"
  else
    fail "Tabla history: falta caption o scope= en cabeceras"
  fi
else
  fail "src/app/history/page.tsx no existe"
fi

if [ -f "src/lib/announcer.ts" ]; then
  if grep -q "announce\|announceVoice" src/lib/announcer.ts; then
    ok "announcer.ts exporta funciones de anuncio"
  else
    fail "announcer.ts no tiene las funciones announce/announceVoice"
  fi
else
  fail "src/lib/announcer.ts no existe"
fi

echo ""

# --- 6. SSR GUARD ---
echo ">> 6. SpacetimeDB Guard SSR"

if [ -f "src/lib/spacetimedb-client.ts" ]; then
  if grep -q "typeof window" src/lib/spacetimedb-client.ts; then
    ok "Guard SSR typeof window presente en spacetimedb-client.ts"
  else
    fail "Guard SSR AUSENTE en spacetimedb-client.ts crasheara en Server Components"
  fi
else
  fail "src/lib/spacetimedb-client.ts no existe"
fi

echo ""

# --- 7. PWA ---
echo ">> 7. PWA Configuracion"

if [ -f "next.config.js" ]; then
  if grep -q "pwa\|withPWA\|next-pwa" next.config.js; then
    ok "next-pwa configurado en next.config.js"
  else
    fail "next-pwa NO configurado en next.config.js"
  fi
else
  fail "next.config.js no existe"
fi

if [ -f "public/manifest.json" ]; then
  if grep -q '"name"' public/manifest.json && grep -q '"icons"' public/manifest.json; then
    ok "manifest.json tiene name e icons"
  else
    warn "manifest.json incompleto revisar campos obligatorios"
  fi
else
  fail "public/manifest.json no existe"
fi

echo ""

# --- 8. MIDDLEWARE ---
echo ">> 8. Middleware rate limiting"

if [ -f "src/middleware.ts" ]; then
  if grep -q "ratelimit\|rate" src/middleware.ts; then
    ok "Rate limiting referenciado en middleware.ts"
  else
    fail "Rate limiting NO encontrado en middleware.ts"
  fi

  if grep -q "matcher\|config" src/middleware.ts; then
    ok "Config matcher presente en middleware.ts"
  else
    warn "Config matcher no detectado el middleware puede ejecutarse en todas las rutas"
  fi
else
  fail "src/middleware.ts no existe"
fi

echo ""

# --- 9. TYPESCRIPT ---
echo ">> 9. TypeScript"

if command -v npx > /dev/null 2>&1; then
  info "Ejecutando tsc --noEmit puede tardar unos segundos..."
  tsc_output=$(npx tsc --noEmit 2>&1 || true)
  if [ -z "$tsc_output" ]; then
    ok "TypeScript compila sin errores"
  else
    fail "TypeScript tiene errores:"
    echo "$tsc_output" | head -20
  fi
else
  warn "npx no disponible omitiendo check TypeScript"
fi

echo ""

# --- 10. NODE_MODULES ---
echo ">> 10. Dependencias instaladas"

if [ -d "node_modules" ]; then
  ok "node_modules existe"

  for pkg_check in "spacetimedb" "next-auth" "zod" "jspdf"; do
    if [ -d "node_modules/$pkg_check" ]; then
      ok "$pkg_check instalado"
    else
      fail "$pkg_check NO instalado ejecutar: npm install"
    fi
  done
else
  fail "node_modules no existe ejecutar: npm install"
fi

echo ""

# --- RESUMEN ---
echo "==================================================="
echo "  RESUMEN"
echo "==================================================="
echo "  OK:   $PASS"
echo "  WARN: $WARN"
echo "  FAIL: $FAIL"
echo ""

if [ "$FAIL" -eq 0 ] && [ "$WARN" -le 3 ]; then
  echo "  El proyecto parece estar en buen estado."
  echo "  Siguiente: npm install && spacetime start && npm run dev"
elif [ "$FAIL" -gt 0 ] && [ "$FAIL" -le 5 ]; then
  echo "  Hay problemas menores. Revisar los FAIL antes de continuar."
else
  echo "  Hay problemas significativos. Gemini dejo trabajo incompleto."
  echo "  Pega la salida de este script para recibir ayuda."
fi

echo ""
echo "  Comandos utiles:"
echo "  npm install"
echo "  npx tsc --noEmit"
echo "  spacetime start"
echo "  spacetime generate --lang typescript --out-dir src/module_bindings --project-path spacetimedb"
echo "  npm run dev"
echo "  npm run test:unit"
echo ""