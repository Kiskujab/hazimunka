// ============================================================
//  AUTH CONTEXT
//  Itt kezeljük a bejelentkezést, regisztrációt, kijelentkezést.
//  A "Context" azt jelenti: bárhol az appban hozzáférhetsz
//  a bejelentkezett felhasználóhoz a useAuth() hívással.
// ============================================================

import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext(null)

// Ezt hívjuk meg a komponensekben: const { user, profile } = useAuth()
export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  // user = a Firebase Auth felhasználó (email, uid)
  const [user, setUser] = useState(null)
  // profile = a Firestore "users" dokumentum (username, total_points, role)
  const [profile, setProfile] = useState(null)
  // loading = amíg a Firebase eldönti, be vagyunk-e jelentkezve
  const [loading, setLoading] = useState(true)
  // regisztral = éppen most készül a fiók (lásd a register() függvényt)
  const [regisztral, setRegisztral] = useState(false)

  // 1. Figyeljük, hogy változik-e a bejelentkezés állapota
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (!currentUser) {
        setProfile(null)
        setLoading(false)
      }
    })
    // Amikor a komponens eltűnik, leiratkozunk (memóriaszivárgás ellen)
    return unsubscribe
  }, [])

  // 2. Ha van bejelentkezett user, ÉLŐBEN figyeljük a Firestore adatait.
  //    Az onSnapshot azt jelenti: ha változik az adat (pl. nő a pontszám),
  //    a képernyő magától frissül. Nem kell újratölteni az oldalt!
  useEffect(() => {
    if (!user) return

    const userRef = doc(db, 'users', user.uid)
    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setProfile({ id: snapshot.id, ...snapshot.data() })
        } else {
          setProfile(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Nem sikerült betölteni a profilt:', error)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [user])

  // --- REGISZTRÁCIÓ ---
  // A jelszót SOHA nem mentjük el mi magunk, azt a Firebase Auth kezeli!
  //
  // A "regisztral" jelzőre azért van szükség, mert a fiók létrejötte és
  // az adatlap mentése között van egy pillanat, amikor a felhasználó
  // már be van jelentkezve, de még nincs Firestore adatlapja. E nélkül
  // ilyenkor egy villanásnyi hibaüzenet jelenne meg.
  async function register(email, password, username) {
    setRegisztral(true)
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      )

      // Létrehozzuk a felhasználó adatlapját a Firestore-ban.
      // A dokumentum azonosítója = a felhasználó uid-ja.
      await setDoc(doc(db, 'users', credential.user.uid), {
        username: username.trim(),
        email: email.trim(),
        total_points: 0,
        role: 'user', // mindenki sima userként indul
        created_at: serverTimestamp(),
      })

      return credential.user
    } finally {
      setRegisztral(false)
    }
  }

  // --- BEJELENTKEZÉS ---
  async function login(email, password) {
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    )
    return credential.user
  }

  // --- KIJELENTKEZÉS ---
  async function logout() {
    await signOut(auth)
  }

  const value = {
    user,
    profile,
    loading: loading || regisztral,
    isAdmin: profile?.role === 'admin',
    register,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ------------------------------------------------------------
//  Firebase hibakódok magyarul
//  A Firebase angolul küldi a hibákat, itt lefordítjuk őket.
// ------------------------------------------------------------
export function hibaMagyarul(error) {
  const kod = error?.code || ''

  const forditasok = {
    'auth/invalid-email': 'Az e-mail cím formátuma nem megfelelő.',
    'auth/user-disabled': 'Ez a fiók le van tiltva.',
    'auth/user-not-found': 'Nincs ilyen e-mail címmel regisztrált fiók.',
    'auth/wrong-password': 'Hibás jelszó.',
    'auth/invalid-credential': 'Hibás e-mail cím vagy jelszó.',
    'auth/email-already-in-use': 'Ezzel az e-mail címmel már van fiók.',
    'auth/weak-password': 'A jelszó túl gyenge (legalább 6 karakter kell).',
    'auth/missing-password': 'Add meg a jelszót!',
    'auth/too-many-requests':
      'Túl sok próbálkozás. Várj pár percet, majd próbáld újra.',
    'auth/network-request-failed':
      'Nincs internetkapcsolat, vagy nem érhető el a Firebase.',
    'auth/operation-not-allowed':
      'Az e-mail/jelszó bejelentkezés nincs bekapcsolva a Firebase Console-ban.',
    'permission-denied':
      'Nincs jogosultságod ehhez a művelethez. Ellenőrizd a Firestore szabályokat!',
    unavailable: 'Nem érhető el az adatbázis. Ellenőrizd az internetet.',
  }

  return forditasok[kod] || error?.message || 'Ismeretlen hiba történt.'
}
