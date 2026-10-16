/**
 * Explicitly labelled direct Amazon alternatives for catalog items whose *exact*
 * US variant ASIN is not confirmed. These are DIFFERENT products/shades.
 *
 * A value references an independently configured direct-detail destination
 * already present in our own catalog. The original item must retain its own
 * shade-search offer; never pass these off as exact product matches.
 *
 * These are discovery options, not claims about current price, stock, seller
 * authorization, medical equivalence, or color/texture interchangeability.
 */
export const amazonAlternativeProductIds: Readonly<Record<string, string>> = {
  // Legacy or currently unverified K-beauty product identities.
  "ppr-ink-33": "ppr-ink-17", // Pure Peach (legacy) -> Peripera Rosy Nude (different shade).
  "rmd-cheek-peach": "mln-baked-lum", // rom&nd Peach Whip -> Milani Luminoso powder blush.
  "ppr-sun-rose": "mln-baked-lum", // Peripera Milky Peach -> Milani Luminoso powder blush.
  "clio-pro-01": "clio-pro-02", // CLIO Simply Pink -> CLIO Brown Choux.
  "etude-wine": "rmd-btp-fog", // Etude Wine Party -> rom&nd Dusty Fog Garden.
  "ppr-mood-02": "clio-pro-02", // Peripera mood palette -> CLIO Brown Choux.
  "boj-sun": "sk-round-sun", // Beauty of Joseon Relief Sun -> ROUND LAB Birch Juice SPF.
  "sk-mediheal-bp": "sk-cosrx-patch", // Unverified Mediheal spot treatment -> COSRX acne patches.
  "mk-thesaem-stick": "tirtir-21n", // Concealer stick -> TIRTIR cushion, different format.

  // Same product line, clearly DIFFERENT color/variant.
  "rare-pinch-03": "rare-pinch-02", // Adore -> Bliss
  "rare-pinch-05": "rare-pinch-01", // Worth -> Hope
  "rare-pinch-08": "rare-pinch-15", // Resilience -> Believe
  "rare-pinch-11": "rare-pinch-13", // Lucky -> Grace
  "rare-pinch-12": "rare-pinch-10", // Spirited -> Grateful
  "rare-pinch-16": "rare-pinch-15", // Faith -> Believe

  "elf-bite-01": "elf-bite-06", // Orange Dreamsicle -> Pumpkin Pie
  "elf-bite-11": "elf-bite-04", // Take Your Pink -> Rose Water
  "elf-bite-12": "elf-bite-09", // Total Smokeshow -> Truffles
  "elf-bite-13": "elf-bite-09", // Cold Brew -> Truffles

  "cp-shock-05": "cp-shock-04", // Bae -> Frog
  "cp-shock-06": "cp-shock-04", // Moonwalk -> Frog
  "cp-shock-07": "cp-shock-08", // So Quiche -> Ritz
  "cp-shock-09": "cp-shock-08", // Ladybird -> Ritz

  "nyx-ultimate-02": "nyx-ultimate-05", // Cool Neutrals -> Utopia (NOT cool-specific).
  "nyx-ultimate-03": "nyx-ultimate-05", // Smokey & Highlight -> Utopia.
  "nyx-ultimate-04": "nyx-ultimate-06", // Phoenix -> Ultimate Queen.

  "rare-bouncy-03": "rare-bouncy-07", // Spirited -> Grateful
  "rare-bouncy-04": "rare-bouncy-02", // Divine -> Happy
  "rare-bouncy-06": "rare-bouncy-05", // Alive -> Worth
  "rare-bouncy-08": "rare-bouncy-09", // Thriving -> Truth
  "rare-bouncy-10": "rare-bouncy-09", // Soulful -> Truth
};
