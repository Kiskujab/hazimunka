import { useMemo, useState } from 'react'
import Header from '../components/Header'

// FELADATOK OLDAL
// Az összes elérhető házimunka listája, mindegyik mellett
// egy nagy "Kész!" gombbal.
export default function Tasks({ feladatok, elvegzes, foly }) {
  const [kereses, setKereses] = useState('')

  const szurtFeladatok = useMemo(() => {
    const szo = kereses.trim().toLowerCase()
    if (!szo) return feladatok
    return feladatok.filter((f) => f.name.toLowerCase().includes(szo))
  }, [feladatok, kereses])

  return (
    <>
      <Header
        cim="Feladatok"
        alcim={`${feladatok.length} elérhető házimunka`}
      />

      <div className="content">
        {feladatok.length > 5 && (
          <input
            className="input"
            type="search"
            placeholder="Keresés..."
            value={kereses}
            onChange={(e) => setKereses(e.target.value)}
            style={{ marginBottom: 14 }}
          />
        )}

        {szurtFeladatok.length === 0 ? (
          <div className="card empty">
            <span className="emoji">🧺</span>
            <p>
              {feladatok.length === 0
                ? 'Még nincs egyetlen feladat sem. Az admin tud létrehozni újakat.'
                : 'Nincs találat erre a keresésre.'}
            </p>
          </div>
        ) : (
          szurtFeladatok.map((feladat) => (
            <div key={feladat.id} className="task-row">
              <div className="info">
                <div className="task-name">{feladat.name}</div>
                <div className="task-points">
                  <span className="badge">{feladat.points} pont</span>
                </div>
              </div>
              <button
                className="btn success"
                onClick={() => elvegzes(feladat)}
                disabled={foly === feladat.id}
              >
                {foly === feladat.id ? '...' : 'Kész!'}
              </button>
            </div>
          ))
        )}
      </div>
    </>
  )
}
