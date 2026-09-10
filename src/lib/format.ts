/**
 * Format nomor HP Indonesia jadi kelompok 4 digit untuk tampilan,
 * misal "085397356608" -> "0853-9735-6608" dan
 * "0812345678901" -> "0812-3456-78901" (sisa digit terakhir digabung
 * ke kelompok sebelumnya, bukan jadi kelompok kecil sendiri).
 */
export function formatPhoneNumber(phone: string | null | undefined) {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length <= 4) return digits

  const groups: Array<string> = []
  let i = 0
  while (i < digits.length) {
    const remaining = digits.length - i
    if (remaining < 8) {
      groups.push(digits.slice(i))
      break
    }
    groups.push(digits.slice(i, i + 4))
    i += 4
  }
  return groups.join('-')
}