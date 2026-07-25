// Egyszerű fejléc: cím + opcionális jobb oldali tartalom (pl. gomb)
export default function Header({ cim, alcim, jobbOldal }) {
  return (
    <header className="header">
      <div>
        <h1>{cim}</h1>
        {alcim && <div className="subtitle">{alcim}</div>}
      </div>
      {jobbOldal}
    </header>
  )
}
