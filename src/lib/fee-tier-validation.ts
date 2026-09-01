export interface FeeTierInput {
  minPrice: number
  maxPrice: number
  feeAmount: number
}

export interface FeeTierOverlapError {
  index: number
  message: string
}

/**
 * Returns overlap errors for tiers within the same fee rule. A tier is
 * invalid if its own min > max, or if its [min, max] range intersects
 * another tier's range (inclusive on both ends).
 */
export function validateFeeTiers(
  tiers: Array<FeeTierInput>,
): Array<FeeTierOverlapError> {
  const errors: Array<FeeTierOverlapError> = []

  tiers.forEach((tier, index) => {
    if (tier.minPrice > tier.maxPrice) {
      errors.push({
        index,
        message: 'Harga min tidak boleh lebih besar dari harga maks',
      })
      return
    }

    for (let otherIndex = 0; otherIndex < tiers.length; otherIndex++) {
      if (otherIndex === index) continue
      const other = tiers[otherIndex]
      const overlaps =
        tier.minPrice <= other.maxPrice && other.minPrice <= tier.maxPrice
      if (overlaps) {
        errors.push({
          index,
          message: `Tumpang tindih dengan tier #${otherIndex + 1}`,
        })
        break
      }
    }
  })

  return errors
}

export function findFeeForPrice(
  tiers: Array<FeeTierInput>,
  price: number,
): number | null {
  const match = tiers.find(
    (tier) => price >= tier.minPrice && price <= tier.maxPrice,
  )
  return match ? match.feeAmount : null
}
