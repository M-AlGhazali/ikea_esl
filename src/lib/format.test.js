import { describe, expect, it } from 'vitest'
import {
  formatPrice, formatPriceAr, effectivePrice, discountPercent,
  hasDiscount, savingAmount, stockLabel, stockToken, labelTypeLabel,
} from './format.js'

describe('format', () => {
  it('formats whole SAR amounts without decimals', () => {
    expect(formatPrice(249)).toBe('SAR 249')
  })

  it('formats fractional SAR amounts with two decimals', () => {
    expect(formatPrice(24.5)).toBe('SAR 24.50')
  })

  it('groups thousands', () => {
    expect(formatPrice(3450)).toBe('SAR 3,450')
  })

  it('formats an Arabic price string containing the amount', () => {
    expect(formatPriceAr(249)).toContain('249')
  })

  it('prefers the promo price when present', () => {
    expect(effectivePrice({ price: 249, promoPrice: 199 })).toBe(199)
    expect(effectivePrice({ price: 249, promoPrice: null })).toBe(249)
  })

  it('computes discount against the old price, then the list price', () => {
    expect(discountPercent({ price: 249, promoPrice: 199, oldPrice: 299 })).toBe(33)
    expect(discountPercent({ price: 200, promoPrice: 150, oldPrice: null })).toBe(25)
    expect(discountPercent({ price: 200, promoPrice: null, oldPrice: null })).toBe(0)
  })

  it('computes the saving in currency', () => {
    expect(savingAmount({ price: 249, promoPrice: 199, oldPrice: 299 })).toBe(100)
    expect(savingAmount({ price: 200, promoPrice: null, oldPrice: null })).toBe(0)
  })

  it('reports whether anything is discounted', () => {
    expect(hasDiscount({ price: 1, promoPrice: null, oldPrice: null })).toBe(false)
    expect(hasDiscount({ price: 1, promoPrice: null, oldPrice: 2 })).toBe(true)
    expect(hasDiscount({ price: 2, promoPrice: 1, oldPrice: null })).toBe(true)
  })

  it('maps stock status to a label and a colour token', () => {
    expect(stockLabel('in-stock')).toBe('In Stock')
    expect(stockLabel('low-stock')).toBe('Low Stock')
    expect(stockLabel('out-of-stock')).toBe('Out of Stock')
    expect(stockToken('in-stock')).toBe('#0f8a5f')
    expect(stockToken('out-of-stock')).toBe('#d13b3b')
  })

  it('names the two label types', () => {
    expect(labelTypeLabel('esl')).toBe('Shelf-edge ESL')
    expect(labelTypeLabel('hybrid-sign')).toContain('electronic price')
  })
})
