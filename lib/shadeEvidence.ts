import type {CatalogProduct} from "./types";

/**
 * Cosmetic color provenance applies to screen-only references.
 * Neither a brand's digital swatch nor a conceptual tint establishes an
 * accurate pigment/finish, camera white balance, or personal skin match.
 */
type ShadePick=Pick<CatalogProduct,"category"|"subcategory"|"name"|"colorHex"|"tags">;
const HEX=/^#[0-9a-f]{6}$/i;
const SOURCE=/^shade-source:https:\/\/[^\s]+$/;

export type ShadeEvidence="brand-digital"|"illustrative"|"none";
export function shadeEvidence(product:ShadePick):ShadeEvidence{
  if(product.category!=="makeup"||!product.colorHex||!HEX.test(product.colorHex))return "none";
  if(product.tags.includes("brand-digital-swatch")&&product.tags.some(tag=>SOURCE.test(tag)))return "brand-digital";
  return "illustrative";
}
export function shadeEvidenceLabel(product:ShadePick):string{
  return shadeEvidence(product)==="brand-digital"?"Brand digital swatch":shadeEvidence(product)==="illustrative"?"Illustrative tint":"No color reference";
}

/** Only the clear formulas verified from official brand shade descriptions.
 * Their digital hex is a UI selector reference, NEVER a pigmentation color.
 */
export function isClearGloss(product:ShadePick):boolean{
  if(product.category!=="makeup"||!["lip","gloss"].includes(product.subcategory))return false;
  const key=product.name.split(" · ").at(-1)?.trim().toLowerCase();
  return (product.name.startsWith("Glow Reviver Lip Oil")&&key==="crystal clear")
    ||(product.name.startsWith("Butter Gloss")&&key==="sugar glass")
    ||(product.name.startsWith("Gloss Bomb Universal Lip Luminizer")&&key==="glass slipper");
}
