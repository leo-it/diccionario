# Instrucciones — Diccionario Multidisciplina

Guía para **vos**: el repo base ya está creado. A partir de acá escribís el código,
pegás snippets y corrés los comandos. El objetivo es aprender; no copies todo de una.

Trabajá siempre en:

```bash
cd /Users/lsainz/Desktop/proyectos/diccionario
```

---

## Cómo usar esta guía

1. Completá un hito.
2. Verificá con los comandos de “Comprobar”.
3. Recién ahí pasá al siguiente. Si algo falla, anotá la salida y preguntá.

Identidad Git de **este** repo (ya configurada, no uses `--global`):

- `user.name=leo-it`
- `user.email=lsainzveron@gmail.com`

Hay un `.npmrc` en la **raíz del repo** (no en `~/.npmrc`) para usar el registry público
de npm y no el de la Mac del trabajo. Se commitea; nunca le pongas tokens.

Comprobar, desde este directorio:

```bash
pnpm config get registry
```

Tiene que decir `https://registry.npmjs.org/`.
Si `~/.npmrc` del trabajo define un scope tipo `@empresa:registry=...`, eso **sigue
aplicando** a paquetes `@empresa/...`. Este proyecto no los usa; no instales paquetes
internos del laburo acá.

---

## Qué ya está hecho (Hitos 0 a 3)

### Hito 0 — Git local

Repo inicializado con identidad personal **solo acá** (no pisa el Git del trabajo).

Comprobar:

```bash
git config --list --local
```

### Hito 1 — Monorepo pnpm

```
apps/web          Next.js
apps/api          NestJS
packages/shared   tipos Dictionary y Term
```

`pnpm-workspace.yaml` une los paquetes. Un `pnpm install` en la raíz instala todo.

### Hito 2 — Nest + Clean Architecture + `/health`

Carpetas listas (vacías a propósito, salvo health):

```
apps/api/src/domain/            entidades y puertos (interfaces)
apps/api/src/application/       casos de uso
apps/api/src/infrastructure/    Firestore, Auth (adapters)
apps/api/src/presentation/      controllers HTTP
```

**Por qué:** el caso de uso depende de una interfaz, no de Firestore. Si un día
cambiás Firebase por Postgres, solo tocás `infrastructure`.

- Puerto **3101** (Next usa 3100; 3000/3001 suelen estar ocupados).
- CORS abierto a `http://localhost:3100`.
- `GET /health` → `{ "status": "ok" }`.

Arrancar:

```bash
pnpm install
pnpm dev:api
curl http://localhost:3101/health
```

### Hito 3 — Next habla con Nest

`apps/web/app/page.tsx` hace fetch de servidor a `API_URL/health`.

```bash
pnpm dev:web
```

Abrí http://localhost:3100 — tenés que ver `API status: ok`.
Si ves el aviso ámbar, Nest no está corriendo.

---

## Arranque diario (cuando exista Firebase)

Tres terminales:

```bash
pnpm emulators     # Auth 9099, Firestore 8080, UI http://localhost:4000
pnpm dev:api
pnpm dev:web
```

---

## Hito 4 — Firebase (cuenta personal)

**Por qué Nest abstrae Firebase:** el browser no toca Firestore. Next solo habla
con la API. Las Security Rules quedan en deny-all; Nest usa Admin SDK.

**Alternativa descartada:** que Next lea Firestore directo. Más simple, pero el
dominio se acopla a Firebase y mañana una app mobile duplicaría reglas.

### En la consola (con `lsainzveron@gmail.com`, no el mail del trabajo)

1. Entrá a https://console.firebase.google.com/
2. Creá un proyecto (ej. `diccionario-multidisciplina`).
3. Authentication → Sign-in method → **Google** y **Email/Password**.
4. Firestore Database → crear (modo producción; las rules del repo ya niegan todo al cliente).
5. Project settings → copiá `apiKey`, `authDomain`, `projectId`, `appId`.

### CLI (una vez)

