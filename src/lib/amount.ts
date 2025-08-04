import { z } from 'zod'

const MIN_SAFE_AMOUNT = 0
const MAX_SAFE_AMOUNT = Math.trunc(Number.MAX_SAFE_INTEGER / Math.pow(10, 4))

const amountSchema = z.number().int().gte(MIN_SAFE_AMOUNT).lte(MAX_SAFE_AMOUNT)

export class Amount {
  static readonly SUB_UNITS = 2
  static readonly CURRENCY = 'INR'
  static readonly CURRENCY_SYMBOL = '₹'
  static readonly MIN_SAFE_AMOUNT = MIN_SAFE_AMOUNT
  static readonly MAX_SAFE_AMOUNT = MAX_SAFE_AMOUNT
  readonly #value

  /** sub units should be included at the time of instantiation */
  constructor(value: number) {
    this.#value = value
  }

  toNumber() {
    return this.#value / Amount.getMultplier()
  }

  getCurrency() {
    return Amount.CURRENCY
  }

  format() {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: this.getCurrency(),
      minimumFractionDigits: Amount.SUB_UNITS,
    }).format(this.toNumber())
  }

  get value() {
    return this.#value
  }

  static from(value: number): Amount | typeof NaN {
    const result = amountSchema.safeParse(value)
    return result.success ? new Amount(result.data) : NaN
  }

  static getMultplier() {
    return Math.pow(10, Amount.SUB_UNITS)
  }
}
