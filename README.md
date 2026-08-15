# Diccionario Multidisciplina

Plataforma de diccionarios (Tango, Circo, …) con sitio público y backoffice.

## Qué hay acá

Monorepo base listo para seguir el aprendizaje paso a paso:

| Carpeta | Qué es |
|---------|--------|
| `apps/web` | Next.js (App Router) — sitio público y backoffice |
| `apps/api` | NestJS — API con esqueleto Clean Architecture |
| `packages/shared` | Tipos compartidos (`Dictionary`, `Term`) |
| `firebase.json` | Emuladores Auth + Firestore |

La guía para continuar (comandos, hitos, porqués) está en **[INSTRUCCIONES.md](./INSTRUCCIONES.md)**.

## Arrancar en local

Necesitás Node 20+ y pnpm.

```bash
pnpm install
```

Dos terminales:

```bash
pnpm dev:api    # Nest en http://localhost:3101/health
pnpm dev:web    # Next en http://localhost:3100
```

Si ves `API status: ok` en el home, el hop Next → Nest funciona.

## Git (Mac de trabajo)

Este repo usa identidad **local** (no global): `leo-it` / `lsainzveron@gmail.com`.
No ejecutes `git config --global` acá: mezclarías commits personales con los del trabajo.
