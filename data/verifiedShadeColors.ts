/**
 * Digital references taken from brand-controlled shade selectors on 2026-10-15.
 * Maybelline/e.l.f.: CSS hex in each official product shade option.
 * Rare Beauty: median opaque RGB from the center 34% of its own 164px digital
 * swatch images; NOT a physical colorimeter measurement.
 * These values describe a digital reference only; product pigment, skin tone,
 * camera white balance, screen calibration and finish all affect real appearance.
 * Do not call these exact on-skin cosmetic shades or colorimetric measurements.
 */
export type DigitalShadeReference = {hex:string;method:"official-css-swatch"|"sampled-official-swatch-image";source:string;shade:string};
export const verifiedShadeColors:Readonly<Record<string,DigitalShadeReference>> = {
  "may-lifter-01": {
    "hex": "#E5E3E1",
    "method": "official-css-swatch",
    "source": "https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid",
    "shade": "Pearl"
  },
  "may-lifter-02": {
    "hex": "#EEC2BE",
    "method": "official-css-swatch",
    "source": "https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid",
    "shade": "Ice"
  },
  "may-lifter-03": {
    "hex": "#EC918F",
    "method": "official-css-swatch",
    "source": "https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid",
    "shade": "Reef"
  },
  "may-lifter-04": {
    "hex": "#E98386",
    "method": "official-css-swatch",
    "source": "https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid",
    "shade": "Silk"
  },
  "may-lifter-05": {
    "hex": "#D17070",
    "method": "official-css-swatch",
    "source": "https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid",
    "shade": "Moon"
  },
  "may-lifter-06": {
    "hex": "#CB806C",
    "method": "official-css-swatch",
    "source": "https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid",
    "shade": "Stone"
  },
  "may-lifter-07": {
    "hex": "#DD6F7F",
    "method": "official-css-swatch",
    "source": "https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid",
    "shade": "Petal"
  },
  "may-lifter-08": {
    "hex": "#A84B3E",
    "method": "official-css-swatch",
    "source": "https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid",
    "shade": "Topaz"
  },
  "may-lifter-09": {
    "hex": "#DC7C87",
    "method": "official-css-swatch",
    "source": "https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid",
    "shade": "Brass"
  },
  "may-lifter-10": {
    "hex": "#E39A9B",
    "method": "official-css-swatch",
    "source": "https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid",
    "shade": "Opal"
  },
  "may-lifter-11": {
    "hex": "#DD4D62",
    "method": "official-css-swatch",
    "source": "https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid",
    "shade": "Heat"
  },
  "may-lifter-12": {
    "hex": "#FFA9B5",
    "method": "official-css-swatch",
    "source": "https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid",
    "shade": "Gummy Bear"
  },
  "may-lifter-13": {
    "hex": "#FB3B45",
    "method": "official-css-swatch",
    "source": "https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid",
    "shade": "Sweetheart"
  },
  "may-lifter-14": {
    "hex": "#FF2F6E",
    "method": "official-css-swatch",
    "source": "https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid",
    "shade": "Bubblegum"
  },
  "may-lifter-15": {
    "hex": "#D32176",
    "method": "official-css-swatch",
    "source": "https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid",
    "shade": "Taffy"
  },
  "may-lifter-16": {
    "hex": "#FECE65",
    "method": "official-css-swatch",
    "source": "https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid",
    "shade": "Honey"
  },
  "may-lifter-17": {
    "hex": "#8E3011",
    "method": "official-css-swatch",
    "source": "https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid",
    "shade": "Caramel"
  },
  "may-lifter-18": {
    "hex": "#5C0F07",
    "method": "official-css-swatch",
    "source": "https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid",
    "shade": "Maple"
  },
  "may-lifter-19": {
    "hex": "#5E2820",
    "method": "official-css-swatch",
    "source": "https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid",
    "shade": "Toast"
  },
  "may-lifter-20": {
    "hex": "#AC5137",
    "method": "official-css-swatch",
    "source": "https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid",
    "shade": "Toffee"
  },
  "elf-oil-01": {
    "hex": "#EDBEC6",
    "method": "official-css-swatch",
    "source": "https://www.elfcosmetics.com/products/glow-reviver-lip-oil",
    "shade": "Pink Quartz"
  },
  "elf-oil-02": {
    "hex": "#834F42",
    "method": "official-css-swatch",
    "source": "https://www.elfcosmetics.com/products/glow-reviver-lip-oil",
    "shade": "Honey Talks"
  },
  "elf-oil-03": {
    "hex": "#C83841",
    "method": "official-css-swatch",
    "source": "https://www.elfcosmetics.com/products/glow-reviver-lip-oil",
    "shade": "Rose Envy"
  },
  "elf-oil-04": {
    "hex": "#FFC2B5",
    "method": "official-css-swatch",
    "source": "https://www.elfcosmetics.com/products/glow-reviver-lip-oil",
    "shade": "Coral Fixation"
  },
  "elf-oil-05": {
    "hex": "#ED3A5A",
    "method": "official-css-swatch",
    "source": "https://www.elfcosmetics.com/products/glow-reviver-lip-oil",
    "shade": "Red Delicious"
  },
  "elf-oil-06": {
    "hex": "#882B33",
    "method": "official-css-swatch",
    "source": "https://www.elfcosmetics.com/products/glow-reviver-lip-oil",
    "shade": "Jam Session"
  },
  "elf-oil-07": {
    "hex": "#EFEFEF",
    "method": "official-css-swatch",
    "source": "https://www.elfcosmetics.com/products/glow-reviver-lip-oil",
    "shade": "Crystal Clear"
  },
  "elf-oil-08": {
    "hex": "#7B4A4D",
    "method": "official-css-swatch",
    "source": "https://www.elfcosmetics.com/products/glow-reviver-lip-oil",
    "shade": "Money Mauve"
  },
  "elf-oil-09": {
    "hex": "#CC5F5A",
    "method": "official-css-swatch",
    "source": "https://www.elfcosmetics.com/products/glow-reviver-lip-oil",
    "shade": "It's Giving Guava"
  },
  "elf-oil-10": {
    "hex": "#7B4A4D",
    "method": "official-css-swatch",
    "source": "https://www.elfcosmetics.com/products/glow-reviver-lip-oil",
    "shade": "Hot as Fudge"
  },
  "rare-pinch-01": {
    "hex": "#E98D96",
    "method": "sampled-official-swatch-image",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-b-hope.png?v=1727733747&width=164",
    "shade": "Hope"
  },
  "rare-pinch-02": {
    "hex": "#EE958F",
    "method": "sampled-official-swatch-image",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-b-bliss.png?v=1727733524&width=164",
    "shade": "Bliss"
  },
  "rare-pinch-03": {
    "hex": "#EF918E",
    "method": "sampled-official-swatch-image",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-b-adore.png?v=1757613768&width=164",
    "shade": "Adore"
  },
  "rare-pinch-04": {
    "hex": "#F28087",
    "method": "sampled-official-swatch-image",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-b-happy.png?v=1727733783&width=164",
    "shade": "Happy"
  },
  "rare-pinch-05": {
    "hex": "#DA7B72",
    "method": "sampled-official-swatch-image",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-b-worth.png?v=1727733578&width=164",
    "shade": "Worth"
  },
  "rare-pinch-06": {
    "hex": "#E8826A",
    "method": "sampled-official-swatch-image",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-b-virtue.png?v=1727733616&width=164",
    "shade": "Virtue"
  },
  "rare-pinch-07": {
    "hex": "#CA4F2C",
    "method": "sampled-official-swatch-image",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-b-love.png?v=1727733373&width=164",
    "shade": "Love"
  },
  "rare-pinch-08": {
    "hex": "#B85643",
    "method": "sampled-official-swatch-image",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-b-resilience.png?v=1757613768&width=164",
    "shade": "Resilience"
  },
  "rare-pinch-09": {
    "hex": "#FE725A",
    "method": "sampled-official-swatch-image",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-b-joy.png?v=1727733705&width=164",
    "shade": "Joy"
  },
  "rare-pinch-10": {
    "hex": "#F64643",
    "method": "sampled-official-swatch-image",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-b-grateful.png?v=1727733811&width=164",
    "shade": "Grateful"
  },
  "rare-pinch-11": {
    "hex": "#FF528A",
    "method": "sampled-official-swatch-image",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-b-lucky.png?v=1727733657&width=164",
    "shade": "Lucky"
  },
  "rare-pinch-12": {
    "hex": "#B4668B",
    "method": "sampled-official-swatch-image",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-b-spirited.png?v=1748021256&width=164",
    "shade": "Spirited"
  },
  "rare-pinch-13": {
    "hex": "#D56685",
    "method": "sampled-official-swatch-image",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-b-grace.png?v=1727733425&width=164",
    "shade": "Grace"
  },
  "rare-pinch-14": {
    "hex": "#D17A82",
    "method": "sampled-official-swatch-image",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-b-encourage.png?v=1727733844&width=164",
    "shade": "Encourage"
  },
  "rare-pinch-15": {
    "hex": "#BA6871",
    "method": "sampled-official-swatch-image",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-b-believe.png?v=1727733885&width=164",
    "shade": "Believe"
  },
  "rare-pinch-16": {
    "hex": "#8D3556",
    "method": "sampled-official-swatch-image",
    "source": "https://www.rarebeauty.com/cdn/shop/files/swatch-b-faith.png?v=1727733485&width=164",
    "shade": "Faith"
  }
};
