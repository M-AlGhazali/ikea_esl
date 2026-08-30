import { PRODUCTS } from './products.js'

/**
 * A single physical instance of a product in the store. The scene iterates
 * placements; the details panel iterates a product's locations. Both point at
 * the same records, which is what makes one-product-many-labels work.
 *
 * @typedef {Object} Placement
 * @property {string} id           Same as location.id
 * @property {string} productId
 * @property {import('./products.js').Product} product
 * @property {import('./products.js').ProductLocation} location
 * @property {0|1} floor
 * @property {'esl'|'hybrid-sign'} labelType
 */

/** @type {Placement[]} */
export const PLACEMENTS = PRODUCTS.flatMap((product) =>
  product.locations.map((location) => ({
    id: location.id,
    productId: product.id,
    product,
    location,
    floor: location.floor,
    labelType: location.labelType,
  })),
)

const BY_ID = new Map(PLACEMENTS.map((p) => [p.id, p]))

export const getPlacement = (id) => BY_ID.get(id)
export const placementsForProduct = (productId) => PLACEMENTS.filter((p) => p.productId === productId)
export const placementsOnFloor = (floor) => PLACEMENTS.filter((p) => p.floor === floor)
export const placementsInZone = (zoneId) => PLACEMENTS.filter((p) => p.location.zone === zoneId)

/** Products that appear in more than one physical location. */
export const MULTI_LOCATION_PRODUCTS = PRODUCTS.filter((p) => p.locations.length > 1)
