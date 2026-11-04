/**
 * Official SHADE DESCRIPTIONS, not an official color measurement.
 *
 * The shade names and plain-English hue families below were checked against
 * product pages on Nov 4, 2026. The RGBs are PALEVIE-edited estimates chosen
 * to visually illustrate those words, NEVER sampled/scraped manufacturer RGB.
 *
 * Rare Beauty official swatch asset URLs are catalogued for later image/color
 * calibration; the URLs have NOT been numerically sampled. Do not elevate
 * these records to 'brand-digital-swatch' or assert physical color accuracy.
 */
export type BrandDescribedHue={
  shade:string;
  description:string;
  illustrativeHex:string;
  source:string;
  officialSwatchAsset?:string;
};
export const BRAND_DESCRIBED_HUES:Readonly<Record<string,BrandDescribedHue>>={
  "rare-lip-oil-01": {
    "shade": "Hope",
    "description": "nude mauve",
    "illustrativeHex": "#B98297",
    "source": "https://www.rarebeauty.com/products/soft-pinch-tinted-lip-oil",
    "officialSwatchAsset": "https://www.rarebeauty.com/cdn/shop/files/swatch-lo-hope.png?v=1679094136&width=164"
  },
  "rare-lip-oil-02": {
    "shade": "Happy",
    "description": "cool pink",
    "illustrativeHex": "#D878A4",
    "source": "https://www.rarebeauty.com/products/soft-pinch-tinted-lip-oil",
    "officialSwatchAsset": "https://www.rarebeauty.com/cdn/shop/files/swatch-lo-happy.png?v=1679094106&width=164"
  },
  "rare-lip-oil-03": {
    "shade": "Joy",
    "description": "muted peach",
    "illustrativeHex": "#DD8B70",
    "source": "https://www.rarebeauty.com/products/soft-pinch-tinted-lip-oil",
    "officialSwatchAsset": "https://www.rarebeauty.com/cdn/shop/files/swatch-lo-joy.png?v=1679094154&width=164"
  },
  "rare-lip-oil-04": {
    "shade": "Wonder",
    "description": "rose mauve",
    "illustrativeHex": "#AE6A88",
    "source": "https://www.rarebeauty.com/products/soft-pinch-tinted-lip-oil",
    "officialSwatchAsset": "https://www.rarebeauty.com/cdn/shop/files/swatch-lo-wonder.png?v=1679094182&width=164"
  },
  "rare-lip-oil-05": {
    "shade": "Serenity",
    "description": "warm rose",
    "illustrativeHex": "#B96B6F",
    "source": "https://www.rarebeauty.com/products/soft-pinch-tinted-lip-oil",
    "officialSwatchAsset": "https://www.rarebeauty.com/cdn/shop/files/swatch-lo-serenity.png?v=1679094168&width=164"
  },
  "rare-lip-oil-06": {
    "shade": "Honesty",
    "description": "nude brown",
    "illustrativeHex": "#916C64",
    "source": "https://www.rarebeauty.com/products/soft-pinch-tinted-lip-oil",
    "officialSwatchAsset": "https://www.rarebeauty.com/cdn/shop/files/swatch-lo-honesty.png?v=1679094119&width=164"
  },
  "rare-lip-oil-07": {
    "shade": "Delight",
    "description": "rose brown",
    "illustrativeHex": "#995B5C",
    "source": "https://www.rarebeauty.com/products/soft-pinch-tinted-lip-oil",
    "officialSwatchAsset": "https://www.rarebeauty.com/cdn/shop/files/swatch-lo-delight.png?v=1679094090&width=164"
  },
  "rare-lip-oil-08": {
    "shade": "Affection",
    "description": "muted berry",
    "illustrativeHex": "#955273",
    "source": "https://www.rarebeauty.com/products/soft-pinch-tinted-lip-oil",
    "officialSwatchAsset": "https://www.rarebeauty.com/cdn/shop/files/swatch-lo-affection.png?v=1679094077&width=164"
  },
  "rare-luminous-01": {
    "shade": "Cheer",
    "description": "light warm pink",
    "illustrativeHex": "#EBA6A1",
    "source": "https://www.rarebeauty.com/products/soft-pinch-luminous-powder-blush",
    "officialSwatchAsset": "https://www.rarebeauty.com/cdn/shop/files/swatch-pb-cheer.png?v=1710550124&width=64"
  },
  "rare-luminous-02": {
    "shade": "Hope",
    "description": "nude mauve",
    "illustrativeHex": "#B9879B",
    "source": "https://www.rarebeauty.com/products/soft-pinch-luminous-powder-blush",
    "officialSwatchAsset": "https://www.rarebeauty.com/cdn/shop/files/swatch-pb-hope.png?v=1710550124&width=64"
  },
  "rare-luminous-03": {
    "shade": "Happy",
    "description": "cool pink",
    "illustrativeHex": "#D881AB",
    "source": "https://www.rarebeauty.com/products/soft-pinch-luminous-powder-blush",
    "officialSwatchAsset": "https://www.rarebeauty.com/cdn/shop/files/swatch-pb-happy.png?v=1710550124&width=64"
  },
  "rare-luminous-04": {
    "shade": "Joy",
    "description": "muted peach",
    "illustrativeHex": "#D88C71",
    "source": "https://www.rarebeauty.com/products/soft-pinch-luminous-powder-blush",
    "officialSwatchAsset": "https://www.rarebeauty.com/cdn/shop/files/swatch-pb-joy.png?v=1710550124&width=64"
  },
  "rare-luminous-05": {
    "shade": "Love",
    "description": "terracotta",
    "illustrativeHex": "#B66C4D",
    "source": "https://www.rarebeauty.com/products/soft-pinch-luminous-powder-blush",
    "officialSwatchAsset": "https://www.rarebeauty.com/cdn/shop/files/swatch-pb-love.png?v=1710550124&width=64"
  },
  "rare-luminous-06": {
    "shade": "Truth",
    "description": "mauve maroon",
    "illustrativeHex": "#854460",
    "source": "https://www.rarebeauty.com/products/soft-pinch-luminous-powder-blush",
    "officialSwatchAsset": "https://www.rarebeauty.com/cdn/shop/files/swatch-pb-truth.png?v=1710550124&width=64"
  },
  "glossier-cloud-shade-01": {
    "shade": "Puff",
    "description": "light pink",
    "illustrativeHex": "#E7A7BF",
    "source": "https://www.glossier.com/products/cloud-paint"
  },
  "glossier-cloud-shade-05": {
    "shade": "Storm",
    "description": "warm rose",
    "illustrativeHex": "#A56772",
    "source": "https://www.glossier.com/products/cloud-paint"
  },
  "glossier-cloud-shade-06": {
    "shade": "Eve",
    "description": "rich mulberry",
    "illustrativeHex": "#6F475A",
    "source": "https://www.glossier.com/products/cloud-paint"
  },
  "glossier-cloud-shade-07": {
    "shade": "Dawn",
    "description": "sunny coral",
    "illustrativeHex": "#E58D67",
    "source": "https://www.glossier.com/products/cloud-paint"
  },
  "glossier-cloud-shade-10": {
    "shade": "Wisp",
    "description": "soft lilac",
    "illustrativeHex": "#B6A0D5",
    "source": "https://www.glossier.com/products/cloud-paint"
  },
  "merit-flush-shade-03": {
    "shade": "Archival",
    "description": "cool mauve",
    "illustrativeHex": "#A57596",
    "source": "https://www.meritbeauty.com/pages/flush-balm"
  },
  "merit-flush-shade-05": {
    "shade": "Le Bonbon",
    "description": "bright pink",
    "illustrativeHex": "#D96192",
    "source": "https://www.meritbeauty.com/pages/flush-balm"
  },
  "merit-flush-shade-08": {
    "shade": "Postmodern",
    "description": "deep pink brown",
    "illustrativeHex": "#935968",
    "source": "https://www.meritbeauty.com/pages/flush-balm"
  },
  "merit-flush-shade-10": {
    "shade": "Lusitano",
    "description": "soft peach",
    "illustrativeHex": "#DE9A83",
    "source": "https://www.meritbeauty.com/pages/flush-balm"
  }
};
