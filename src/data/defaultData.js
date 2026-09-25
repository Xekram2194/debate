// Configuración inicial del debate. Se carga en localStorage la primera vez
// que se abre la aplicación (o al usar "Restaurar datos de fábrica").
export const DEFAULT_DATA = {
  debateConfig: {
    title: 'Gran Debate Electoral - Coya 2026',
    countdownIntroSeconds: 5,
    warningThresholdSeconds: 30,
    criticalThresholdSeconds: 10,
  },
  topics: [
    { id: 't1', title: 'Seguridad Ciudadana y Orden Público', durationMinutes: 2, durationSeconds: 0 },
    { id: 't2', title: 'Desarrollo Económico, Turismo y Agricultura Local', durationMinutes: 3, durationSeconds: 0 },
    { id: 't3', title: 'Salud, Saneamiento Básico y Educación', durationMinutes: 2, durationSeconds: 30 },
    { id: 't4', title: 'Mensaje Final y Compromiso con Coya', durationMinutes: 1, durationSeconds: 30 },
  ],
  candidates: [
    { id: 'c1', name: 'Paulo Quino Rodriguez', party: 'Progresemos', color: '#0ea5e9', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=PQ' },
    { id: 'c2', name: 'Wilber Esquivel Moscoso', party: 'Partido Demócrata Verde', color: '#16a34a', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=WE' },
    { id: 'c3', name: 'Moises Champi Champi', party: 'Partido Político PRIN', color: '#dc2626', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MC' },
    { id: 'c4', name: 'David Ojeda Champi', party: 'Alianza Electoral Venceremos', color: '#9333ea', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=DO' },
    { id: 'c5', name: 'John Moises Guevara Mora', party: 'Partido Político Perú Primero', color: '#ea580c', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=JG' },
    { id: 'c6', name: 'Diego Huillca Cconislla', party: 'Ahora Nación - AN', color: '#2563eb', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=DH' },
    { id: 'c7', name: 'Hebert Chalco Mora', party: 'Partido del Buen Gobierno', color: '#059669', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=HC' },
    { id: 'c8', name: 'Lizardo Emilio Palomino Ricalde', party: 'Acción Popular', color: '#b91c1c', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=LP' },
  ],
};
