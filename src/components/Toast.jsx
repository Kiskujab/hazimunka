import { useEffect } from 'react'

// Kis felugró üzenet a képernyő alján (pl. "+10 pont!").
// 2,5 másodperc után magától eltűnik.
export default function Toast({ uzenet, tipus = 'success', bezaras }) {
  useEffect(() => {
    if (!uzenet) return
    const ido = setTimeout(bezaras, 2500)
    return () => clearTimeout(ido)
  }, [uzenet, bezaras])

  if (!uzenet) return null

  return (
    <div className={`toast ${tipus}`} role="status">
      {uzenet}
    </div>
  )
}