```bash
pnpm add -g firebase-tools
firebase login
```

Confirmá que la cuenta sea la personal.

### Env de la API

Editá `apps/api/.env` y `apps/api/.env.example`:

```
FIREBASE_PROJECT_ID=el-id-real-de-tu-proyecto
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
PORT=3101
CORS_ORIGIN=http://localhost:3100
```

### Env del front (Auth del admin, más adelante)

Editá `apps/web/.env.local` con las keys de la consola (las `NEXT_PUBLIC_*` del `.env.example`).

### Admin SDK solo en Nest

```bash
pnpm --filter api add firebase-admin
```

Después creá (pedime el snippet cuando llegues):

- `apps/api/src/infrastructure/firebase/firebase.module.ts`
- `apps/api/src/infrastructure/firebase/firebase.service.ts`

Init del Admin SDK **sin** service account en local: con emuladores alcanza
`FIREBASE_PROJECT_ID` + `FIRESTORE_EMULATOR_HOST`.

Comprobar:

```bash
pnpm emulators
# en otra terminal, con la API corriendo:
curl http://localhost:3101/health
```

UI de emuladores: http://localhost:4000

`firestore.rules` ya está: el cliente no lee ni escribe. Eso es correcto.

---

## Hito 5 — Dominio Dictionary + `GET /dictionaries`

**Por qué un puerto (interfaz):** `ListPublishedDictionaries` pide
`DictionaryRepository`. El adapter de Firestore implementa esa interfaz.
SOLID: dependencia hacia adentro (Application → Domain, nunca Domain → Firebase).

Modelo Firestore `dictionaries/{id}`:

- `title`, `slug`, `description`, `coverImageUrl`
- `published`, `createdAt`, `updatedAt`, `createdBy`

Archivos a crear en Nest:

- [ ] `domain/dictionary/dictionary.entity.ts`
- [ ] `domain/dictionary/dictionary.repository.ts` (interfaz)
- [ ] `application/dictionary/list-published-dictionaries.use-case.ts`
- [ ] `infrastructure/firebase/firestore-dictionary.repository.ts`
- [ ] `presentation/dictionary/dictionary.controller.ts` → `GET /dictionaries`

En `packages/shared/src/index.ts` el tipo `Dictionary` ya existe: reusalo.

Comprobar:

```bash
curl http://localhost:3101/dictionaries
```

Debería devolver `[]` si Firestore está vacío.

