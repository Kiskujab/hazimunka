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
  apiKey: 'IDE_MASOLD_AZ_API_KEY_ET',
  authDomain: 'IDE_MASOLD_AZ_AUTH_DOMAIN_T',
  projectId: 'IDE_MASOLD_A_PROJECT_ID_T',
  storageBucket: 'IDE_MASOLD_A_STORAGE_BUCKET_OT',
  messagingSenderId: 'IDE_MASOLD_A_SENDER_ID_T',
  appId: 'IDE_MASOLD_AZ_APP_ID_OT',
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
