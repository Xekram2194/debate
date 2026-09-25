# Gran Debate Electoral · Coya 2026

Sala de control y cronometraje en pantalla gigante para debates electorales.
React 18 + Vite + Tailwind CSS + Framer Motion + Lucide React. Sonido con Web Audio API nativa.

Desarrollado por **XEKRAM COMPANY**.

## Puesta en marcha

```bash
npm install
npm run dev       # desarrollo en http://localhost:5173
npm run build     # compilación de producción en /dist
npm run preview   # sirve la compilación
```

La carpeta `dist/` es estática: puede abrirse desde cualquier hosting (Netlify, Vercel, Nginx) o un servidor local en la PC del estudio.

## Atajos de teclado (sala en vivo)

| Tecla     | Acción                                                        |
|-----------|---------------------------------------------------------------|
| `Espacio` | Iniciar turno (cuenta regresiva 5 s) · Pausar · Reanudar       |
| `Enter`   | Detener y pasar al siguiente candidato                         |
| `R`       | Reiniciar el tiempo del turno actual                           |
| `F`       | Pantalla completa (disponible desde cualquier vista)           |

Los atajos se ignoran mientras se escribe en un campo de formulario.

## Funcionamiento

- **Semáforo:** verde > 30 s, ámbar ≤ 30 s (doble beep), rojo parpadeante ≤ 10 s (tic por segundo), 00:00 muestra "Tiempo agotado" con pitido prolongado. Los umbrales se configuran en Ajustes.
- **Cronómetro por marcas de tiempo:** no acumula deriva, sobrevive a recargas y sigue corriendo si se refresca la página.
- **Dos pantallas:** abre la app en una segunda ventana del mismo navegador (p. ej. una en el monitor del operador y otra en pantalla completa en el proyector). Ambas se sincronizan en tiempo real vía `localStorage`. El navegador solo reproduce sonido en una ventana en la que se haya hecho clic o pulsado una tecla al menos una vez.
- **Escaleta:** marca quién ya intervino en el eje en curso; el botón ↺ reinicia la ronda.
- **Candidatos ausentes:** el interruptor los saca de la rotación sin borrarlos.
- **Respaldo:** Ajustes → Exportar / Importar `.json`. El importador acepta el mismo formato del JSON inicial (`debateConfig`, `topics`, `candidates`).

## Estructura

```
src/
├── App.jsx                     # Enrutado de vistas, atajos y pantalla completa
├── context/DebateContext.jsx   # Estado global, cronómetro, persistencia y acciones
├── data/defaultData.js         # Candidatos y ejes de Coya 2026
├── hooks/                      # usePersistentState, useFullscreen, useKeyboardShortcuts
├── lib/                        # audio (Web Audio), phase (semáforo), utils
└── components/
    ├── layout/                 # Header, Footer (XEKRAM COMPANY), Clock
    ├── live/                   # Sala en vivo: TimerPanel, CountdownOverlay, tarjetas, escaleta, controles
    ├── topics/                 # CRUD de ejes temáticos
    ├── candidates/             # Registro, orden (arrastrar) y habilitación
    ├── settings/               # Umbrales, sonido, importar/exportar
    └── ui/                     # Avatar, Switch, ConfirmButton, SectionHeader
```
