interface Props {
  value: string
  onChange: (v: string) => void
  size?: 'sm' | 'md'
}

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function BloodGroupSelector({ value, onChange, size = 'md' }: Props) {
  const isSm = size === 'sm'
  return (
    <div className={`grid grid-cols-4 ${isSm ? 'gap-2' : 'gap-2.5'}`}>
      {GROUPS.map((g) => {
        const selected = value === g
        return (
          <button
            key={g}
            type="button"
            onClick={() => onChange(g)}
            className={`
              ${isSm ? 'py-2.5 text-sm' : 'py-3.5 text-base'}
              rounded-[10px] font-bold transition-all duration-150 select-none
              ${selected
                ? 'bg-[#C1121F] text-white shadow-md scale-[1.03]'
                : 'bg-white text-[#171717] border border-[#E8E8E8] hover:bg-[#FDE8EA] hover:border-[#F0D9DC]'
              }
            `}
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: selected
                ? '0 4px 14px rgba(193,18,31,0.25)'
                : '3px 3px 8px rgba(193,18,31,0.05), -3px -3px 8px rgba(255,255,255,0.9)',
            }}
          >
            {g}
          </button>
        )
      })}
    </div>
  )
}
