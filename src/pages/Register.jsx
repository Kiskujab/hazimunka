import { useState } from 'react'
import { hibaMagyarul, useAuth } from '../context/AuthContext'

// REGISZTRÁCIÓS KÉPERNYŐ
export default function Register({ valtasBejelentkezesre }) {
  const { register } = useAuth()

  const [nev, setNev] = useState('')
  const [email, setEmail] = useState('')
  const [jelszo, setJelszo] = useState('')
  const [jelszoUjra, setJelszoUjra] = useState('')
  const [hiba, setHiba] = useState('')
  const [tolt, setTolt] = useState(false)

  async function kuldes(esemeny) {
    esemeny.preventDefault()
    setHiba('')

    // Egyszerű ellenőrzések, mielőtt a Firebase-hez fordulnánk
    if (nev.trim().length < 2) {
      setHiba('A név legyen legalább 2 karakter hosszú.')
      return
    }
    if (jelszo.length < 6) {
      setHiba('A jelszó legyen legalább 6 karakter hosszú.')
      return
    }
    if (jelszo !== jelszoUjra) {
      setHiba('A két jelszó nem egyezik.')
      return
    }

    setTolt(true)
    try {
      await register(email, jelszo, nev)
    } catch (error) {
      setHiba(hibaMagyarul(error))
      setTolt(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-logo">
        <div className="emoji">✨</div>
        <h1>Új fiók</h1>
        <p>Csatlakozz a családi versenyhez!</p>
      </div>

      <form onSubmit={kuldes} className="card">
        {hiba && <div className="error-box">{hiba}</div>}

        <div className="field">
          <label htmlFor="nev">Felhasználónév</label>
          <input
            id="nev"
            className="input"
            type="text"
            placeholder="Pl. Anna"
            value={nev}
            onChange={(e) => setNev(e.target.value)}
            required
          />
        </div>

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
          <label htmlFor="jelszo">Jelszó (min. 6 karakter)</label>
          <input
            id="jelszo"
            className="input"
            type="password"
            autoComplete="new-password"
            placeholder="••••••"
            value={jelszo}
            onChange={(e) => setJelszo(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="jelszo2">Jelszó újra</label>
          <input
            id="jelszo2"
            className="input"
            type="password"
            autoComplete="new-password"
            placeholder="••••••"
            value={jelszoUjra}
            onChange={(e) => setJelszoUjra(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn big full" disabled={tolt}>
          {tolt ? 'Létrehozás...' : 'Regisztráció'}
        </button>
      </form>

      <div className="auth-switch">
        Van már fiókod?
        <button type="button" onClick={valtasBejelentkezesre}>
          Jelentkezz be!
        </button>
      </div>
    </div>
  )
}
