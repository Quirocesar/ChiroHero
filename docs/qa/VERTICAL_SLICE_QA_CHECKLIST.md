# ChiroHero Vertical Slice QA Checklist

## A. Core Loop (3-4 min)

- [ ] Pre-jornada muestra: caja, deuda, bonus pendiente, pacientes previstos.
- [ ] Se puede iniciar dia sin errores.
- [ ] Flujo principal permite atender toda la cola en modo automatico.
- [ ] Cierre de dia muestra top 3 factores economicos.

## B. Auto Treatment

- [ ] 5 pacientes seguidos sin abrir minijuego manual.
- [ ] Resultados Good/Regular/Bad cambian con reputacion y skill.
- [ ] Paciente conflictivo puede impagar sin romper el estado.
- [ ] Reputacion sube/baja acorde al resultado.

## C. Economia Viva

- [ ] Se aplican costes diarios una vez por cierre.
- [ ] Cobro mensual (alquiler + impuestos) ocurre una vez por ciclo.
- [ ] Balance del reporte coincide con caja final.
- [ ] Prestamo y cuota se actualizan correctamente.

## D. Rescate Suave

- [ ] Si caja cae bajo umbral, se activa rescate.
- [ ] Caja vuelve al target definido.
- [ ] Se crea/actualiza cuota diaria y debt tier.
- [ ] No hay soft-lock despues del rescate.

## E. Guardado y Migracion

- [ ] Slot nuevo guarda `saveSchemaVersion`.
- [ ] Slot antiguo carga sin crash y rellena campos por defecto.
- [ ] Campos nuevos persisten tras cerrar y abrir app.

## F. UX Robustness

- [ ] Todas las pantallas tienen estado vacio o fallback.
- [ ] No hay strings corruptas visibles.
- [ ] No hay bloqueos en modales de negociacion o fin de dia.

## G. Build Gate

- [ ] `npm run check:encoding` pasa.
- [ ] `npm run lint` pasa.
- [ ] `npm run format:check` pasa.
- [ ] `npm run build:web` pasa.
