interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  className?: string
  required?: boolean
  id?: string
}

// Displays digits with thousands separators and strips any leading zeros as the user types.
export default function NumberInput({
  value,
  onChange,
  placeholder,
  className,
  required,
  id,
}: NumberInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = e.target.value
      .replace(/\D/g, '')
      .replace(/^0+(?=\d)/, '')
    onChange(digitsOnly === '' ? 0 : Number(digitsOnly))
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      required={required}
      value={value === 0 ? '' : value.toLocaleString('id-ID')}
      onChange={handleChange}
      className={className}
    />
  )
}
