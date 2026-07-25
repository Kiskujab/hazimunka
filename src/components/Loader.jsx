// Töltés közben megjelenő pörgő ikon
export default function Loader({ szoveg = 'Betöltés...' }) {
  return (
    <div className="center-screen">
      <div className="spinner" />
      <p>{szoveg}</p>
    </div>
  )
}
