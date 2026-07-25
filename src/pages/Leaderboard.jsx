import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Loader from '../components/Loader'
import { useAuth } from '../context/AuthContext'
import { figyeldARanglistat } from '../services/db'

// RANGLISTA
// Minden felhasználó pontszám szerint csökkenő sorrendben.
export default function Leaderboard() {
  const { user } = useAuth()
  const [userek, setUserek] = useState([])
  const [tolt, setTolt] = useState(true)

  // Élő figyelés: ha valaki pontot szerez, azonnal frissül a lista
  useEffect(() => {
    const leiratkozas = figyeldARanglistat(
      (lista) => {
        setUserek(lista)
        setTolt(false)
      },
      (error) => {
        console.error('Ranglista hiba:', error)
        setTolt(false)
      }
    )
    return leiratkozas
  }, [])

  if (tolt) return <Loader />

  return (
    <>
      <Header cim="Rangsor" alcim={`${userek.length} családtag versenyben`} />

      <div className="content">
        {userek.length === 0 ? (
          <div className="card empty">
            <span className="emoji">🏆</span>
            <p>Még nincs egyetlen regisztrált felhasználó sem.</p>
          </div>
        ) : (
          userek.map((u, index) => {
            const helyezes = index + 1
            const enVagyok = u.id === user.uid

            return (
              <div
                key={u.id}
                className={`rank-row ${enVagyok ? 'me' : ''}`}
              >
                <div className={`rank-number ${eremOsztaly(helyezes)}`}>
                  {helyezes}
                </div>

                <div className="info">
                  <div className="username">
                    {u.username}
                    {enVagyok && ' (te)'}
                  </div>
                  {u.role === 'admin' && (
                    <span className="role-tag admin">admin</span>
                  )}
                </div>

                <div className="points">{u.total_points ?? 0}</div>
              </div>
            )
          })
        )}

        <p className="hint">
          A pontok automatikusan frissülnek, amint valaki elvégez egy
          házimunkát.
        </p>
      </div>
    </>
  )
}

// Az első 3 helyezett külön színt kap: arany, ezüst, bronz
function eremOsztaly(helyezes) {
  if (helyezes === 1) return 'medal-1'
  if (helyezes === 2) return 'medal-2'
  if (helyezes === 3) return 'medal-3'
  return ''
}
