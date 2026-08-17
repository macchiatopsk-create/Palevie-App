/**
 * Editorial detail for each of the 16 tones — the copy and named swatches the
 * result screen shows. Kept separate from `palettes.ts` so the scoring data
 * stays lean and this stays easy to rewrite.
 */

export type NamedColor = { hex: string; name: string };
export type ToneDetail = {
  traits: [string, string, string];
  blurb: string;
  best: NamedColor[];
  avoid: NamedColor[];
  makeup: string;
};

export const toneDetails: Record<string, ToneDetail> = {
  "spring-light": {
    traits: ["Warm", "Light", "Fresh"],
    blurb: "Light Spring is a warm, light season with a fresh, delicate brightness. You have warm undertones and shine in clear, light, airy colors that bring a natural radiance to your complexion. Avoid dark, heavy, or cool-muted shades that can overwhelm your fresh, luminous look.",
    best: [
      { hex: "#F6D6B8", name: "Peach" },
      { hex: "#FFD7A8", name: "Apricot" },
      { hex: "#F8E4A7", name: "Butter Yellow" },
      { hex: "#F7B7A3", name: "Light Coral" },
      { hex: "#A8D7D4", name: "Mint" },
    ],
    avoid: [
      { hex: "#111111", name: "Black" },
      { hex: "#3F4045", name: "Charcoal" },
      { hex: "#5B1030", name: "Deep Burgundy" },
      { hex: "#C9CBD3", name: "Icy Gray" },
      { hex: "#4A2F45", name: "Dark Plum" },
    ],
    makeup: "Fresh, luminous and light is key. Choose peachy blush, coral or warm pink lips, champagne shimmer, and light brown liner for a soft, bright, radiant finish.",
  },
  "spring-warm": {
    traits: ["Warm", "Golden", "Clear"],
    blurb: "Warm Spring is sunlit and golden. Your coloring comes alive in warm, clear shades with a honeyed glow — think garden colors in full daylight. Cool, dusty or icy shades tend to flatten your natural warmth.",
    best: [
      { hex: "#F2A65A", name: "Golden Apricot" },
      { hex: "#F28C6F", name: "Warm Coral" },
      { hex: "#F5C15C", name: "Honey" },
      { hex: "#91B85B", name: "Leaf Green" },
      { hex: "#45A9A2", name: "Turquoise" },
    ],
    avoid: [
      { hex: "#7D6C84", name: "Dusty Plum" },
      { hex: "#A3A7B2", name: "Cool Gray" },
      { hex: "#5C4A66", name: "Muted Violet" },
      { hex: "#1B1B22", name: "Jet Black" },
      { hex: "#C9D6E6", name: "Icy Blue" },
    ],
    makeup: "Golden and glowing is key. Choose peach-coral blush, warm nude or coral lips, bronze and gold shimmer, and warm brown liner for a sunlit finish.",
  },
  "spring-bright": {
    traits: ["Warm", "Bright", "Clear"],
    blurb: "Bright Spring runs on warm, high-energy color. Clear, saturated shades read as intentional on you, while anything dusty or greyed-off makes your features look tired. Contrast is your friend — muddiness is not.",
    best: [
      { hex: "#FF6B5E", name: "Poppy" },
      { hex: "#FFB000", name: "Marigold" },
      { hex: "#F7DC2F", name: "Sun Yellow" },
      { hex: "#50C878", name: "Emerald Green" },
      { hex: "#FF4F91", name: "Hot Pink" },
    ],
    avoid: [
      { hex: "#7B6E68", name: "Mushroom" },
      { hex: "#A89C91", name: "Dusty Taupe" },
      { hex: "#4A4A49", name: "Slate Gray" },
      { hex: "#6E6A55", name: "Olive Drab" },
      { hex: "#8C7F86", name: "Faded Mauve" },
    ],
    makeup: "Clear and vivid is key. Choose bright coral or warm pink blush, saturated lips, crisp shimmer, and defined lashes for a fresh, high-clarity finish.",
  },
  "spring-vivid": {
    traits: ["Neutral", "Vivid", "Crisp"],
    blurb: "Vivid Spring sits right at the top of the saturation scale. Pure, undiluted color suits you — the brighter and cleaner the shade, the more your features sharpen. Softened, sandy or greyed tones do the opposite.",
    best: [
      { hex: "#FF3E4D", name: "Cherry Red" },
      { hex: "#FF8C00", name: "Tangerine" },
      { hex: "#FFD000", name: "Golden Yellow" },
      { hex: "#1FBF75", name: "Jade" },
      { hex: "#00A1C7", name: "Azure" },
    ],
    avoid: [
      { hex: "#8F8177", name: "Stone" },
      { hex: "#A69D91", name: "Sand Taupe" },
      { hex: "#665F5A", name: "Ash Brown" },
      { hex: "#9E9A8C", name: "Sage Gray" },
      { hex: "#7A6E6A", name: "Dusty Cocoa" },
    ],
    makeup: "Clean and defined is key. Choose vivid pink or coral blush, glossy saturated lips, sharp liner, and clear shimmer for a polished, high-impact finish.",
  },
  "summer-light": {
    traits: ["Cool", "Light", "Airy"],
    blurb: "Light Summer is cool, delicate and softly luminous. Pale, powdery shades with a blue base keep your skin looking smooth and even. Heavy darks and warm earth tones overpower your naturally low contrast.",
    best: [
      { hex: "#E7C7D7", name: "Powder Pink" },
      { hex: "#C9D9EE", name: "Baby Blue" },
      { hex: "#BFD9D2", name: "Sea Glass" },
      { hex: "#D8CFE8", name: "Lilac" },
      { hex: "#F0D6D2", name: "Rose Quartz" },
    ],
    avoid: [
      { hex: "#241A18", name: "Espresso" },
      { hex: "#7C3A23", name: "Rust" },
      { hex: "#735600", name: "Mustard" },
      { hex: "#0B0B0B", name: "Sharp Black" },
      { hex: "#C25A18", name: "Burnt Orange" },
    ],
    makeup: "Soft and cool is key. Choose rosy pink blush, sheer berry or pink lips, cool taupe shadow, and soft brown liner for a delicate, fresh finish.",
  },
  "summer-cool": {
    traits: ["Cool", "Blue-based", "Refined"],
    blurb: "Cool Summer is blue-based and composed. Shades with a clear cool cast — rose, periwinkle, sea blue — look calm and deliberate on you. Warm oranges and golden browns fight your undertone and pull your skin sallow.",
    best: [
      { hex: "#B36B8C", name: "Rose Pink" },
      { hex: "#7189B8", name: "Periwinkle" },
      { hex: "#6FA8A8", name: "Sea Blue" },
      { hex: "#9381B5", name: "Soft Violet" },
      { hex: "#C1879C", name: "Dusty Rose" },
    ],
    avoid: [
      { hex: "#D3762A", name: "Pumpkin" },
      { hex: "#C49A32", name: "Golden Ochre" },
      { hex: "#84512D", name: "Warm Chestnut" },
      { hex: "#E8622A", name: "Bright Orange" },
      { hex: "#B7A15A", name: "Olive Gold" },
    ],
    makeup: "Cool and clean is key. Choose rosy blush, berry or mauve-pink lips, soft grey-taupe shadow, and cool brown liner for a refined finish.",
  },
  "summer-soft": {
    traits: ["Cool", "Muted", "Soft"],
    blurb: "Soft Summer suits cool, muted and gentle shades that look naturally harmonious on you. Choose soft pastels, smoky tones and dusty hues — and avoid bright, warm or high-contrast colors that can overpower your calm beauty.",
    best: [
      { hex: "#A77F8B", name: "Dusty Rose" },
      { hex: "#8D8197", name: "Mauve" },
      { hex: "#77899C", name: "Mist Blue" },
      { hex: "#977784", name: "Soft Plum" },
      { hex: "#B08F8A", name: "Rose Beige" },
    ],
    avoid: [
      { hex: "#FF5B4E", name: "Neon Coral" },
      { hex: "#FF9E00", name: "Bright Orange" },
      { hex: "#151515", name: "Sharp Black" },
      { hex: "#FFD400", name: "Acid Yellow" },
      { hex: "#E32213", name: "Tomato Red" },
    ],
    makeup: "Soft, diffused and seamless is key. Choose muted rosy blush, pinky-mauve lips, taupe or cool brown eye tones, and softly defined eyes for a naturally elegant finish.",
  },
  "summer-muted": {
    traits: ["Cool", "Dusty", "Low-contrast"],
    blurb: "Muted Summer lives in the quiet middle of the scale — cool, dusty and low in contrast. Shades that look faded on the hanger come alive on you, while anything vivid or glossy-bright pulls attention off your face.",
    best: [
      { hex: "#967987", name: "Dusty Mauve" },
      { hex: "#738396", name: "Slate Blue" },
      { hex: "#718A88", name: "Sea Sage" },
      { hex: "#8D8292", name: "Smoke Violet" },
      { hex: "#A08786", name: "Ashed Rose" },
    ],
    avoid: [
      { hex: "#F05A28", name: "Vivid Orange" },
      { hex: "#FFC000", name: "Acid Yellow" },
      { hex: "#0B0B0B", name: "Sharp Black" },
      { hex: "#FF2E76", name: "Neon Pink" },
      { hex: "#00C2A8", name: "Electric Teal" },
    ],
    makeup: "Blended and understated is key. Choose soft mauve blush, dusty rose lips, greyed shadow, and a soft lash line for a quiet, polished finish.",
  },
  "autumn-soft": {
    traits: ["Warm", "Earthy", "Muted"],
    blurb: "Soft Autumn is gently warm and earthy. Shades with a little dust in them — clay, moss, camel — settle beautifully against your skin. Stark black-and-white contrast and icy brights feel borrowed from someone else's palette.",
    best: [
      { hex: "#A8896C", name: "Camel" },
      { hex: "#B67A62", name: "Clay Rose" },
      { hex: "#9A945F", name: "Moss" },
      { hex: "#65847D", name: "Sage Teal" },
      { hex: "#B99A61", name: "Wheat Gold" },
    ],
    avoid: [
      { hex: "#FFFFFF", name: "Optic White" },
      { hex: "#090909", name: "Sharp Black" },
      { hex: "#1E4EE8", name: "Royal Blue" },
      { hex: "#FF2E7E", name: "Fuchsia" },
      { hex: "#C6E9F5", name: "Icy Blue" },
    ],
    makeup: "Warm and softly blended is key. Choose peachy-terracotta blush, warm rose or brick lips, bronze-taupe shadow, and soft brown liner for an earthy glow.",
  },
  "autumn-warm": {
    traits: ["Warm", "Rich", "Golden"],
    blurb: "Warm Autumn is spice, moss and golden earth. Deeply warm shades with a gold base make your skin look lit from within. Cool pastels and icy tones flatten that warmth and can make you look washed out.",
    best: [
      { hex: "#B96532", name: "Burnt Sienna" },
      { hex: "#C3842C", name: "Amber" },
      { hex: "#B3902E", name: "Antique Gold" },
      { hex: "#68753F", name: "Olive" },
      { hex: "#36736B", name: "Deep Teal" },
    ],
    avoid: [
      { hex: "#D9E7FF", name: "Icy Blue" },
      { hex: "#CEB9E8", name: "Pale Lilac" },
      { hex: "#F2A8C8", name: "Baby Pink" },
      { hex: "#C9CBD3", name: "Cool Gray" },
      { hex: "#00C2D6", name: "Electric Cyan" },
    ],
    makeup: "Rich and golden is key. Choose terracotta blush, brick or warm brown lips, copper and bronze shadow, and deep brown liner for a glowing finish.",
  },
  "autumn-deep": {
    traits: ["Warm", "Deep", "Rich"],
    blurb: "Deep Autumn is dark, warm and luxurious. Saturated shades with real depth — chocolate, forest, wine — give your features the weight they want. Pale pastels tend to disappear against your natural richness.",
    best: [
      { hex: "#5B3426", name: "Chocolate" },
      { hex: "#7A2F27", name: "Brick Wine" },
      { hex: "#354B35", name: "Forest" },
      { hex: "#8A4D20", name: "Burnt Amber" },
      { hex: "#1F544F", name: "Deep Teal" },
    ],
    avoid: [
      { hex: "#E2F1FF", name: "Pale Sky" },
      { hex: "#F8D8E7", name: "Baby Pink" },
      { hex: "#C7F0E9", name: "Pastel Mint" },
      { hex: "#EDE6D6", name: "Pale Sand" },
      { hex: "#D9CCE8", name: "Soft Lilac" },
    ],
    makeup: "Deep and warm is key. Choose bronzed blush, brick or plum-brown lips, copper and espresso shadow, and defined liner for a rich, sculpted finish.",
  },
  "autumn-muted": {
    traits: ["Warm", "Weathered", "Soft"],
    blurb: "Muted Autumn is weathered warmth — the colors of dried herbs and sun-faded leather. Softened, warm-neutral shades keep your skin looking even. Anything neon or crystal-clear reads harsh next to your natural softness.",
    best: [
      { hex: "#92765F", name: "Driftwood" },
      { hex: "#9A685C", name: "Faded Brick" },
      { hex: "#85805A", name: "Dry Moss" },
      { hex: "#667568", name: "Sage" },
      { hex: "#9C845C", name: "Soft Ochre" },
    ],
    avoid: [
      { hex: "#FF2E63", name: "Neon Pink" },
      { hex: "#00C7FF", name: "Electric Blue" },
      { hex: "#FFFFFF", name: "Optic White" },
      { hex: "#7B00E0", name: "Vivid Violet" },
      { hex: "#00E28A", name: "Neon Green" },
    ],
    makeup: "Soft and warm is key. Choose muted peach blush, rosewood or soft brick lips, warm taupe shadow, and a diffused lash line for a natural finish.",
  },
  "winter-deep": {
    traits: ["Cool", "Deep", "Dramatic"],
    blurb: "Deep Winter is dark, cool and dramatic. Jewel shades and true darks give your features definition, and high contrast looks intentional rather than harsh. Warm sandy neutrals blur the edges you want kept sharp.",
    best: [
      { hex: "#201B2B", name: "Midnight" },
      { hex: "#5B1737", name: "Wine" },
      { hex: "#1E395B", name: "Navy" },
      { hex: "#174D4D", name: "Deep Emerald" },
      { hex: "#3C215D", name: "Royal Plum" },
    ],
    avoid: [
      { hex: "#D8B776", name: "Golden Sand" },
      { hex: "#C69A6B", name: "Camel" },
      { hex: "#B5A06B", name: "Olive Gold" },
      { hex: "#E6C9A8", name: "Warm Beige" },
      { hex: "#C97F45", name: "Copper" },
    ],
    makeup: "Sharp and cool is key. Choose berry blush, true red or wine lips, cool grey-plum shadow, and defined black liner for a striking finish.",
  },
  "winter-cool": {
    traits: ["Cool", "Icy", "Bright"],
    blurb: "Cool Winter is icy contrast and jewel color. Blue-based shades with real clarity make your skin look bright and even. Warm, golden or dusty tones dull the crispness your coloring depends on.",
    best: [
      { hex: "#C51F5D", name: "Magenta" },
      { hex: "#2759B7", name: "True Blue" },
      { hex: "#008C9E", name: "Peacock" },
      { hex: "#6C3FA0", name: "Violet" },
      { hex: "#D52D4F", name: "Cool Red" },
    ],
    avoid: [
      { hex: "#C58244", name: "Copper" },
      { hex: "#B29257", name: "Bronze Gold" },
      { hex: "#9B7250", name: "Warm Tan" },
      { hex: "#D9B87A", name: "Honey Beige" },
      { hex: "#A08A5F", name: "Olive Gold" },
    ],
    makeup: "Clear and cool is key. Choose cool pink blush, blue-red or berry lips, silver-grey shadow, and crisp liner for a bright, defined finish.",
  },
  "winter-bright": {
    traits: ["Neutral", "Bright", "Clean"],
    blurb: "Bright Winter runs on electric contrast. Clean, high-clarity color — true red, cobalt, emerald — sharpens your features instantly. Muted earth tones make everything look slightly out of focus.",
    best: [
      { hex: "#EF174C", name: "True Red" },
      { hex: "#0068D7", name: "Cobalt" },
      { hex: "#00A6A6", name: "Emerald Teal" },
      { hex: "#8B38D1", name: "Electric Violet" },
      { hex: "#FF2D72", name: "Hot Pink" },
    ],
    avoid: [
      { hex: "#9A826F", name: "Dusty Tan" },
      { hex: "#A69582", name: "Mushroom" },
      { hex: "#826D5B", name: "Warm Taupe" },
      { hex: "#B9A38A", name: "Sand" },
      { hex: "#8C7B63", name: "Olive Beige" },
    ],
    makeup: "Crisp and saturated is key. Choose bright pink blush, true red or fuchsia lips, clean shimmer, and sharp liner for a high-contrast finish.",
  },
  "winter-vivid": {
    traits: ["Cool", "Vivid", "Deep"],
    blurb: "Vivid Winter pairs maximum saturation with cool depth. The strongest, cleanest shades in the room are the ones that suit you. Softened, sandy neutrals wash the drama straight out of your coloring.",
    best: [
      { hex: "#D8003F", name: "Scarlet" },
      { hex: "#0048B5", name: "Sapphire" },
      { hex: "#007E8A", name: "Deep Peacock" },
      { hex: "#721AA3", name: "Imperial Purple" },
      { hex: "#E5005C", name: "Fuchsia" },
    ],
    avoid: [
      { hex: "#C8A16A", name: "Golden Camel" },
      { hex: "#B78B5A", name: "Bronze" },
      { hex: "#A98262", name: "Warm Taupe" },
      { hex: "#DCC6A0", name: "Wheat" },
      { hex: "#9C8663", name: "Khaki Gold" },
    ],
    makeup: "Bold and cool is key. Choose deep pink blush, crimson or plum lips, jewel-toned shadow, and precise liner for a dramatic finish.",
  },
};

export function getToneDetail(id: string): ToneDetail {
  return toneDetails[id] ?? toneDetails["summer-soft"];
}
