// ============================================================
//  FIREBASE BEÁLLÍTÁS
// ============================================================
//  ITT KELL KICSERÉLNED AZ ADATOKAT!
//
//  Honnan szerzed meg? (részletes leírás a README.md-ben)
//  1. https://console.firebase.google.com -> projekt kiválasztása
//  2. Fogaskerék ikon (bal felül) -> "Project settings"
//  3. Görgess le a "Your apps" részhez -> Web app (</> ikon)
//  4. Ott látod a "firebaseConfig" objektumot -> másold ide.
//
//  FONTOS: ezek az adatok NEM titkosak! A Firebase szándékosan
//  publikusnak tervezte őket (minden weboldal forráskódjában
//  látszanak). A valódi védelmet a Firestore szabályok adják,
//  amiket a firestore.rules fájlban találsz.
// ============================================================

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

export const firebaseConfig = {
  apiKey: 'AIzaSyD-vHGz5lWhWE1JbgHaZH9TCIMftJJviL0',
  authDomain: 'hazimunka-app-94fec.firebaseapp.com',
  projectId: 'hazimunka-app-94fec',
  storageBucket: 'hazimunka-app-94fec.firebasestorage.app',
  messagingSenderId: '586384206209',
  appId: '1:586384206209:web:76ccf08ca1696288532080',
}

// Megnézzük, hogy kicserélted-e már a fenti adatokat.
// Ha még nem, az app egy segítő képernyőt mutat hibaüzenet helyett.
export const isFirebaseConfigured =
  !firebaseConfig.apiKey.startsWith('IDE_MASOLD')

// Firebase elindítása
const app = initializeApp(firebaseConfig)

// Ezt a kettőt használjuk az egész appban:
export const auth = getAuth(app) // bejelentkezés / regisztráció
export const db = getFirestore(app) // adatbázis
