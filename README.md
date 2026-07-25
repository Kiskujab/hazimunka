# 🧹 Házimunka Pontok (Family Chore Points)

Mobilra tervezett családi házimunka-pontgyűjtő alkalmazás.
Mindenki elvégzi a rá eső feladatokat, pontot kap érte, és van egy közös ranglista.

**Technológia:** React + Vite (frontend) · Firebase Authentication + Firestore (backend) · GitHub Pages (ingyenes tárhely)

---

## 📋 Tartalomjegyzék

1. [Mit tud az app?](#-mit-tud-az-app)
2. [Projekt szerkezete](#-projekt-szerkezete)
3. [1. lépés – Firebase beállítása](#-1-lépés--firebase-beállítása)
4. [2. lépés – Futtatás a saját gépeden](#-2-lépés--futtatás-a-saját-gépeden)
5. [3. lépés – Közzététel GitHub Pages-en](#-3-lépés--közzététel-github-pages-en)
6. [4. lépés – Admin kinevezése](#-4-lépés--admin-kinevezése)
7. [Adatszerkezet](#-adatszerkezet-firestore)
8. [Gyakori hibák](#-gyakori-hibák-és-megoldásuk)

---

## ✨ Mit tud az app?

| Funkció | Leírás |
|---|---|
| 🔐 Regisztráció / bejelentkezés | E-mail + jelszó, Firebase Auth-tal |
| ✅ Feladatok elvégzése | Egy gombnyomás, és jóváíródik a pont |
| 🏆 Ranglista | Minden családtag pontszám szerint rendezve |
| 📜 Előzmények | Ki mikor mit csinált, és mennyi pontot kapott |
| ⚙️ Admin panel | Feladatok kezelése, pontok kézi állítása |
| 🌙 Sötét mód | Automatikusan követi a telefon beállítását |

---

## 📁 Projekt szerkezete

```
hazimunka/
├── .github/workflows/
│   └── deploy.yml           ← automatikus közzététel GitHub Pages-re
├── src/
│   ├── components/          ← újrahasznosítható kis elemek
│   │   ├── BottomNav.jsx    ← alsó menüsáv (4 fül)
│   │   ├── Header.jsx       ← fejléc
│   │   ├── Loader.jsx       ← töltő pörgő
│   │   ├── SetupScreen.jsx  ← beállítási útmutató képernyő
│   │   └── Toast.jsx        ← felugró üzenet ("+10 pont!")
│   ├── context/
│   │   └── AuthContext.jsx  ← bejelentkezés kezelése az egész appban
│   ├── pages/               ← a képernyők
│   │   ├── Admin.jsx        ← admin panel
│   │   ├── Dashboard.jsx    ← főoldal
│   │   ├── Leaderboard.jsx  ← ranglista
│   │   ├── Login.jsx        ← bejelentkezés
│   │   ├── Profile.jsx      ← profil + előzmények
│   │   ├── Register.jsx     ← regisztráció
│   │   └── Tasks.jsx        ← feladatlista
│   ├── services/
│   │   └── db.js            ← MINDEN adatbázis-művelet egy helyen
│   ├── App.jsx              ← az app "központja", ez dönti el mi látszik
│   ├── firebase.js          ← ⚠️ IDE KELL A SAJÁT FIREBASE ADATOD
│   ├── main.jsx             ← belépési pont
│   └── styles.css           ← minden stílus
├── firestore.rules          ← ⚠️ EZT BE KELL MÁSOLNI A FIREBASE-BE
├── index.html
├── package.json
├── vite.config.js
└── README.md                ← ez a fájl
```

---

## 🔥 1. lépés – Firebase beállítása

A Firebase a Google ingyenes szolgáltatása. Ez tárolja a felhasználókat és az adatokat.
**Bankkártya nem kell hozzá**, a családi méret bőven belefér az ingyenes csomagba.

### 1.1 Projekt létrehozása

1. Menj a **https://console.firebase.google.com** oldalra, és jelentkezz be a Google-fiókoddal.
2. Kattints a **„Create a Firebase project"** (vagy „Projekt létrehozása") gombra.
3. Adj neki nevet, pl. `hazimunka-pontok` → **Continue**.
4. A Google Analytics kérdésnél nyugodtan **kapcsold ki** (nincs rá szükség) → **Create project**.
5. Várj kb. fél percet, majd **Continue**.

### 1.2 Bejelentkezés bekapcsolása

1. A bal oldali menüben: **Build → Authentication**.
2. Kattints a **„Get started"** gombra.
3. A **„Sign-in method"** fülön válaszd az **Email/Password** sort.
4. Kapcsold be az első kapcsolót (**Enable**). A második („Email link") maradhat kikapcsolva.
5. **Save**.

### 1.3 Adatbázis létrehozása

1. Bal oldali menü: **Build → Firestore Database**.
2. **Create database**.
3. Régió: válaszd az **`eur3 (europe-west)`** lehetőséget (közelebb van, gyorsabb).
4. Válaszd a **„Start in production mode"** opciót (a szabályokat mindjárt beállítjuk).
5. **Create**.

### 1.4 Biztonsági szabályok beállítása ⚠️ FONTOS!

Enélkül az app nem fog működni (mindenre „permission denied" hibát kapsz).

1. A Firestore Database oldalon válaszd a **„Rules"** fület.
2. Jelöld ki az ott lévő teljes szöveget, és **töröld ki**.
3. Nyisd meg a projekt **`firestore.rules`** fájlját, másold ki a **teljes tartalmát**, és illeszd be.
4. Kattints a **„Publish"** gombra.

> **Miért kell ez?** A `src/firebase.js`-ben lévő adatok bárki számára láthatók (ez normális, a Firebase így működik). A valódi védelmet ezek a szabályok adják: itt dől el, ki mit olvashat és írhat.

### 1.5 A saját Firebase adataid átmásolása

1. Kattints a bal felső **fogaskerék ikonra** → **Project settings**.
2. Görgess le a **„Your apps"** részhez.
3. Kattints a **web ikonra** (`</>`).
4. Adj neki becenevet (pl. `hazimunka-web`). A „Firebase Hosting" pipát **hagyd üresen** → **Register app**.
5. Megjelenik egy kódrészlet, ilyesmi:

   ```js
   const firebaseConfig = {
     apiKey: "AIzaSyB....",
     authDomain: "hazimunka-pontok.firebaseapp.com",
     projectId: "hazimunka-pontok",
     storageBucket: "hazimunka-pontok.firebasestorage.app",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abc123def456"
   };
   ```

6. Nyisd meg a projektben a **`src/firebase.js`** fájlt, és cseréld ki benne a `firebaseConfig` objektumot a sajátodra.

   **Előtte:**
   ```js
   export const firebaseConfig = {
     apiKey: 'IDE_MASOLD_AZ_API_KEY_ET',
     ...
   }
   ```

   **Utána:**
   ```js
   export const firebaseConfig = {
     apiKey: 'AIzaSyB....',
     authDomain: 'hazimunka-pontok.firebaseapp.com',
     projectId: 'hazimunka-pontok',
     storageBucket: 'hazimunka-pontok.firebasestorage.app',
     messagingSenderId: '123456789012',
     appId: '1:123456789012:web:abc123def456',
   }
   ```

   ⚠️ Figyelj rá, hogy megmaradjon az `export const` a sor elején!

### 1.6 Engedélyezett domain hozzáadása (a közzététel után kell)

Ha már fent van az oldal GitHub Pages-en, a Firebase-nek meg kell mondani, hogy onnan is szabad bejelentkezni:

1. **Authentication → Settings → Authorized domains**.
2. **Add domain** → írd be: `kiskujab.github.io`
3. **Add**.

---

## 💻 2. lépés – Futtatás a saját gépeden

Szükséges: **Node.js** (https://nodejs.org – a bal oldali „LTS" verzió).

Nyisd meg a terminált a projekt mappájában, és futtasd:

```bash
npm install
```

Ez letölti a szükséges csomagokat (pár percig tarthat, csak egyszer kell).

Majd indítsd el:

```bash
npm run dev
```

A terminálban megjelenik egy cím (pl. `http://localhost:5173`) – nyisd meg böngészőben.

> 💡 **Tipp:** Chrome-ban `F12` → a bal felső **telefon ikonnal** kipróbálhatod, hogyan néz ki mobilon.

**Első teendők az appban:**
1. Regisztrálj egy fiókot magadnak.
2. Nevezd ki magad adminnak (lásd a [4. lépést](#-4-lépés--admin-kinevezése)).
3. Az admin panelben vegyél fel feladatokat.
4. A családtagok is regisztrálhatnak.

---

## 🚀 3. lépés – Közzététel GitHub Pages-en

Két módszer közül választhatsz. **Az „A" módszert ajánlom** – ott elég egyszer beállítani, utána minden feltöltéskor automatikusan frissül az oldal.

### A) Automatikus (ajánlott)

Ehhez már minden készen áll a projektben (`.github/workflows/deploy.yml`).

**Egyszeri beállítás:**

1. Nyisd meg a GitHub-on a repót: https://github.com/Kiskujab/hazimunka
2. Fent kattints a **Settings** fülre.
3. Bal oldali menü: **Pages**.
4. A **„Source"** legördülőnél válaszd: **GitHub Actions**.
5. Kész! Nincs mit menteni, magától eltárolja.

**Ezután minden alkalommal, amikor módosítasz valamit:**

```bash
git add .
git commit -m "Változtatás leírása"
git push
```

A GitHub magától lefordítja és közzéteszi. A folyamatot az **Actions** fülön követheted (a sárga pötty = fut, a zöld pipa = kész, kb. 1 perc).

**Az oldalad címe:** https://kiskujab.github.io/hazimunka/

### B) Kézi (ha az A nem működne)

```bash
npm run deploy
```

Ez lefordítja az oldalt, és feltölti egy `gh-pages` nevű ágra.

Utána **egyszer** be kell állítani: **Settings → Pages → Source: „Deploy from a branch"** → ág: **`gh-pages`**, mappa: **`/ (root)`** → **Save**.

> ⚠️ A két módszert **ne keverd** – válassz egyet.

### Miért működik GitHub Pages-en?

A GitHub Pages egy almappában szolgálja ki az oldalt (`/hazimunka/`), nem a gyökérben. Ezért:

- a `vite.config.js`-ben `base: './'` van beállítva → minden útvonal **relatív** lesz,
- az app **nem használ URL-alapú útvonalválasztást** (a fülek sima React state-tel váltanak) → nincs „404 oldalfrissítéskor" probléma.

---

## 👑 4. lépés – Admin kinevezése

Az admin jog **nem jelszó alapú**, hanem a Firestore-ban tárolt `role` mező dönti el.
Az **első** admint kézzel kell beállítani a Firebase Console-ban.

1. Regisztrálj az appban (vagy hagyd, hogy a családtag regisztráljon).
2. Menj a **Firebase Console → Build → Firestore Database → Data** fülre.
3. Kattints bal oldalon a **`users`** gyűjteményre.
4. Megjelenik a felhasználók listája hosszú azonosítókkal. Kattints végig rajtuk, amíg megtalálod a jó `username` / `email` mezőt.
5. Kattints a **`role`** mező melletti **ceruza ikonra** ✏️.
6. Írd át `user`-ről **`admin`**-ra (kisbetűvel!).
7. **Update**.
8. Az appban frissítsd az oldalt – megjelenik a **Profil** fülön az „⚙️ Admin panel" gomb.

> 💡 Ha megvan az első admin, onnantól **az appból is** kinevezhetsz további adminokat:
> **Profil → Admin panel → Tagok → „Adminná tétel"**.

---

## 🗄️ Adatszerkezet (Firestore)

Nem kell kézzel létrehoznod ezeket – az app automatikusan elkészíti őket.

### `users` – felhasználók

| Mező | Típus | Példa |
|---|---|---|
| `username` | szöveg | `"Anna"` |
| `email` | szöveg | `"anna@pelda.hu"` |
| `total_points` | szám | `245` |
| `role` | szöveg | `"user"` vagy `"admin"` |
| `created_at` | időbélyeg | *automatikus* |

> A dokumentum azonosítója = a Firebase Auth `uid`-ja.

### `tasks` – feladatok

| Mező | Típus | Példa |
|---|---|---|
| `name` | szöveg | `"Mosogatás"` |
| `points` | szám | `10` |
| `created_at` | időbélyeg | *automatikus* |

### `logs` – elvégzett házimunkák

| Mező | Típus | Példa |
|---|---|---|
| `user_id` | szöveg | a felhasználó `uid`-ja |
| `username` | szöveg | `"Anna"` |
| `task_id` | szöveg | a feladat azonosítója |
| `task_name` | szöveg | `"Mosogatás"` |
| `points_earned` | szám | `10` |
| `timestamp` | időbélyeg | *automatikus* |

> **Miért van benne a `username` és a `task_name` is?** Így a listák megjelenítéséhez nem kell külön lekérdezni a felhasználót és a feladatot – gyorsabb és kevesebb Firestore-olvasás. Ráadásul ha később törlöd a feladatot, az előzményekben akkor is látszik a neve.

### Hogyan nőnek a pontok?

Amikor valaki a „Kész!" gombra nyom, **egyszerre két dolog** történik (`writeBatch`):

1. új bejegyzés a `logs` gyűjteménybe,
2. a felhasználó `total_points` mezője megnő az `increment()` függvénnyel.

Vagy mindkettő sikerül, vagy egyik sem – így az adatok soha nem csúsznak el egymáshoz képest.

---

## 🐛 Gyakori hibák és megoldásuk

<details>
<summary><b>„Missing or insufficient permissions" / „permission-denied"</b></summary>

Nem másoltad be a `firestore.rules` tartalmát a Firebase-be, vagy elfelejtetted a **Publish** gombot.
→ Lásd az [1.4-es lépést](#14-biztonsági-szabályok-beállítása--fontos).
</details>

<details>
<summary><b>„auth/operation-not-allowed"</b></summary>

Nincs bekapcsolva az e-mail/jelszavas bejelentkezés.
→ **Authentication → Sign-in method → Email/Password → Enable**.
</details>

<details>
<summary><b>„auth/unauthorized-domain" a közzététel után</b></summary>

A `kiskujab.github.io` domain nincs engedélyezve.
→ **Authentication → Settings → Authorized domains → Add domain**.
</details>

<details>
<summary><b>Üres fehér oldal a GitHub Pages-en</b></summary>

1. Nyomj `F12`-t, és nézd meg a **Console** fület – ott látszik a valódi hiba.
2. Ellenőrizd, hogy a `vite.config.js`-ben tényleg `base: './'` szerepel.
3. Nézd meg az **Actions** fülön, hogy a közzététel zöld pipával végződött-e.
</details>

<details>
<summary><b>Nem látom az Admin panel gombot</b></summary>

A `role` mező nincs `admin`-ra állítva, vagy elgépelted (nagybetű, szóköz).
→ Kisbetűs `admin` kell. Utána frissítsd az oldalt.
</details>

<details>
<summary><b>„npm: command not found"</b></summary>

Nincs telepítve a Node.js. → https://nodejs.org (LTS verzió), majd indítsd újra a terminált.
</details>

---

## 🔒 Amit érdemes tudni a biztonságról

- A `src/firebase.js`-ben lévő adatok **szándékosan publikusak** – minden Firebase-es weboldalon láthatók. Nem kell titkolni őket.
- A szabályok (`firestore.rules`) megakadályozzák, hogy:
  - bárki adminná tegye magát,
  - más nevében írjon be elvégzett munkát,
  - be nem jelentkezett ember bármit is lásson.
- **Őszinte korlát:** egy technikailag hozzáértő családtag a böngésző konzoljából elvileg át tudná írni a *saját* pontszámát. Ennek teljes kizárásához Cloud Functions kellene, ami fizetős (Blaze) csomagot igényel. Családi használatra ez bőven elég – ráadásul az admin a naplóban látja, ha valami nem stimmel.

---

## 📜 Hasznos parancsok

| Parancs | Mit csinál |
|---|---|
| `npm install` | csomagok telepítése (első alkalommal) |
| `npm run dev` | fejlesztői szerver indítása |
| `npm run build` | oldal lefordítása a `dist/` mappába |
| `npm run preview` | a lefordított oldal kipróbálása helyben |
| `npm run deploy` | kézi közzététel GitHub Pages-re (B módszer) |

---

Készült ❤️-tel a családnak.
