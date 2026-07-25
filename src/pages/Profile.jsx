import { useMemo } from 'react'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import { datumFormazas } from '../services/db'

// PROFIL OLDAL
// Saját adatok, teljes előzménylista, kijelentkezés,
// és adminoknak belépés az admin panelbe.
export default function Profile({ logok, adminPanelMegnyitasa }) {
  const { user, profile, isAdmin, logout } = useAuth()

  const osszesFeladat = logok.length

  // Az összes megszerzett pont az előzményekből
  const atlagPont = useMemo(() => {
    if (logok.length === 0) return 0
    const osszeg = logok.reduce((s, l) => s + (l.points_earned || 0), 0)
    return Math.round(osszeg / logok.length)
  }, [logok])

  async function kijelentkezes() {
    if (confirm('Biztosan kijelentkezel?')) {
      await logout()
    }
  }

  return (
    <>
      <Header cim="Profil" alcim={user.email} />

      <div className="content">
        {/* Saját adatok */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 800,
                flex: '0 0 56px',
              }}
            >
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                {profile.username}
              </div>
              <span className={`role-tag ${isAdmin ? 'admin' : ''}`}>
                {isAdmin ? 'admin' : 'családtag'}
              </span>
            </div>
          </div>
        </div>

        {/* Statisztikák */}
        <div className="stats-row">
          <div className="stat">
            <div className="value">{profile.total_points ?? 0}</div>
            <div className="caption">összes pont</div>
          </div>
          <div className="stat">
            <div className="value">{osszesFeladat}</div>
            <div className="caption">elvégzett munka</div>
          </div>
        </div>

        {/* Admin gomb – csak adminoknak látszik */}
        {isAdmin && (
          <button
            className="btn big full secondary"
            onClick={adminPanelMegnyitasa}
            style={{ marginBottom: 12 }}
          >
            ⚙️ Admin panel
          </button>
        )}

        {/* Előzmények */}
        <div className="section-title">Előzmények</div>

        {logok.length === 0 ? (
          <div className="card empty">
            <span className="emoji">📭</span>
            <p>Még nem végeztél el egyetlen házimunkát sem.</p>
          </div>
        ) : (
          <div className="card">
            {logok.map((log) => (
              <div key={log.id} className="log-row">
                <div className="info">
                  <div className="log-name">{log.task_name}</div>
                  <div className="log-date">{datumFormazas(log.timestamp)}</div>
                </div>
                <span className="badge green">+{log.points_earned}</span>
              </div>
            ))}
          </div>
        )}

        {logok.length > 0 && (
          <p className="hint">Átlagosan {atlagPont} pont munkánként.</p>
        )}

        <div className="divider" />

        <button className="btn full ghost" onClick={kijelentkezes}>
          Kijelentkezés
        </button>
      </div>
    </>
  )
}
