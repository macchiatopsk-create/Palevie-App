import type { NamedColor } from "@/lib/toneDetail";

export const guideCategories = ["lipstick", "blush"] as const;
export type GuideCategory = (typeof guideCategories)[number];

export type LaunchGuide = {
  slug: string;
  category: GuideCategory;
  label: string;
  title: string;
  description: string;
  intro: string;
  shadeHeading: string;
  shadeGuidance: string;
  comparison: string;
  finish: string;
  application: string;
  caution: string;
  discovery: string;
  paletteNote: string;
  best: NamedColor[];
  faqs: { q: string; a: string }[];
  related: { href: string; label: string; reason: string }[];
};

export const launchGuideParams = [
  { slug: "soft-summer", category: "lipstick" },
  { slug: "warm-spring", category: "lipstick" },
  { slug: "deep-winter", category: "lipstick" },
  { slug: "soft-autumn", category: "blush" },
] as const satisfies readonly { slug: string; category: GuideCategory }[];

const guides: Record<string, LaunchGuide> = {
  "soft-summer/lipstick": {
    slug: "soft-summer", category: "lipstick", label: "Lipstick",
    title: "Soft Summer Lipstick Colors: Muted Mauve, Rose and Berry",
    description: "Compare muted mauve, dusty rose and softened berry lipstick for Soft Summer, with cool-neutral undertone, finish and depth guidance.",
    intro: "Soft Summer lipstick works best when cool-neutral color is softened rather than icy or vivid. The useful shopping question is not simply ‘Is this pink?’ It is whether the pink, mauve or berry has enough greyed softness to sit beside the face without turning brown, neon or sharply blue. Start with muted mauve and dusty rose, then add berry only when its depth remains diffused.",
    shadeHeading: "Muted mauve or dusty rose?",
    shadeGuidance: "Muted mauve is the most reliable everyday anchor when it reads as rose mixed with a quiet taupe veil—not purple-grey. Dusty rose is a little fresher and often easier when natural lip color already supplies depth. For a stronger lip, look for softened raspberry or wine-rose rather than clear fuchsia. A pink-beige nude can work, but it needs a rosy base; yellow beige may drain the palette and cocoa brown can pull it toward Autumn.",
    comparison: "Compare two candidates on opposite sides of the lower lip: one mauve, one rose. In indirect daylight, the better direction should make the skin look even before concealer or blush is added. If mauve creates a grey ring, move closer to rose. If rose becomes candy-bright, move back toward mauve or blot the first layer.",
    finish: "Choose satin, blurred cream or a balm with visible pigment. These finishes preserve Soft Summer's low-to-medium contrast while keeping the lip shape legible. Very glassy gloss can make a muted shade look brighter than it is; a dry, fully opaque matte can make the mouth appear heavier. If you prefer matte, soften the edge with a fingertip instead of outlining it crisply.",
    application: "Press color into the center and spread it toward the corners with a finger or small brush. Pause after one layer and judge the full face. Add a second layer only at the inner lip for depth, or tap a muted rose over mauve when the result feels too grey. Keep cheek color in the same rose family, but lighter and more transparent.",
    caution: "Watch for three common detours: peach that turns orange, nude that turns yellow-beige, and berry that stays too clear. Product names are inconsistent, so do not rely on ‘mauve’ alone. Read the base-color description and compare a product image against both a cool rose and a muted neutral reference. Promotional imagery is directional, not a verified swatch on your complexion.",
    discovery: "Build a shortlist around the phrases muted mauve, dusty rose, rosewood and softened raspberry. Record base color, depth, opacity and finish for each candidate. Eliminate options described primarily as coral, caramel, terracotta or electric berry. This narrows a retailer search without implying that every product using a preferred shade name will match.",
    paletteNote: "Dusty Rose, Mauve and Soft Navy illustrate the Soft Summer relationship: cool-neutral, medium-light and subdued. They are color-direction references, not literal lipstick matches.",
    best: [{ name: "Dusty Rose", hex: "#B7848E" }, { name: "Muted Mauve", hex: "#9A7180" }, { name: "Soft Berry", hex: "#8E596B" }],
    faqs: [
      { q: "Is mauve lipstick always right for Soft Summer?", a: "No. Mauve can become too purple-grey or too deep. Soft Summer usually needs a rosy mauve whose saturation is reduced without losing all warmth from the face." },
      { q: "Can Soft Summer wear berry lipstick?", a: "Yes. Choose softened raspberry, cranberry-rose or muted wine and use a blurred or satin finish. Clear magenta and blackened plum create more contrast than this palette naturally carries." },
      { q: "What nude lipstick suits Soft Summer?", a: "Look for pink-beige, muted rose nude or mauve nude close to your natural lip depth. Yellow beige and orange-brown nude are more likely to make the complexion look separate from the lip." },
    ],
    related: [
      { href: "/season/soft-summer", label: "Soft Summer palette", reason: "Recheck the palette's cool-neutral softness before choosing depth." },
      { href: "/season/deep-winter/lipstick", label: "Deep Winter lipstick", reason: "Compare muted berry with a cooler, darker and much clearer berry direction." },
      { href: "/season/soft-autumn/blush", label: "Soft Autumn blush", reason: "See how the same muted chroma behaves when the undertone turns warm-neutral." },
    ],
  },
  "warm-spring/lipstick": {
    slug: "warm-spring", category: "lipstick", label: "Lipstick",
    title: "Warm Spring Lipstick Colors: Clear Coral, Poppy and Peach",
    description: "Choose clear coral, poppy red and warm peach lipstick for Warm Spring using golden undertone, lively chroma and medium-light depth.",
    intro: "Warm Spring lipstick is powered by golden undertone and visible clarity. Coral is useful only when it stays lively: too beige becomes flat, too dusty becomes Autumn, and too pink can look disconnected. The most practical search path begins with clear coral, poppy and warm watermelon, then adjusts depth to the natural lip rather than muting the color with brown.",
    shadeHeading: "Clear coral or poppy red?",
    shadeGuidance: "Clear coral balances orange and pink without a grey veil. It is the flexible daytime choice. Poppy red adds definition while staying warm and buoyant; it should read red-orange rather than brick. Peach works as a lighter option when it has enough pink or apricot pigment to remain visible. Warm watermelon is the bridge for someone who wants freshness without the orange emphasis of coral.",
    comparison: "Place coral and poppy near the face before applying. Coral should echo warmth without making teeth or eye whites appear dull; poppy should add contrast without becoming heavy. If both seem loud, test a transparent version before choosing a dustier shade. If both disappear, increase pigment or move from peach toward watermelon—not immediately toward brown-red.",
    finish: "Cream, juicy satin and pigmented balm reinforce Spring clarity. A thin gloss can work over the center of the lip, but an opaque milky gloss may lighten the base too far. Flat matte can still work when the color stays clear; keep the perimeter softly polished and avoid a thick, powdery layer that dulls coral into clay.",
    application: "Apply one even layer from the center outward, then sharpen only the cupid's bow and outer corners. This keeps the color intentional without creating Winter-level graphic contrast. For poppy, blot once and restore a small amount at the center. Pair it with a warm apricot cheek used sparingly so the lip remains the focus.",
    caution: "Do not confuse warmth with earthiness. Brick, rust, brown rose and muted terracotta usually belong closer to Autumn because their chroma is lower and their depth heavier. Blue-red can also overpower the golden relationship. Shade names are unreliable; inspect whether the base looks clear orange-red, peach-pink or browned.",
    discovery: "Search with clear coral, poppy red, warm watermelon, apricot pink and bright peach. Compare the listed undertone and opacity, then keep one transparent and one medium-coverage candidate. Avoid assuming that ‘warm nude’ is suitable: many warm nudes are caramel or brown, while Warm Spring often needs a peach or coral base to stay animated.",
    paletteNote: "Clear Coral, Marigold and Warm Aqua demonstrate Warm Spring's golden clarity and medium-light value. Use that relationship to judge lipstick, not to match a clothing swatch literally.",
    best: [{ name: "Clear Coral", hex: "#F26F61" }, { name: "Poppy Red", hex: "#E84B3C" }, { name: "Warm Watermelon", hex: "#E96569" }],
    faqs: [
      { q: "What is the best red lipstick direction for Warm Spring?", a: "Start with poppy, tomato red or clear red-orange. These keep visible warmth and clarity. Brick and wine are usually deeper and more muted than the palette's easiest range." },
      { q: "Can Warm Spring wear pink lipstick?", a: "Yes. Choose warm watermelon, coral pink or apricot pink. Cool bubblegum and dusty mauve pull away from the palette in opposite directions." },
      { q: "Should Warm Spring lipstick be sheer or opaque?", a: "Either can work. Sheer color is forgiving, while medium opacity shows Spring clarity more clearly. Judge the base color first, then choose coverage for the amount of contrast you want." },
    ],
    related: [
      { href: "/season/warm-spring", label: "Warm Spring palette", reason: "Review the golden, clear palette that anchors these lip comparisons." },
      { href: "/season/soft-autumn/blush", label: "Soft Autumn blush", reason: "Contrast Spring's clear coral direction with a warmer but more muted cheek palette." },
      { href: "/season/soft-summer/lipstick", label: "Soft Summer lipstick", reason: "Compare clear warm coral against cool-neutral muted mauve." },
    ],
  },
  "deep-winter/lipstick": {
    slug: "deep-winter", category: "lipstick", label: "Lipstick",
    title: "Deep Winter Lipstick Colors: Blue-Red, Blackberry and Wine",
    description: "Compare blue-red, blackberry and cool wine lipstick for Deep Winter, with guidance on dark value, cool undertone and clean contrast.",
    intro: "Deep Winter lipstick needs depth without muddiness. Blue-red, blackberry and cool wine work because they combine a cool base with enough saturation to hold their shape beside dark features. The key distinction is between deep and brown: a shade may look dramatic in the tube yet turn flat if its base is rust, cocoa or muted plum.",
    shadeHeading: "Blue-red, blackberry or cool wine?",
    shadeGuidance: "Blue-red is the clearest option and creates the strongest classic contrast. Blackberry is darker and slightly more violet, useful when a red looks too bright but blackened plum looks too heavy. Cool wine sits between them: deeper than cranberry, less purple than blackberry. For a quieter lip, choose a cool rose-brown that keeps a berry base rather than moving to warm chocolate.",
    comparison: "Test the shade at full lip depth, not only as a hand swatch. A strong Deep Winter direction should clarify the eye and brow area even when the lip is dark. If blue-red floats forward, move deeper toward wine. If blackberry makes the lower face look shadowed, move clearer toward cranberry or apply one blotted layer. If wine becomes brick, the base is too warm.",
    finish: "Satin and precise cream finishes preserve clean edges and dimensional depth. Velvet matte works when it remains smooth rather than dusty. A sheer stain can look elegant, but check that the first layer does not reveal a warm pink base. Frost and pale pearl break the depth relationship; heavy brown gloss can mute it.",
    application: "Define the outer thirds with a cool berry or wine pencil, then connect the center with lipstick so the border does not become a separate dark ring. Check symmetry at conversational distance. For daytime, blot once and soften only the inner edge; for greater contrast, restore color at the center without adding warmth elsewhere on the face.",
    caution: "Blackened color is not automatically Deep Winter. Near-black plum may erase the difference between cool depth and simple darkness. Rust red, warm burgundy and brown raisin pull toward Autumn, while vivid fuchsia can be too bright without enough depth. Compare base hue and finish before relying on names such as ‘oxblood’ or ‘wine.’",
    discovery: "Use blue-red, blackberry, cool wine, cranberry and berry-brown as shortlist terms. Record whether the description names a cool, blue or neutral base and whether coverage is buildable or opaque. Compare one clear red, one wine and one berry at a similar depth; this isolates undertone from darkness and prevents choosing solely from a dramatic product image.",
    paletteNote: "Blackberry, Pine and Burgundy show Deep Winter's cool darkness and controlled saturation. The goal is similarly clean depth, not a literal match to every palette chip.",
    best: [{ name: "Blue-Red", hex: "#A71930" }, { name: "Blackberry", hex: "#531C45" }, { name: "Cool Wine", hex: "#702A43" }],
    faqs: [
      { q: "Is burgundy lipstick good for Deep Winter?", a: "Cool burgundy and wine can be excellent. Check that the base remains berry or blue-red rather than rust or brown. The name alone does not reveal the undertone." },
      { q: "Can Deep Winter wear nude lipstick?", a: "Yes, but the nude usually needs more depth and definition than a pale beige. Try cool rose-brown, berry-brown or a neutral mauve close to the natural lip value." },
      { q: "How dark should Deep Winter lipstick be?", a: "Dark enough to relate to the palette, not so blackened that facial detail disappears. Compare a clear blue-red, cool wine and blackberry to find the depth that supports your own contrast." },
    ],
    related: [
      { href: "/season/deep-winter", label: "Deep Winter palette", reason: "Check the cool, dark palette before deciding how much depth to carry on the lip." },
      { href: "/season/soft-summer/lipstick", label: "Soft Summer lipstick", reason: "Compare a subdued cool berry direction with Deep Winter's clearer, darker one." },
      { href: "/season/warm-spring/lipstick", label: "Warm Spring lipstick", reason: "Use poppy versus blue-red to isolate warm and cool red bases." },
    ],
  },
  "soft-autumn/blush": {
    slug: "soft-autumn", category: "blush", label: "Blush",
    title: "Soft Autumn Blush Colors: Terracotta, Muted Peach and Rose",
    description: "Choose terracotta, muted peach and warm rose blush for Soft Autumn with warm-neutral undertone, diffused chroma and controlled depth.",
    intro: "Soft Autumn blush should look blended into the complexion rather than placed on top of it. Terracotta, muted peach and warm rose are useful families, but each needs restraint: terracotta should not become brick, peach should not become orange, and rose should not become cool mauve. The unifying feature is warm-neutral color with softened chroma and medium depth.",
    shadeHeading: "Terracotta, muted peach or warm rose?",
    shadeGuidance: "Muted peach gives the lightest, freshest effect when it carries beige or apricot rather than bright orange. Warm rose is balanced for everyday wear, especially when natural coloring has visible pink. Soft terracotta adds structure and works well on deeper complexions, but it should retain a rosy or peach undertone instead of reading as bronzer. Cinnamon rose bridges warm rose and terracotta.",
    comparison: "Place blush on the cheek rather than judging from the pan. Compare muted peach on one side and warm rose or terracotta on the other, using the same amount. The better direction should connect with skin and lip color before bronzer is added. If peach turns orange, choose rose. If rose looks pink and separate, move toward cinnamon or terracotta. If terracotta resembles contour, reduce depth or opacity.",
    finish: "Choose a diffused matte, soft satin or cream that settles to a skin-like sheen. These finishes support Soft Autumn's low-to-medium contrast. Strong pearl can make a muted base appear sharper; a very dry, opaque powder may create a visible patch. If using cream, let the edge disappear before deciding whether more pigment is needed.",
    application: "Pick up less product than expected and place it from the outer apple toward the temple, then blend the lower edge with a clean brush or sponge. Keep the center of the face softly connected rather than lifting color into a hard stripe. Reassess after lipstick: a terracotta lip may need muted peach blush, while a softer rose lip can support cinnamon rose on the cheek.",
    caution: "Avoid using bronzer as blush when it lacks a red, peach or rose component; it can flatten the face instead of adding life. Clear coral and hot orange are too saturated for the easiest Soft Autumn effect, while blue-pink and lavender pull cool. Deep brick can overwhelm even when its warmth seems correct.",
    discovery: "Search muted peach, cinnamon rose, soft terracotta, warm rose and apricot beige. Note base hue, opacity and finish, then compare candidates with similar depth so chroma is easier to judge. Product images may vary by screen and complexion; use written color direction to narrow the list, not as proof of an exact swatch result.",
    paletteNote: "Soft Terracotta, Olive and Warm Taupe illustrate Soft Autumn's warm-neutral, muted relationship. For blush, preserve that softness while choosing a cheek-appropriate peach, rose or terracotta base.",
    best: [{ name: "Muted Peach", hex: "#C98972" }, { name: "Cinnamon Rose", hex: "#AD7467" }, { name: "Soft Terracotta", hex: "#B66F55" }],
    faqs: [
      { q: "Is terracotta blush always best for Soft Autumn?", a: "No. Terracotta is useful when it stays soft and cheek-like, but muted peach or warm rose may suit your natural lip and complexion depth better. Compare equal layers on the face." },
      { q: "Can Soft Autumn wear pink blush?", a: "Yes. Choose warm rose, muted salmon or cinnamon rose rather than blue-pink or clear bubblegum. The pink should be warmed and softened, not eliminated." },
      { q: "What finish suits Soft Autumn blush?", a: "Diffused matte, soft satin and skin-like cream finishes are flexible. The edge should blend easily; obvious glitter or a very opaque patch creates more contrast than the palette needs." },
    ],
    related: [
      { href: "/season/soft-autumn", label: "Soft Autumn palette", reason: "Review the warm-neutral muted palette behind these cheek colors." },
      { href: "/season/warm-spring/lipstick", label: "Warm Spring lipstick", reason: "Compare Soft Autumn's muted peach with Spring's clearer coral direction." },
      { href: "/season/soft-summer/lipstick", label: "Soft Summer lipstick", reason: "See how soft chroma shifts when warm-neutral color becomes cool-neutral." },
    ],
  },
};

export function isLaunchGuide(slug: string, category: string): category is GuideCategory {
  return `${slug}/${category}` in guides;
}

export function categoryGuide(slug: string, category: GuideCategory) {
  return guides[`${slug}/${category}`];
}

export function launchGuidesForSeason(slug: string) {
  return launchGuideParams.filter(guide => guide.slug === slug);
}
