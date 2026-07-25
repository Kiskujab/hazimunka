// ============================================================
//  ALSÓ MENÜSÁV
//  4 fül: Főoldal, Feladatok, Rangsor, Profil
//  Az ikonok beágyazott SVG-k, így nem kell külön ikon-csomag.
// ============================================================

const IKONOK = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.8V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.8" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  ),
  tasks: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5h10" />
      <path d="M9 12h10" />
      <path d="M9 19h10" />
      <path d="m3 5 1.5 1.5L7 4" />
      <path d="m3 12 1.5 1.5L7 11" />
      <path d="m3 19 1.5 1.5L7 18" />
    </svg>
  ),
  leaderboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4h10v6a5 5 0 0 1-10 0V4Z" />
      <path d="M17 5h3v2a3 3 0 0 1-3 3" />
      <path d="M7 5H4v2a3 3 0 0 0 3 3" />
      <path d="M12 15v3" />
      <path d="M8.5 21h7l-.7-3h-5.6l-.7 3Z" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </svg>
  ),
}

const FULEK = [
  { id: 'dashboard', label: 'Főoldal' },
  { id: 'tasks', label: 'Feladatok' },
  { id: 'leaderboard', label: 'Rangsor' },
  { id: 'profile', label: 'Profil' },
]

export default function BottomNav({ aktivFul, valtasFulre }) {
  return (
    <nav className="bottom-nav">
      {FULEK.map((ful) => (
        <button
          key={ful.id}
          className={`nav-item ${aktivFul === ful.id ? 'active' : ''}`}
          onClick={() => valtasFulre(ful.id)}
          aria-label={ful.label}
          aria-current={aktivFul === ful.id ? 'page' : undefined}
        >
          {IKONOK[ful.id]}
          <span>{ful.label}</span>
        </button>
      ))}
    </nav>
  )
}
