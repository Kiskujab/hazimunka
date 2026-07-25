import { useState } from 'react'
import { hibaMagyarul, useAuth } from '../context/AuthContext'

// BEJELENTKEZŐ KÉPERNYŐ
export default function Login({ valtasRegisztraciora }) {
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [jelszo, setJelszo] = useState('')
  const [hiba, setHiba] = useState('')
  const [tolt, setTolt] = useState(false)

  async function kuldes(esemeny) {
    esemeny.preventDefault() // ne töltse újra az oldalt
    setHiba('')
    setTolt(true)

    try {
      await login(email, jelszo)
      // Ha sikerül, az AuthContext automatikusan észreveszi,
      // és az App átvált a főoldalra – itt nincs több teendő.
    } catch (error) {
      setHiba(hibaMagyarul(error))
      setTolt(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-logo">
        <div className="emoji">🧹</div>
        <h1>Házimunka Pontok</h1>
        <p>Gyűjts pontokat a családi feladatokkal!</p>
      </div>

      <form onSubmit={kuldes} className="card">
        {hiba && <div className="error-box">{hiba}</div>}

        <div className="field">
          <label htmlFor="email">E-mail cím</label>
          <input
            id="email"
            className="input"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="pelda@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="jelszo">Jelszó</label>
          <input
            id="jelszo"
            className="input"
            type="password"
            autoComplete="current-password"
            placeholder="••••••"
            value={jelszo}
            onChange={(e) => setJelszo(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn big full" disabled={tolt}>
          {tolt ? 'Belépés...' : 'Bejelentkezés'}
        </button>
      </form>

      <div className="auth-switch">
        Még nincs fiókod?
        <button type="button" onClick={valtasRegisztraciora}>
          Regisztrálj!
        </button>
      </div>
    </div>
  )
}