Para probar con datos, en la UI del emulator (http://localhost:4000) creá un
documento en `dictionaries` con `published: true`.

---

## Hito 6 — Páginas públicas + SEO (ISR)

**Por qué ISR:** cada visita no tiene que pegarle a Firestore. Next guarda HTML
60 segundos. Menos costo de lecturas y mejor TTFB para Google.

Rutas en `apps/web/app`:

- [ ] `page.tsx` — listado de diccionarios publicados (reemplaza el check de health)
- [ ] `[dictionarySlug]/page.tsx` — términos de ese diccionario
- [ ] `[dictionarySlug]/[termSlug]/page.tsx` — ficha (la más importante para SEO)

En cada página:

```ts
export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // title + description del diccionario o término
}
```

Fetch siempre a Nest (`process.env.API_URL`), nunca a Firestore.

Comprobar: View Source en la ficha y ver el título/descripción en el HTML
(no solo en el cliente).

---

## Hito 7 — Auth admin

**Por qué token en Nest y no reglas de Firestore para el admin:** el backoffice
es un cliente más. Nest verifica el JWT de Firebase y mira `admins/{uid}`.
Si el documento existe, es admin. Más fácil de auditar que custom claims al inicio.

- [ ] Login en `/admin/login` (Firebase Auth **cliente**: Google + email)
- [ ] Guard en Nest: `Authorization: Bearer <idToken>`
- [ ] Colección `admins/{uid}` en el emulator
- [ ] Middleware o layout de Next que redirija si no hay sesión

Crear tu admin en el emulator (después de loguearte una vez y copiar el uid):

En Firestore emulator → colección `admins` → documento con ID = tu `uid`.

Comprobar: `GET /admin/dictionaries` sin token → 401; con token de no-admin → 403.

---

## Hito 8 — Backoffice CRUD diccionarios

Endpoints Nest (todos con AdminGuard):

- [ ] `GET /admin/dictionaries` (incluye no publicados)
- [ ] `POST /admin/dictionaries`
- [ ] `PATCH /admin/dictionaries/:id`
- [ ] `DELETE /admin/dictionaries/:id`

Formulario en `/admin`: título, slug, descripción, cover URL, published.

**Slug:** unique por diccionario. Generalo desde el título (minúsculas, guiones)
y validá colisiones en el use case, no en el controller.

---

## Hito 9 — Términos + Markdown + embed

Subcolección `dictionaries/{id}/terms/{termId}`:

- `lemma`, `slug`, `definition` (Markdown), `videoUrl`
- `published`, `lemmaLower` (para el Hito 10), `createdAt`, `updatedAt`

**Por qué Markdown y no un WYSIWYG:** versiona limpio, es fácil de renderizar,
y TipTap se puede sumar después.

**Por qué embed y no Storage:** no hay transcoding ni GB de egreso. El admin
pega una URL de YouTube/Vimeo; el front arma el iframe
(`www.youtube-nocookie.com` / player de Vimeo).

- [ ] CRUD admin de términos
- [ ] Página pública: Markdown → HTML
- [ ] Componente `VideoEmbed` que parsea YouTube y Vimeo

---

## Hito 10 — Búsqueda por prefijo + SEO

**Por qué no full-text en Firestore:** no es un motor de búsqueda. Un fetch por
tecla sale caro. MVP: campo `lemmaLower` + rango:

```
lemmaLower >= query
lemmaLower <= query + '\uf8ff'
```

Más adelante: Typesense o Algolia si el volumen lo pide.

- [ ] `GET /dictionaries/:slug/terms?q=`
- [ ] Input en `/{slug}`: buscar al submit o con debounce (300ms+), no en cada tecla
- [ ] Open Graph en la ficha (`og:title`, `og:description`)

---

## Modelo de datos (recordatorio)

```
dictionaries/{id}
  title, slug, description, coverImageUrl
  published, createdAt, updatedAt, createdBy

dictionaries/{id}/terms/{termId}
  lemma, slug, definition, videoUrl
  published, lemmaLower, createdAt, updatedAt

admins/{uid}    → si el doc existe, es admin
```

URLs públicas:

- `/` — diccionarios publicados
- `/{dictionarySlug}` — términos
- `/{dictionarySlug}/{termSlug}` — ficha SEO
- `/admin` — backoffice

---

## Decisiones que no hay que romper

1. Next **nunca** importa `firebase/firestore`. Solo Auth cliente en `/admin`.
2. No subas `.env` ni service accounts. Sí `.env.example`.
3. No uses `git config --global` en esta Mac para este proyecto.
4. Firebase y GitHub: cuenta personal (`lsainzveron@gmail.com` / `leo-it`).

Remote de GitHub (cuando quieras, no ahora):

```bash
git remote add origin git@github.com-personal:leo-it/diccionario.git
```

(El host `github.com-personal` asume una entrada en `~/.ssh/config` con tu key
personal, para no mezclarla con la del trabajo.)

---

## Si algo no arranca

| Síntoma | Qué mirar |
|---------|-----------|
| Home ámbar, no hay `ok` | `pnpm dev:api` y `curl localhost:3101/health` |
| Puerto en uso | Next 3100, Nest 3101; no los inviertas |
| Emulator no conecta | `FIRESTORE_EMULATOR_HOST` en `apps/api/.env` |
| Auth del trabajo en Firebase | `firebase logout` y `firebase login` con Gmail personal |
| Commit con mail de bdsol | `git config --list --local` tiene que mostrar gmail personal |
