import type {CatalogProduct} from "./types";

/** On-device cosmetic preview surfaces actually implemented by VirtualMakeupTryOn.
 * Do not display face-makeup Try On on skincare, clothing, or missing color data.
 * All results are illustrative; a screen RGB is not a measured cosmetic finish.
 */
export type MakeupTryOnArea="lip"|"blush"|"eyeshadow"|"highlighter"|"cushion";
const HEX=/^#[0-9a-f]{6}$/i;
export function makeupTryOnArea(product:Pick<CatalogProduct,"category"|"subcategory"|"colorHex">):MakeupTryOnArea|null{
  if(product.category!=="makeup"||!product.colorHex||!HEX.test(product.colorHex))return null;
  if(product.subcategory==="lip"||product.subcategory==="gloss")return "lip";
  if(product.subcategory==="blush")return "blush";
  if(product.subcategory==="eyeshadow")return "eyeshadow";
  if(product.subcategory==="highlighter")return "highlighter";
  if(product.subcategory==="cushion")return "cushion";
  return null;
}
