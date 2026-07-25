import { useCallback, useEffect, useState } from 'react'

import BottomNav from './components/BottomNav'
import Loader from './components/Loader'
import SetupScreen from './components/SetupScreen'
import Toast from './components/Toast'

import { hibaMagyarul, useAuth } from './context/AuthContext'
import { isFirebaseConfigured } from './firebase'
import {
  figyeldAFeladatokat,
  figyeldASajatElozmenyeket,
  hazimunkaElvegzese,
} from './services/db'

import Admin from './pages/Admin'
import Dashboard from './pages/Dashboard'
import Leaderboard from './pages/Leaderboard'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Register from './pages/Register'
import Tasks from './pages/Tasks'

export default function App() {
  const { user, profile, loading, logout } = useAuth()

  // Melyik fül van nyitva: dashboard | tasks | leaderboard | profile
  const [ful, setFul] = useState('dashboard')
  // Bejelentkezés vagy regisztráció képernyő látszik-e
  const [authNezet, setAuthNezet] = useState('login')
  // Nyitva van-e az admin panel
  const [adminNyitva, setAdminNyitva] = useState(false)

  // Megosztott adatok (egy helyen töltjük be, több oldal használja)
  const [feladatok, setFeladatok] = useState([])
  const [logok, setLogok] = useState([])

  // Éppen melyik feladatot mentjük (hogy letiltsuk a gombját)
  const [foly, setFoly] = useState(null)
  // Felugró üzenet
  const [toast, setToast] = useState(null)

  // Üzenet megjelenítése – ezt adjuk át az oldalaknak.
  // A useCallback miatt ugyanaz a függvény marad minden újrarajzoláskor.
  const uzenet = useCallback((szoveg, tipus = 'success') => {
    setToast({ szoveg, tipus })
  }, [])

  const toastBezarasa = useCallback(() => setToast(null), [])

  // --- Feladatok élő betöltése ---
  useEffect(() => {
    if (!user) {
      setFeladatok([]) // kijelentkezéskor ürítjük
      return
    }
    const leiratkozas = figyeldAFeladatokat(setFeladatok, (error) => {
      console.error('Feladatok betöltési hiba:', error)
      uzenet(hibaMagyarul(error), 'error')
    })
    return leiratkozas
  }, [user, uzenet])

  // --- Saját előzmények élő betöltése ---
  useEffect(() => {
    if (!user) {
      setLogok([])
      return
    }
    const leiratkozas = figyeldASajatElozmenyeket(
      user.uid,
      setLogok,
      (error) => console.error('Előzmények betöltési hiba:', error)
    )
    return leiratkozas
  }, [user])

  // --- Házimunka elvégzése ---
  // Ez fut le, amikor valaki a "Kész!" gombra nyom.
  async function elvegzes(feladat) {
    if (foly) return // ne lehessen kétszer megnyomni
    setFoly(feladat.id)

    try {
      await hazimunkaElvegzese(user, profile, feladat)
      uzenet(`+${feladat.points} pont – szép munka! 🎉`)
    } catch (error) {
      console.error(error)
      uzenet(hibaMagyarul(error), 'error')
    } finally {
      setFoly(null)
    }
  }

  // ============================================================
  //  MIT MUTASSUNK?
  // ============================================================

  // 1) Nincs kitöltve a firebase.js -> beállítási útmutató
  if (!isFirebaseConfigured) {
    return <SetupScreen />
  }

  // 2) Még töltődik a bejelentkezési állapot
  if (loading) {
    return <Loader />
  }

  // 3) Nincs bejelentkezve -> belépés vagy regisztráció
  if (!user) {
    return authNezet === 'login' ? (
      <Login valtasRegisztraciora={() => setAuthNezet('register')} />
    ) : (
      <Register valtasBejelentkezesre={() => setAuthNezet('login')} />
    )
  }

  // 4) Be van jelentkezve, de nincs Firestore adatlapja.
  //    Ez ritka: pl. ha kézzel törölték a users dokumentumát.
  if (!profile) {
    return (
      <div className="center-screen">
        <span style={{ fontSize: 42 }}>⚠️</span>
        <p>
          Nem található a felhasználói adatlapod az adatbázisban.
          <br />
          Jelentkezz ki, és regisztrálj újra.
        </p>
        <button className="btn" onClick={logout}>
          Kijelentkezés
        </button>
      </div>
    )
  }

  // 5) Admin panel (a normál menü helyett)
  if (adminNyitva) {
    return (
      <div className="app">
        <Admin
          feladatok={feladatok}
          bezaras={() => setAdminNyitva(false)}
          uzenet={uzenet}
        />
        <Toast
          uzenet={toast?.szoveg}
          tipus={toast?.tipus}
          bezaras={toastBezarasa}
        />
      </div>
    )
  }

  // 6) A normál alkalmazás a 4 füllel
  return (
    <div className="app">
      {ful === 'dashboard' && (
        <Dashboard
          feladatok={feladatok}
          logok={logok}
          elvegzes={elvegzes}
          foly={foly}
        />
      )}

      {ful === 'tasks' && (
        <Tasks feladatok={feladatok} elvegzes={elvegzes} foly={foly} />
      )}

      {ful === 'leaderboard' && <Leaderboard />}

      {ful === 'profile' && (
        <Profile
          logok={logok}
          adminPanelMegnyitasa={() => setAdminNyitva(true)}
        />
      )}

      <BottomNav aktivFul={ful} valtasFulre={setFul} />

      <Toast
        uzenet={toast?.szoveg}
        tipus={toast?.tipus}
        bezaras={toastBezarasa}
      />
    </div>
  )
}
