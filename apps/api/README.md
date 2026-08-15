# API (NestJS)

Clean Architecture:

- `src/domain` — entidades y puertos
- `src/application` — casos de uso
- `src/infrastructure` — Firebase (cuando llegue el Hito 4)
- `src/presentation` — HTTP (`GET /health` ya existe)

Guía completa: [INSTRUCCIONES.md](../../INSTRUCCIONES.md)

```bash
pnpm --filter api start:dev
curl http://localhost:3101/health
```
