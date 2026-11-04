/**
 * Official Rare Beauty shade-selector PNG pixel samples (Nov 4, 2026).
 * Measured in Vercel build with sharp, without storing or republishing images.
 * Median of 3136 fully-opaque pixels inside the central 34% x 34% square
 * from 164x164 image; all 14 downloads succeeded and MAD<=20.
 *
 * The sample is an sRGB approximation of a WEBSITE IMAGE. It is NOT a
 * physical product measurement, real skin payoff, shade-match guarantee, or
 * evidence of image licensing rights. Keep this separate from old estimates.
 * Reproduce manually via: node scripts/rare-swatch-pixel-audit.cjs
 */
export type RarePixelReference={
 shade:string;
 hex:string;
 source:string;
 method:"sampled-official-swatch-image";
 sample:string;
 width:164;
 height:164;
 centralPixels:3136;
 opaqueFraction:number;
 medianAbsoluteDeviation:readonly [number,number,number];
 downloadBytes:number;
 recordedOn:string;
};
export const RARE_BEAUTY_PIXEL_REFERENCES:Readonly<Record<string,RarePixelReference>>={
  "rare-lip-oil-01": {
    "shade": "Hope",
    "hex": "#E1818A",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-lo-hope.png?v=1679094136&width=164",
    "method": "sampled-official-swatch-image",
    "sample": "opaque pixels in central 34% x 34%; per-channel median",
    "width": 164,
    "height": 164,
    "centralPixels": 3136,
    "opaqueFraction": 1,
    "medianAbsoluteDeviation": [
      2,
      2,
      2
    ],
    "downloadBytes": 33557,
    "recordedOn": "2026-11-04"
  },
  "rare-lip-oil-02": {
    "shade": "Happy",
    "hex": "#E06A78",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-lo-happy.png?v=1679094106&width=164",
    "method": "sampled-official-swatch-image",
    "sample": "opaque pixels in central 34% x 34%; per-channel median",
    "width": 164,
    "height": 164,
    "centralPixels": 3136,
    "opaqueFraction": 1,
    "medianAbsoluteDeviation": [
      2,
      2,
      2
    ],
    "downloadBytes": 33323,
    "recordedOn": "2026-11-04"
  },
  "rare-lip-oil-03": {
    "shade": "Joy",
    "hex": "#D76358",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-lo-joy.png?v=1679094154&width=164",
    "method": "sampled-official-swatch-image",
    "sample": "opaque pixels in central 34% x 34%; per-channel median",
    "width": 164,
    "height": 164,
    "centralPixels": 3136,
    "opaqueFraction": 1,
    "medianAbsoluteDeviation": [
      2,
      2,
      2
    ],
    "downloadBytes": 33403,
    "recordedOn": "2026-11-04"
  },
  "rare-lip-oil-04": {
    "shade": "Wonder",
    "hex": "#C45B6E",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-lo-wonder.png?v=1679094182&width=164",
    "method": "sampled-official-swatch-image",
    "sample": "opaque pixels in central 34% x 34%; per-channel median",
    "width": 164,
    "height": 164,
    "centralPixels": 3136,
    "opaqueFraction": 1,
    "medianAbsoluteDeviation": [
      2,
      2,
      2
    ],
    "downloadBytes": 33235,
    "recordedOn": "2026-11-04"
  },
  "rare-lip-oil-05": {
    "shade": "Serenity",
    "hex": "#BE5047",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-lo-serenity.png?v=1679094168&width=164",
    "method": "sampled-official-swatch-image",
    "sample": "opaque pixels in central 34% x 34%; per-channel median",
    "width": 164,
    "height": 164,
    "centralPixels": 3136,
    "opaqueFraction": 1,
    "medianAbsoluteDeviation": [
      2,
      2,
      2
    ],
    "downloadBytes": 33411,
    "recordedOn": "2026-11-04"
  },
  "rare-lip-oil-06": {
    "shade": "Honesty",
    "hex": "#AB5D47",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-lo-honesty.png?v=1679094119&width=164",
    "method": "sampled-official-swatch-image",
    "sample": "opaque pixels in central 34% x 34%; per-channel median",
    "width": 164,
    "height": 164,
    "centralPixels": 3136,
    "opaqueFraction": 1,
    "medianAbsoluteDeviation": [
      2,
      1,
      2
    ],
    "downloadBytes": 33064,
    "recordedOn": "2026-11-04"
  },
  "rare-lip-oil-07": {
    "shade": "Delight",
    "hex": "#9A4442",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-lo-delight.png?v=1679094090&width=164",
    "method": "sampled-official-swatch-image",
    "sample": "opaque pixels in central 34% x 34%; per-channel median",
    "width": 164,
    "height": 164,
    "centralPixels": 3136,
    "opaqueFraction": 1,
    "medianAbsoluteDeviation": [
      2,
      2,
      1
    ],
    "downloadBytes": 33425,
    "recordedOn": "2026-11-04"
  },
  "rare-lip-oil-08": {
    "shade": "Affection",
    "hex": "#7C2D4C",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-lo-affection.png?v=1679094077&width=164",
    "method": "sampled-official-swatch-image",
    "sample": "opaque pixels in central 34% x 34%; per-channel median",
    "width": 164,
    "height": 164,
    "centralPixels": 3136,
    "opaqueFraction": 1,
    "medianAbsoluteDeviation": [
      2,
      1,
      1
    ],
    "downloadBytes": 33629,
    "recordedOn": "2026-11-04"
  },
  "rare-luminous-01": {
    "shade": "Cheer",
    "hex": "#FFBCC5",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-pb-cheer.png?v=1710550124&width=164",
    "method": "sampled-official-swatch-image",
    "sample": "opaque pixels in central 34% x 34%; per-channel median",
    "width": 164,
    "height": 164,
    "centralPixels": 3136,
    "opaqueFraction": 1,
    "medianAbsoluteDeviation": [
      0,
      9,
      13
    ],
    "downloadBytes": 52620,
    "recordedOn": "2026-11-04"
  },
  "rare-luminous-02": {
    "shade": "Hope",
    "hex": "#FECDDA",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-pb-hope.png?v=1710550124&width=164",
    "method": "sampled-official-swatch-image",
    "sample": "opaque pixels in central 34% x 34%; per-channel median",
    "width": 164,
    "height": 164,
    "centralPixels": 3136,
    "opaqueFraction": 1,
    "medianAbsoluteDeviation": [
      1,
      11,
      12
    ],
    "downloadBytes": 55243,
    "recordedOn": "2026-11-04"
  },
  "rare-luminous-03": {
    "shade": "Happy",
    "hex": "#FEC3D3",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-pb-happy.png?v=1710550124&width=164",
    "method": "sampled-official-swatch-image",
    "sample": "opaque pixels in central 34% x 34%; per-channel median",
    "width": 164,
    "height": 164,
    "centralPixels": 3136,
    "opaqueFraction": 1,
    "medianAbsoluteDeviation": [
      1,
      9,
      9
    ],
    "downloadBytes": 53013,
    "recordedOn": "2026-11-04"
  },
  "rare-luminous-04": {
    "shade": "Joy",
    "hex": "#FCCEB6",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-pb-joy.png?v=1710550124&width=164",
    "method": "sampled-official-swatch-image",
    "sample": "opaque pixels in central 34% x 34%; per-channel median",
    "width": 164,
    "height": 164,
    "centralPixels": 3136,
    "opaqueFraction": 1,
    "medianAbsoluteDeviation": [
      2,
      12,
      16
    ],
    "downloadBytes": 58387,
    "recordedOn": "2026-11-04"
  },
  "rare-luminous-05": {
    "shade": "Love",
    "hex": "#FCA8AD",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-pb-love.png?v=1710550124&width=164",
    "method": "sampled-official-swatch-image",
    "sample": "opaque pixels in central 34% x 34%; per-channel median",
    "width": 164,
    "height": 164,
    "centralPixels": 3136,
    "opaqueFraction": 1,
    "medianAbsoluteDeviation": [
      2,
      12,
      16
    ],
    "downloadBytes": 58606,
    "recordedOn": "2026-11-04"
  },
  "rare-luminous-06": {
    "shade": "Truth",
    "hex": "#EC9FAE",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-pb-truth.png?v=1710550124&width=164",
    "method": "sampled-official-swatch-image",
    "sample": "opaque pixels in central 34% x 34%; per-channel median",
    "width": 164,
    "height": 164,
    "centralPixels": 3136,
    "opaqueFraction": 1,
    "medianAbsoluteDeviation": [
      7,
      11,
      14
    ],
    "downloadBytes": 60087,
    "recordedOn": "2026-11-04"
  }
};
