import { AREA_GROUPS } from '@/data/areas'

export default function AreaSelect({
  id,
  value,
  onChange,
  placeholder = 'Select area / tehsil',
  required,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)} required={required}>
      <option value="">{placeholder}</option>
      {AREA_GROUPS.map((g) => (
        <optgroup key={g.label} label={g.label}>
          {g.areas.map((a) => (
            <option key={a.name} value={a.name}>{a.name}</option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}
