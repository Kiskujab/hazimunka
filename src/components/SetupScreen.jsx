// Ez a képernyő jelenik meg, ha még nem töltötted ki a
// src/firebase.js fájlt. Így nem kapsz értelmetlen hibaüzenetet.
export default function SetupScreen() {
  return (
    <div className="setup">
      <div style={{ fontSize: 46, marginBottom: 8 }}>🔧</div>
      <h1>Még be kell állítani a Firebase-t</h1>
      <p>
        Az alkalmazás kész, csak a saját Firebase adataidat kell beírni.
        Kövesd ezeket a lépéseket:
      </p>

      <ol>
        <li>
          Menj a <code>console.firebase.google.com</code> oldalra és hozz létre
          egy projektet.
        </li>
        <li>
          A bal oldali menüben: <code>Build → Authentication</code> → kapcsold be
          az <code>Email/Password</code> bejelentkezést.
        </li>
        <li>
          <code>Build → Firestore Database</code> → hozd létre az adatbázist.
        </li>
        <li>
          Fogaskerék ikon → <code>Project settings</code> → görgess le a
          <code>Your apps</code> részhez → Web app (<code>&lt;/&gt;</code> ikon).
        </li>
        <li>
          Másold ki a <code>firebaseConfig</code> objektumot, és illeszd be a
          <code>src/firebase.js</code> fájlba.
        </li>
      </ol>

      <p style={{ marginTop: 20 }}>
        A teljes, képekkel magyarázott leírás a projekt{' '}
        <code>README.md</code> fájljában van.
      </p>
    </div>
  )
}
