// ============================================================
//  FIRESTORE MŰVELETEK
//  Minden adatbázis-művelet itt van egy helyen, hogy a
//  komponensek tiszták és átláthatóak maradjanak.
//
//  Adatszerkezet:
//    users/{uid}   -> { username, email, total_points, role, created_at }
//    tasks/{id}    -> { name, points, created_at }
//    logs/{id}     -> { user_id, username, task_id, task_name,
//                       points_earned, timestamp }
// ============================================================

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'

// ------------------------------------------------------------
//  FELADATOK (tasks)
// ------------------------------------------------------------

// Élő figyelés az összes feladatra (név szerint rendezve).
// Visszaad egy "leiratkozó" függvényt, amit a useEffect-ben kell meghívni.
export function figyeldAFeladatokat(callback, onError) {
  const q = query(collection(db, 'tasks'), orderBy('name'))
  return onSnapshot(
    q,
    (snapshot) => {
      const feladatok = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      callback(feladatok)
    },
    onError
  )
}

// Új feladat létrehozása (csak adminnak engedi a szabály)
export async function feladatLetrehozasa(name, points) {
  await addDoc(collection(db, 'tasks'), {
    name: name.trim(),
    points: Number(points),
    created_at: serverTimestamp(),
  })
}

// Meglévő feladat módosítása
export async function feladatModositasa(taskId, name, points) {
  await updateDoc(doc(db, 'tasks', taskId), {
    name: name.trim(),
    points: Number(points),
  })
}

// Feladat törlése
export async function feladatTorlese(taskId) {
  await deleteDoc(doc(db, 'tasks', taskId))
}

// ------------------------------------------------------------
//  HÁZIMUNKA ELVÉGZÉSE
// ------------------------------------------------------------

// Ez a lényeg: létrehoz egy naplóbejegyzést ÉS növeli a user pontjait.
// A "writeBatch" azt jelenti: a két művelet EGYSZERRE történik meg.
// Vagy mindkettő sikerül, vagy egyik sem – így nem csúszhat el az adat.
export async function hazimunkaElvegzese(user, profile, task) {
  const batch = writeBatch(db)

  // 1) Új napló bejegyzés
  const logRef = doc(collection(db, 'logs'))
  batch.set(logRef, {
    user_id: user.uid,
    username: profile.username, // elmentjük a nevet is, így gyorsabb a listázás
    task_id: task.id,
    task_name: task.name, // a feladat nevét is, ha később törlik a feladatot
    points_earned: Number(task.points),
    timestamp: serverTimestamp(), // a szerver ideje, nem a telefoné
  })

  // 2) A felhasználó pontszámának növelése
  // Az increment() biztonságos: akkor is jól működik, ha ketten
  // egyszerre kattintanak, mert a szerver adja hozzá az értéket.
  const userRef = doc(db, 'users', user.uid)
  batch.update(userRef, {
    total_points: increment(Number(task.points)),
  })

  await batch.commit()
}

// ------------------------------------------------------------
//  RANGLISTA (leaderboard)
// ------------------------------------------------------------

// Minden felhasználó, pontszám szerint csökkenő sorrendben
export function figyeldARanglistat(callback, onError) {
  const q = query(collection(db, 'users'), orderBy('total_points', 'desc'))
  return onSnapshot(
    q,
    (snapshot) => {
      const userek = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      callback(userek)
    },
    onError
  )
}

// ------------------------------------------------------------
//  ELŐZMÉNYEK (logs)
// ------------------------------------------------------------

// Egy felhasználó saját előzményei.
// FIGYELEM: itt szándékosan NINCS orderBy a lekérdezésben!
// Ha where() és orderBy() külön mezőre menne, a Firestore
// "composite index"-et kérne tőled. Így viszont semmit nem kell
// beállítanod – a rendezést egyszerűen JavaScriptben csináljuk meg.
export function figyeldASajatElozmenyeket(userId, callback, onError) {
  const q = query(collection(db, 'logs'), where('user_id', '==', userId))
  return onSnapshot(
    q,
    (snapshot) => {
      const logok = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => idobelyegMasodpercben(b) - idobelyegMasodpercben(a))
      callback(logok)
    },
    onError
  )
}

// Az összes felhasználó legutóbbi tevékenysége (admin panelhez)
export function figyeldAzOsszesElozmenyt(callback, onError, darab = 50) {
  const q = query(
    collection(db, 'logs'),
    orderBy('timestamp', 'desc'),
    limit(darab)
  )
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
    },
    onError
  )
}

// Napló bejegyzés törlése (admin) – a pontot is levonja a usertől
export async function naploTorlese(log) {
  const batch = writeBatch(db)
  batch.delete(doc(db, 'logs', log.id))
  batch.update(doc(db, 'users', log.user_id), {
    total_points: increment(-Number(log.points_earned || 0)),
  })
  await batch.commit()
}

// ------------------------------------------------------------
//  ADMIN MŰVELETEK
// ------------------------------------------------------------

// Pontszám kézi módosítása (pl. +5 vagy -5)
export async function pontokModositasa(userId, valtozas) {
  await updateDoc(doc(db, 'users', userId), {
    total_points: increment(Number(valtozas)),
  })
}

// Szerepkör állítása: 'user' vagy 'admin'
export async function szerepkorBeallitasa(userId, role) {
  await updateDoc(doc(db, 'users', userId), { role })
}

// ------------------------------------------------------------
//  SEGÉDFÜGGVÉNYEK
// ------------------------------------------------------------

// A Firestore Timestamp objektumot alakítja másodperccé (rendezéshez).
// Ha épp most hoztuk létre, a timestamp még lehet null – ilyenkor
// a legfrissebbnek vesszük, hogy a lista tetején jelenjen meg.
function idobelyegMasodpercben(log) {
  return log.timestamp?.seconds ?? Number.MAX_SAFE_INTEGER
}

// Dátum szép magyar formátumban: "júl. 25. 19:05"
export function datumFormazas(timestamp) {
  if (!timestamp?.toDate) return 'most'
  return timestamp.toDate().toLocaleString('hu-HU', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Igaz, ha a napló bejegyzés a mai napon készült
export function maVolt(timestamp) {
  if (!timestamp?.toDate) return true // épp most mentettük
  const d = timestamp.toDate()
  const ma = new Date()
  return (
    d.getDate() === ma.getDate() &&
    d.getMonth() === ma.getMonth() &&
    d.getFullYear() === ma.getFullYear()
  )
}
