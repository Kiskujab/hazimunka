import { useMemo } from 'react'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import { datumFormazas, maVolt } from '../services/db'

// FŐOLDAL
// Itt látod a pontjaidat, a mai teljesítményt, és gyorsan
// el tudsz végezni egy feladatot.
export default function Dashboard({ feladatok, logok, elvegzes, foly }) {
  const { profile } = useAuth()

  // A useMemo azt jelenti: csak akkor számoljuk újra,
  // ha a logok listája megváltozik. Így gyorsabb az app.
  const maiStatisztika = useMemo(() => {
    const maiak = logok.filter((log) => maVolt(log.timestamp))
    const maiPontok = maiak.reduce(
      (osszeg, log) => osszeg + (log.points_earned || 0),
      0
    )
    return { darab: maiak.length, pontok: maiPontok }
  }, [logok])

  // A 4 legtöbb pontot érő feladat a gyors gombokhoz
  const gyorsFeladatok = useMemo(() => {
    return [...feladatok].sort((a, b) => b.points - a.points).slice(0, 4)
  }, [feladatok])

  const utolsoHarom = logok.slice(0, 3)

  return (
    <>
      <Header cim="Főoldal" alcim="Családi házimunka pontok" />

      <div className="content">
        {/* Nagy pontszám kártya */}
        <div className="points-card">
          <div className="greeting">{koszontes()}</div>
          <div className="name">{profile.username} 👋</div>
          <div className="big-number">{profile.total_points ?? 0}</div>
          <div className="label">összegyűjtött pont</div>
        </div>

        {/* Mai statisztika */}
        <div className="stats-row">
          <div className="stat">
            <div className="value">{maiStatisztika.darab}</div>
            <div className="caption">mai feladat</div>
          </div>
          <div className="stat">
            <div className="value">+{maiStatisztika.pontok}</div>
            <div className="caption">mai pont</div>
          </div>
        </div>

        {/* Gyors műveletek */}
        <div className="section-title">Gyors befejezés</div>

        {gyorsFeladatok.length === 0 ? (
          <div className="card empty">
            <span className="emoji">📝</span>
            <p>
              Még nincsenek feladatok. Az admin tud felvenni újakat a Profil
              fülön.
            </p>
          </div>
        ) : (
          gyorsFeladatok.map((feladat) => (
            <div key={feladat.id} className="task-row">
              <div className="info">
                <div className="task-name">{feladat.name}</div>
                <div className="task-points">{feladat.points} pont</div>
              </div>
              <button
                className="btn small success"
                onClick={() => elvegzes(feladat)}
                disabled={foly === feladat.id}
              >
                {foly === feladat.id ? '...' : 'Kész!'}
              </button>
            </div>
          ))
        )}

        {/* Legutóbbi tevékenység */}
        {utolsoHarom.length > 0 && (
          <>
            <div className="section-title">Legutóbb</div>
            <div className="card">
              {utolsoHarom.map((log) => (
                <div key={log.id} className="log-row">
                  <div className="info">
                    <div className="log-name">{log.task_name}</div>
                    <div className="log-date">
                      {datumFormazas(log.timestamp)}
                    </div>
                  </div>
                  <span className="badge green">+{log.points_earned}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

// Napszaknak megfelelő köszöntés
function koszontes() {
  const ora = new Date().getHours()
  if (ora < 10) return 'Jó reggelt,'
  if (ora < 18) return 'Szia,'
  return 'Jó estét,'
}
