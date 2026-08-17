/**
 * Editorial detail for each of the 16 tones — the copy and named swatches the
 * result screen shows. Colors and wording follow the design mockups; the
 * scoring palette lives separately in `palettes.ts`.
 */

export type NamedColor = { hex: string; name: string };
export type ToneDetail = {
  traits: [string, string, string];
  blurb: string;
  best: NamedColor[];
  avoid: NamedColor[];
  makeup: string;
};

const pair = (hexes: string[], names: string[]): NamedColor[] =>
  hexes.map((hex, i) => ({ hex, name: names[i] }));

export const toneDetails: Record<string, ToneDetail> = {
  "spring-light": {
    traits: ["Warm", "Light", "Fresh"],
    blurb: "Light Spring is a warm and light season with a fresh, delicate brightness. You have warm undertones and shine in clear, light, airy colors that bring a natural radiance to your complexion. Avoid dark, heavy, or cool-muted shades that can overwhelm your fresh and luminous look.",
    best: pair(["#FEC2AF", "#FEC491", "#F9DC98", "#F6A59A", "#B4D8CB"], ["Peach", "Apricot", "Butter Yellow", "Light Coral", "Mint"]),
    avoid: pair(["#2B2B2E", "#565758", "#652C44", "#CEC5D1", "#846C83"], ["Black", "Charcoal", "Deep Burgundy", "Icy Gray", "Dark Plum"]),
    makeup: "Fresh, luminous, and light is key. Choose peachy blush, coral or warm pink lips, champagne shimmer, and light brown liner and mascara for a soft, bright, radiant finish.",
  },
  "spring-warm": {
    traits: ["Warm", "Sunny", "Lively"],
    blurb: "Warm Spring suits golden, cheerful, sunlit shades that feel lively and naturally radiant. Choose warm, fresh, glowing colors with yellow undertones, and avoid cool, icy, or dusty shades that can dull your energy.",
    best: pair(["#FAC0AD", "#FDAD69", "#FDCD62", "#FE927D", "#BCD5A5"], ["Peach", "Apricot", "Marigold", "Warm Coral", "Leaf Green"]),
    avoid: pair(["#FADADA", "#ADAEAE", "#BDACD5", "#525251", "#BF9CA2"], ["Icy Pink", "Cool Gray", "Blue Violet", "Charcoal", "Dusty Mauve"]),
    makeup: "Fresh, sunny, and warm is key. Choose apricot or coral blush, peachy lips, champagne shimmer, and warm brown eye tones for a healthy radiant finish.",
  },
  "spring-bright": {
    traits: ["Warm", "Bright", "Clear"],
    blurb: "Bright Spring suits clear, energetic, high-impact shades that feel sparkling and full of life. Choose crisp, vivid, happy colors with strong clarity, and avoid muddy, muted, or heavy shades that hide your brightness.",
    best: pair(["#FE9D8F", "#FDB266", "#FDD334", "#BAD756", "#A8E5D8"], ["Coral Peach", "Apricot", "Sunshine Yellow", "Lime Green", "Aqua Sky"]),
    avoid: pair(["#C6B4D2", "#D9808B", "#9798A7", "#966535", "#9B9857"], ["Dusty Lavender", "Muted Rose", "Grayish Blue", "Dull Brown", "Moss Green"]),
    makeup: "Vibrant, glossy, and clear is key. Choose coral blush, juicy bright lips, luminous skin, and fresh eye tones with clean contrast for a vivid, cheerful finish.",
  },
  "spring-vivid": {
    traits: ["Neutral", "Bright", "Saturated"],
    blurb: "Vivid Spring suits intense, lively, high-saturation shades that feel playful and eye-catching. Choose bold, energized colors with fresh clarity, and avoid soft, smoky, muted, or faded tones that weaken your vivid charm.",
    best: pair(["#FA5C46", "#F79226", "#CBD62E", "#1EC4C0", "#F2557F"], ["Vivid Coral", "Tangerine", "Chartreuse", "Turquoise", "Watermelon Pink"]),
    avoid: pair(["#D6BFA6", "#A98D99", "#7C8391", "#8C8A54", "#BFAB9E"], ["Dusty Beige", "Smoky Mauve", "Slate Gray", "Muted Olive", "Soft Taupe"]),
    makeup: "Crisp, bright, and saturated is key. Choose vivid coral or bright pink lips, fresh peach blush, glossy texture, and lively defined eyes for a colorful energetic finish.",
  },
  "summer-light": {
    traits: ["Cool", "Light", "Airy"],
    blurb: "Light Summer suits cool, light, and delicate shades that feel soft, airy, and effortlessly elegant. Choose gentle pastels and muted cool tones, and avoid heavy, dark, or warm colors that can overwhelm your natural clarity.",
    best: pair(["#BED2F3", "#EAADC0", "#D2C0E2", "#B8D9D8", "#DDC0BF"], ["Powder Blue", "Cool Pink", "Soft Lilac", "Seafoam", "Rose Beige"]),
    avoid: pair(["#E99351", "#ECC481", "#D9AB91", "#624536", "#1C1D1D"], ["Orange", "Mustard", "Camel", "Deep Brown", "Black"]),
    makeup: "Sheer cool pink blush, watery rose lips, soft taupe-lilac eyes, and light, fresh definition bring out your natural radiance with an airy, refined finish.",
  },
  "summer-cool": {
    traits: ["Cool", "Fresh", "Refined"],
    blurb: "Cool Summer suits purely cool, clean, and balanced shades that feel soft, serene, and effortlessly elegant. Choose clear, muted-cool colors with blue or rosy undertones, and avoid obvious warmth or golden hues that can overpower your natural harmony.",
    best: pair(["#EA92AC", "#C44587", "#8A99E1", "#CEBCDB", "#434976"], ["Cool Rose", "Raspberry Pink", "Cornflower Blue", "Lavender", "Cool Navy"]),
    avoid: pair(["#F0763C", "#D3AD5A", "#D0AC92", "#AA7F64", "#C94C50"], ["Orange", "Mustard", "Warm Beige", "Camel", "Tomato Red"]),
    makeup: "Enhance your cool, soft beauty with blue-pink blush, rose-berry lips, and cool taupe or gray-lilac eyes. Choose softly defined liner in charcoal or cool brown for a delicate, refined look.",
  },
  "summer-soft": {
    traits: ["Cool", "Muted", "Soft"],
    blurb: "Soft Summer suits cool, muted, and gentle shades that look naturally harmonious on you. Choose soft pastels, smoky tones, and dusty hues — and avoid bright, warm, or high-contrast colors that can overpower your calm beauty.",
    best: pair(["#DE9DAD", "#D2A5C1", "#AFB0C7", "#B591AD", "#DEB2AE"], ["Dusty Rose", "Mauve", "Mist Blue", "Soft Plum", "Rose Beige"]),
    avoid: pair(["#FD7B86", "#FA8A2D", "#30282E", "#FCC638", "#E23C3D"], ["Neon Coral", "Bright Orange", "Sharp Black", "Acid Yellow", "Tomato Red"]),
    makeup: "Soft, diffused, and seamless is key. Choose muted rosy blush, pinky-mauve lips, taupe or cool brown eye tones, and softly defined eyes for a naturally elegant finish.",
  },
  "summer-muted": {
    traits: ["Cool", "Muted", "Dusty"],
    blurb: "Muted Summer suits softly blended, low-contrast, dusty cool shades that feel calm and elegant. Choose muted colors with a grayish, cool undertone, and avoid loud, saturated hues that can overpower your natural softness.",
    best: pair(["#A28D99", "#BC97A1", "#7C859A", "#BAAAB9", "#9EA8A8"], ["Dusty Mauve", "Smoky Rose", "Slate Blue", "Muted Lavender", "Soft Teal"]),
    avoid: pair(["#EF6D72", "#EFCB67", "#333337", "#F08251", "#EE7D9C"], ["Neon Coral", "Bright Yellow", "Strong Black", "Vivid Orange", "Hot Pink"]),
    makeup: "Soft, muted, and cool-toned is key. Choose muted rose blush, mauve lips, taupe-plum eyes, and softly blurred definition for a refined, graceful finish.",
  },
  "autumn-soft": {
    traits: ["Warm", "Soft", "Natural"],
    blurb: "Soft Autumn suits warm, softened, earthy shades that feel cozy and naturally elegant. Choose gentle, muted colors inspired by nature, and avoid icy, sharp, or high-contrast tones that overpower your calm charm.",
    best: pair(["#EFA277", "#9CA173", "#CC7C6E", "#B09A8C", "#8A8C5F"], ["Dusty Apricot", "Sage", "Terracotta Rose", "Warm Taupe", "Moss"]),
    avoid: pair(["#F6C9D4", "#3E9BDA", "#E8437F", "#141414", "#FBFBF9"], ["Icy Pink", "Electric Blue", "Fuchsia", "Black", "Stark White"]),
    makeup: "Enhance your natural warmth with peach-brown blush, rosy nude lips, and olive-brown eyes. Choose soft, blendable textures and a naturally diffused finish for an effortless, harmonious look.",
  },
  "autumn-warm": {
    traits: ["Warm", "Rich", "Golden"],
    blurb: "Warm Autumn suits golden, sunlit, and naturally rich shades that feel cozy, vibrant, and grounded. Choose warm, earthy, and honeyed colors that bring harmony and radiance to your natural glow — and avoid cool, icy tones that can look ashy or flat.",
    best: pair(["#E4682A", "#E1A21F", "#8A8B33", "#3D8378", "#B4502C"], ["Pumpkin", "Amber", "Olive", "Warm Teal", "Cinnamon"]),
    avoid: pair(["#CDE7F0", "#1B4FA8", "#DE3A8E", "#A8A8A8", "#141414"], ["Icy Pastels", "Cobalt Blue", "Magenta", "Cool Gray", "Black"]),
    makeup: "Enhance your natural warmth with terracotta blush, caramel-coral lips, and bronze eyes. Choose warm, softly smoked definition for a radiant, effortless glow.",
  },
  "autumn-deep": {
    traits: ["Warm", "Deep", "Luxe"],
    blurb: "Deep Autumn suits warm, dark, and luxurious shades with depth and richness. These colors enhance your natural radiance and create a sophisticated, grounded look. Avoid pale, icy, or overly bright cool tones that can wash you out.",
    best: pair(["#A93A1E", "#274A2C", "#5E2621", "#4F4A1D", "#3A2419"], ["Deep Rust", "Forest Green", "Mahogany", "Dark Olive", "Espresso"]),
    avoid: pair(["#F8C6D2", "#F8705C", "#4FC7C8", "#FBFBF9", "#152234"], ["Icy Pink", "Neon Coral", "Bright Aqua", "Pure White", "Cool Black-Blue"]),
    makeup: "Embrace rich, warm, and dimensional looks. Choose brick lips, bronze-brown eyes, cinnamon blush, and softly sculpted definition for a naturally polished and radiant finish.",
  },
  "autumn-muted": {
    traits: ["Warm", "Muted", "Earthy"],
    blurb: "Muted Autumn suits earthy, softened, low-contrast warm shades that feel cozy and timeless. Choose muted, grounded colors with gentle depth, and avoid sharp, cool, or highly saturated tones that create too much contrast.",
    best: pair(["#C4726A", "#A08B41", "#8D9A6C", "#5E7F79", "#A48C74"], ["Clay Rose", "Dusty Olive", "Sage", "Smoky Teal", "Warm Taupe"]),
    avoid: pair(["#C7BEE4", "#E64D86", "#2C5E9E", "#FBFBF9", "#1C1C1B"], ["Icy Lavender", "Hot Pink", "Royal Blue", "Pure White", "Strong Black"]),
    makeup: "Soft terracotta blush, brown-rose lips, and mossy taupe eyes enhance your natural warmth and harmony. Choose satin or soft-matte textures and keep everything diffused for a natural, effortless finish.",
  },
  "winter-deep": {
    traits: ["Cool", "Deep", "Dramatic"],
    blurb: "Deep Winter suits intense, cool shades with strong depth and contrast that create a striking, refined look. Choose rich jewel tones and icy brights, and avoid dusty or warm earthy colors that soften your natural clarity.",
    best: pair(["#311736", "#045A4B", "#0D348C", "#A90624", "#F46BA1"], ["Blackberry", "Emerald", "Sapphire", "True Red", "Icy Pink"]),
    avoid: pair(["#C0855D", "#E17133", "#C68826", "#826B3F", "#D0A994"], ["Camel", "Orange", "Mustard", "Warm Olive", "Beige"]),
    makeup: "Rich, cool, and defined is key. Choose berry or wine lips, cool-toned contour, luminous finish, and jewel-toned or charcoal eyes with sharp liner for a bold, sophisticated finish.",
  },
  "winter-cool": {
    traits: ["Cool", "Clear", "Crisp"],
    blurb: "Cool Winter suits clean, crisp, and high-contrast shades with a purely cool undertone. Choose clear, icy colors that feel bold and vibrant, and avoid warm, muted, or muddy tones that can dull your natural radiance.",
    best: pair(["#D2107E", "#1B41B4", "#B9D2EC", "#D07AA6", "#18225F"], ["Fuchsia", "Cobalt", "Icy Blue", "Cool Rose", "True Navy"]),
    avoid: pair(["#D2A484", "#F5A28E", "#F2913C", "#8E5A45", "#8B8464"], ["Camel", "Peach", "Orange", "Warm Brown", "Olive"]),
    makeup: "Enhance your natural contrast with cool, crisp makeup. Choose cool pink blush, berry-pink or fuchsia lips, crisp eyeliner, and cool gray or plum eyes for a polished, radiant winter look.",
  },
  "winter-bright": {
    traits: ["Cool", "Bright", "High-Contrast"],
    blurb: "Bright Winter suits vivid, cool shades with clarity and contrast, creating a fresh and striking impression. Choose clear, high-impact colors and avoid muted or earthy tones that can dull your natural radiance.",
    best: pair(["#FE1E8F", "#0948C3", "#078F5C", "#F6F15D", "#00B1C1"], ["Hot Pink", "Royal Blue", "Emerald", "Icy Lemon", "Bright Teal"]),
    avoid: pair(["#D9969B", "#988E64", "#C49670", "#8A3F1C", "#F09E08"], ["Dusty Rose", "Muted Olive", "Camel", "Warm Brown", "Mustard"]),
    makeup: "Fuchsia or berry lips, bright cool blush, sharp black liner, and glossy, crisp contrast bring out your radiance. Keep everything clean, vibrant, and high-impact.",
  },
  "winter-vivid": {
    traits: ["Cool", "Deep", "Maximum saturation"],
    blurb: "Vivid Winter suits cool, deep, jewel-toned shades with striking clarity and contrast. Choose saturated cool colors, icy accents, and sharp contrast — and avoid dusty, warm, muted, or faded tones that weaken your vivid presence.",
    best: pair(["#DA0A64", "#910827", "#0431A0", "#037157", "#F687AB"], ["Fuchsia", "Ruby", "Cobalt", "Emerald", "Icy Pink"]),
    avoid: pair(["#CDAB9F", "#B98C64", "#6A6751", "#C76044", "#AC8981"], ["Dusty Beige", "Warm Camel", "Muted Olive", "Rust", "Soft Taupe"]),
    makeup: "Bold, clear, and high-contrast is key. Choose cool berry or cherry lips, crisp eyeliner, luminous skin, and jewel-toned accents for a bright, refined finish.",
  },
};

export function getToneDetail(id: string): ToneDetail {
  return toneDetails[id] ?? toneDetails["summer-soft"];
}
