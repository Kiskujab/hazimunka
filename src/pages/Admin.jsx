import { useEffect, useState } from 'react'
import Header from '../components/Header'
import { hibaMagyarul, useAuth } from '../context/AuthContext'
import {
  datumFormazas,
  feladatLetrehozasa,
  feladatModositasa,
  feladatTorlese,
  figyeldARanglistat,
  figyeldAzOsszesElozmenyt,
  naploTorlese,
  pontokModositasa,
  szerepkorBeallitasa,
} from '../services/db'

// ADMIN PANEL
// Csak akkor érhető el, ha a felhasználó "role" mezője
// a Firestore-ban "admin".
export default function Admin({ feladatok, bezaras, uzenet }) {
  const { user, isAdmin } = useAuth()

  const [userek, setUserek] = useState([])
  const [naplok, setNaplok] = useState([])
  const [ful, setFul] = useState('feladatok') // feladatok | userek | naplo

  // Élő figyelés a felhasználókra és a naplóra
  useEffect(() => {
    if (!isAdmin) return
    const le1 = figyeldARanglistat(setUserek, console.error)
    const le2 = figyeldAzOsszesElozmenyt(setNaplok, console.error)
    return () => {
      le1()
      le2()
    }
  }, [isAdmin])

  // Biztonsági ellenőrzés: ha valahogy mégis ide kerülne egy sima user
  if (!isAdmin) {
    return (
      <>
        <Header
          cim="Admin panel"
          jobbOldal={
            <button className="btn small ghost" onClick={bezaras}>
              Vissza
            </button>
          }
        />
        <div className="content">
          <div className="card empty">
            <span className="emoji">🔒</span>
            <p>Ehhez az oldalhoz admin jogosultság szükséges.</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header
        cim="Admin panel"
        alcim="Feladatok és pontok kezelése"
        jobbOldal={
          <button className="btn small ghost" onClick={bezaras}>
            Vissza
          </button>
        }
      />

      <div className="content">
        {/* Fül választó */}
        <div className="row" style={{ marginBottom: 16 }}>
          <button
            className={`btn small ${ful === 'feladatok' ? '' : 'ghost'}`}
            onClick={() => setFul('feladatok')}
          >
            Feladatok
          </button>
          <button
            className={`btn small ${ful === 'userek' ? '' : 'ghost'}`}
            onClick={() => setFul('userek')}
          >
            Tagok
          </button>
          <button
            className={`btn small ${ful === 'naplo' ? '' : 'ghost'}`}
            onClick={() => setFul('naplo')}
          >
            Napló
          </button>
        </div>

        {ful === 'feladatok' && (
          <FeladatKezelo feladatok={feladatok} uzenet={uzenet} />
        )}
        {ful === 'userek' && (
          <TagKezelo userek={userek} sajatId={user.uid} uzenet={uzenet} />
        )}
        {ful === 'naplo' && <NaploKezelo naplok={naplok} uzenet={uzenet} />}
      </div>
    </>
  )
}

/* ============================================================
   1. FELADATOK KEZELÉSE (létrehozás / szerkesztés / törlés)
   ============================================================ */
function FeladatKezelo({ feladatok, uzenet }) {
  const [nev, setNev] = useState('')
  const [pont, setPont] = useState('10')
  const [szerkesztettId, setSzerkesztettId] = useState(null)
  const [ment, setMent] = useState(false)

  async function mentes(esemeny) {
    esemeny.preventDefault()

    if (!nev.trim()) {
      uzenet('Add meg a feladat nevét!', 'error')
      return
    }
    const pontSzam = Number(pont)
    if (!Number.isFinite(pontSzam) || pontSzam <= 0) {
      uzenet('A pontszám legyen 0-nál nagyobb szám!', 'error')
      return
    }

    setMent(true)
    try {
      if (szerkesztettId) {
        await feladatModositasa(szerkesztettId, nev, pontSzam)
        uzenet('Feladat módosítva ✓')
      } else {
        await feladatLetrehozasa(nev, pontSzam)
        uzenet('Feladat létrehozva ✓')
      }
      megsemUrlap()
    } catch (error) {
      uzenet(hibaMagyarul(error), 'error')
    } finally {
      setMent(false)
    }
  }

  function szerkesztesInditasa(feladat) {
    setSzerkesztettId(feladat.id)
    setNev(feladat.name)
    setPont(String(feladat.points))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function megsemUrlap() {
    setSzerkesztettId(null)
    setNev('')
    setPont('10')
  }

  async function torles(feladat) {
    if (!confirm(`Biztosan törlöd? "${feladat.name}"`)) return
    try {
      await feladatTorlese(feladat.id)
      uzenet('Feladat törölve')
      if (szerkesztettId === feladat.id) megsemUrlap()
    } catch (error) {
      uzenet(hibaMagyarul(error), 'error')
    }
  }

  return (
    <>
      {/* Új feladat / szerkesztés űrlap */}
      <form className="card" onSubmit={mentes}>
        <div className="field">
          <label htmlFor="fnev">
            {szerkesztettId ? 'Feladat szerkesztése' : 'Új feladat neve'}
          </label>
          <input
            id="fnev"
            className="input"
            type="text"
            placeholder="Pl. Mosogatás"
            value={nev}
            onChange={(e) => setNev(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="fpont">Pontérték</label>
          <input
            id="fpont"
            className="input"
            type="number"
            inputMode="numeric"
            min="1"
            value={pont}
            onChange={(e) => setPont(e.target.value)}
          />
        </div>

        <div className="row">
          {szerkesztettId && (
            <button
              type="button"
              className="btn ghost"
              onClick={megsemUrlap}
            >
              Mégse
            </button>
          )}
          <button type="submit" className="btn" disabled={ment}>
            {ment
              ? 'Mentés...'
              : szerkesztettId
                ? 'Mentés'
                : 'Feladat hozzáadása'}
          </button>
        </div>
      </form>

      <div className="section-title">Meglévő feladatok ({feladatok.length})</div>

      {feladatok.length === 0 ? (
        <div className="card empty">
          <span className="emoji">📝</span>
          <p>Még nincs feladat. Vegyél fel egyet a fenti űrlappal!</p>
        </div>
      ) : (
        feladatok.map((feladat) => (
          <div key={feladat.id} className="task-row">
            <div className="info">
              <div className="task-name">{feladat.name}</div>
              <div className="task-points">{feladat.points} pont</div>
            </div>
            <button
              className="btn small secondary"
              onClick={() => szerkesztesInditasa(feladat)}
            >
              Szerkeszt
            </button>
            <button
              className="btn small danger"
              onClick={() => torles(feladat)}
            >
              Töröl
            </button>
          </div>
        ))
      )}
    </>
  )
}

/* ============================================================
   2. CSALÁDTAGOK KEZELÉSE (pont módosítás / admin jog)
   ============================================================ */
function TagKezelo({ userek, sajatId, uzenet }) {
  async function pontValtoztatas(u, valtozas) {
    try {
      await pontokModositasa(u.id, valtozas)
      uzenet(
        `${u.username}: ${valtozas > 0 ? '+' : ''}${valtozas} pont`
      )
    } catch (error) {
      uzenet(hibaMagyarul(error), 'error')
    }
  }

  async function egyediPont(u) {
    const bevitel = prompt(
      `Mennyi pontot adsz hozzá ${u.username} pontjaihoz?\n(Levonáshoz írj mínuszt, pl. -15)`,
      '0'
    )
    if (bevitel === null) return

    const szam = Number(bevitel)
    if (!Number.isFinite(szam) || szam === 0) {
      uzenet('Érvénytelen szám.', 'error')
      return
    }
    await pontValtoztatas(u, szam)
  }

  async function szerepValtas(u) {
    const ujSzerep = u.role === 'admin' ? 'user' : 'admin'
    const szoveg =
      ujSzerep === 'admin'
        ? `${u.username} adminná tétele. Biztos?`
        : `${u.username} admin jogának elvétele. Biztos?`

    if (!confirm(szoveg)) return

    try {
      await szerepkorBeallitasa(u.id, ujSzerep)
      uzenet(`${u.username} szerepköre: ${ujSzerep}`)
    } catch (error) {
      uzenet(hibaMagyarul(error), 'error')
    }
  }

  return (
    <>
      <div className="section-title">Családtagok ({userek.length})</div>

      {userek.map((u) => (
        <div key={u.id} className="card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700 }}>
                {u.username}
                {u.id === sajatId && ' (te)'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>
                {u.email}
              </div>
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: 'var(--accent)',
              }}
            >
              {u.total_points ?? 0}
            </div>
          </div>

          <div className="row" style={{ marginBottom: 8 }}>
            <button
              className="btn small danger"
              onClick={() => pontValtoztatas(u, -5)}
            >
              −5
            </button>
            <button
              className="btn small secondary"
              onClick={() => pontValtoztatas(u, 5)}
            >
              +5
            </button>
            <button className="btn small ghost" onClick={() => egyediPont(u)}>
              Egyedi
            </button>
          </div>

          <button
            className={`btn small full ${
              u.id !== sajatId && u.role === 'admin' ? 'danger' : 'ghost'
            }`}
            onClick={() => szerepValtas(u)}
            disabled={u.id === sajatId}
          >
            {u.id === sajatId
              ? 'Saját szerepköröd nem módosítható'
              : u.role === 'admin'
                ? 'Admin jog elvétele'
                : 'Adminná tétel'}
          </button>
        </div>
      ))}

      <p className="hint">
        Az első admint a Firebase Console-ban kell kézzel beállítani (lásd a
        README-t). Utána innen is tudsz adminokat kinevezni.
      </p>
    </>
  )
}

/* ============================================================
   3. NAPLÓ (minden elvégzett házimunka)
   ============================================================ */
function NaploKezelo({ naplok, uzenet }) {
  async function torles(log) {
    if (
      !confirm(
        `Törlöd ezt a bejegyzést?\n"${log.task_name}" – ${log.username}\nA ${log.points_earned} pont vissza lesz vonva.`
      )
    )
      return

    try {
      await naploTorlese(log)
      uzenet('Bejegyzés törölve, pont visszavonva')
    } catch (error) {
      uzenet(hibaMagyarul(error), 'error')
    }
  }

  return (
    <>
      <div className="section-title">Legutóbbi tevékenység</div>

      {naplok.length === 0 ? (
        <div className="card empty">
          <span className="emoji">📭</span>
          <p>Még nincs elvégzett házimunka.</p>
        </div>
      ) : (
        <div className="card">
          {naplok.map((log) => (
            <div key={log.id} className="log-row">
              <div className="info">
                <div className="log-name">{log.task_name}</div>
                <div className="log-date">
                  {log.username} · {datumFormazas(log.timestamp)}
                </div>
              </div>
              <span className="badge green">+{log.points_earned}</span>
              <button
                className="btn small danger"
                onClick={() => torles(log)}
                aria-label="Törlés"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
