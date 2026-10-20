export const GUIDE_ORIGIN = "https://palevie.com";
export const GUIDE_UPDATED = "2026-10-20";
export type ColorGuide = {
  slug: string; title: string; description: string; answer: string;
  sections: { id: string; title: string; paragraphs: string[]; steps?: string[]; source?: { label: string; url: string } }[];
  faqs: { question: string; answer: string }[];
  action: "camera" | "quiz" | "shop"; actionLabel: string;
};
// Original editorial guidance, not a validated diagnostic protocol. Dates change
// only when the content changes. These public pages never contain user results.
export const colorGuides: ColorGuide[] = [
  {
    slug:"how-to-find-colors-that-suit-you",
    title:"How to Find Colors That Suit Your Face",
    description:"Compare colors beside your face, separate hue from depth and contrast, and build a useful shortlist without treating a quiz as a diagnosis.",
    answer:"Start with a repeatable comparison beside your face, not a favorite color or a hair-color rule. Keep your lighting and position steady, compare one difference at a time, and keep more than one candidate when the result is unclear.",
    action:"camera",actionLabel:"Compare colors beside my face",
    sections:[
      {id:"set-up",title:"Start with a comparison you can repeat",paragraphs:["Use a mirror and two fabrics, or a live camera view with two digital colors. Try a plain background and even light from in front of you. Keep your face at the same angle; avoid comparing one side in shadow with the other in direct light.","Phone images are not calibrated skin measurements. A study of skin-tone color standards found that camera angle and distance can change recorded color. That supports keeping the setup consistent; it does not validate a personal-color diagnosis."],source:{label:"Research: smartphone geometry and recorded color",url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC10247498/"}},
      {id:"compare",title:"Compare a difference, not two completely different looks",paragraphs:["Use this as an observation routine, not a scoring formula. If one option is much darker and brighter as well as cooler, you cannot tell which change led to your reaction."],steps:["Compare similar-depth colors from warmer and cooler families, such as peach-rose and rosy pink.","Within a color family, compare a lighter option with a deeper one.","Compare a softer, muted option with a clearer, more vivid option.","Return to the first pair in reverse order. Keep a note only when you can describe the difference again."]},
      {id:"observe",title:"What should you look at?",paragraphs:["Look at your whole face before looking at the color itself. Do you notice your eyes and features first, or does the color dominate? Does one combination create an unwanted cast or distracting contrast? Describe the observation rather than declaring that the lighter-looking face is better.","Ask two separate questions: ‘Do I like this color?’ and ‘Do I like this color beside my face?’ Both answers matter, but they are not the same evidence. If a camera brightens the entire image between options, repeat the comparison rather than treating that change as a result."]},
      {id:"next",title:"Turn observations into a shortlist",paragraphs:["Keep a few colors that gave a consistent effect, plus one alternative for comparison. Test the same directions in clothing or makeup you already own before buying a complete palette. A season name can organize ideas; it does not need to become a rule about what you may wear.","Palevie offers free camera and mirror color comparisons without mandatory signup. Its camera guide currently explores Soft/Bold lightness contrast, not a certified warm/cool or seasonal result. The separate seven-question Quick Quiz starts a color-mood exploration; it does not independently verify which colors suit your face."]}
    ],
    faqs:[
      {question:"Can a favorite color tell me my undertone?",answer:"A preference tells you what you enjoy. It is not a measurement of undertone or evidence of how a color interacts with your face."},
      {question:"What should I do when both colors look fine?",answer:"Keep both as candidates or use Not sure. Do not force a difference that you cannot repeat under the same conditions."},
      {question:"Do I need to buy anything to begin?",answer:"No. Use colors and clothes you already have, a mirror, or Palevie’s free digital comparison. A shopping link is optional."}
    ]
  },
  {
    slug:"warm-vs-cool-undertones",
    title:"Warm vs Cool Undertones: What Can You Actually Tell?",
    description:"Understand warm and cool color language, avoid confusing skin depth with undertone, and compare color families without a forced season label.",
    answer:"Warm and cool describe color direction, not how light or dark your skin is. For choosing colors to wear, compare the effect of warmer and cooler options beside your face. A single photo, a favorite metal, or a quiz answer should not be treated as a confirmed undertone result.",
    action:"camera",actionLabel:"Try a warm/cool color comparison",
    sections:[
      {id:"language",title:"Separate color temperature from skin depth",paragraphs:["In makeup and styling language, warm usually points toward yellow, golden or orange-leaning colors; cool usually points toward pink, blue or violet-leaning colors. Neutral describes a less clearly warm-or-cool direction. These are useful comparison labels, not precise measurements of a person.","Light/deep is a different question from warm/cool. A deep berry and a pale rose can both be relatively cool; a light peach and a deep terracotta can both be relatively warm. Do not assign someone a temperature category solely from skin depth, ethnicity, eye color or hair color."]},
      {id:"experiment",title:"Use a paired comparison instead of a shortcut",paragraphs:["Palevie’s suggested routine is to change one color dimension at a time. It is a way to organize what you observe, not a validated undertone test."],steps:["Choose two broadly similar-depth colors, one warmer and one cooler.","Use the same mirror or camera position and lighting for both.","Compare the face-color relationship, not which swatch you would buy on its own.","Repeat with another pair, such as warmer and cooler reds.","If pairs disagree, record a mixed result instead of forcing warm or cool."]},
      {id:"shortcuts",title:"Why a simple rule can be misleading",paragraphs:["Liking gold jewelry may reflect your style, the jewelry’s finish or the outfit you paired with it. Without a controlled comparison, that choice does not tell us why you preferred it. Likewise, a color seen on a phone includes the effects of the camera, display and surroundings.","Keep personal preference separate from observed effects. A color may suit the look you want even when it sits outside a conventional seasonal palette. The aim is a useful comparison, not a list of forbidden colors."]},
      {id:"palevie",title:"What Palevie can do today",paragraphs:["You can compare digital colors beside your face with a live camera or use the mirror route. The optional advanced comparisons collect your observations across temperature, depth and clarity. They are not an automatic professional diagnosis.","The live Soft/Bold guide concerns lightness contrast; Bold does not mean Cool and Soft does not mean Warm. The Quick Quiz’s starting palette is a style mood, not a confirmed undertone. Check the color beside your face before treating a product suggestion as a personal match."]}
    ],
    faqs:[
      {question:"Does pale skin mean cool, or deep skin mean warm?",answer:"No. Skin depth and warm/cool direction are different concepts. Palevie should not infer a temperature result from skin depth alone."},
      {question:"What if I seem neutral?",answer:"Keep warmer and cooler candidates and compare more than one pair. Uncertain or mixed observations are a reason to keep options open, not to invent confidence."},
      {question:"Does Palevie diagnose my undertone from the seven-question quiz?",answer:"No. The current Quick Quiz starts a color-mood exploration. Camera or mirror comparisons are separate, and the camera’s Soft/Bold guide is not an undertone measurement."}
    ]
  },
  {
    slug:"compare-colors-with-your-phone",
    title:"How to Compare Colors with Your Phone Camera",
    description:"Set up a steadier digital color comparison, understand screen and lighting limits, and use Palevie’s free camera or mirror route.",
    answer:"Use a stable camera position, even light and unchanged display settings while you compare colors. Digital draping helps you view color beside your face, but it is not the same as real fabric reflecting light onto skin or a calibrated personal-color measurement.",
    action:"camera",actionLabel:"Open live color comparison",
    sections:[
      {id:"prepare",title:"Prepare the view before comparing",paragraphs:["Face an even light source, keep the phone steady, and choose a plain background. Remove a hat or move hair away if it casts a strong shadow over the face. Avoid beauty filters for the comparison. Do not use direct sun or change rooms between options."],steps:["Keep the same camera, distance and angle for both colors.","Keep screen brightness at a comfortable, consistent level.","If practical, temporarily disable display color-shifting modes and restore your normal settings afterward.","Wait for the camera image to settle before judging a pair."]},
      {id:"display",title:"The screen is part of the comparison",paragraphs:["Apple documents that True Tone adapts display color and intensity to ambient light, while Night Shift shifts the display toward warmer colors. These settings can change how the same digital swatch looks. Other devices have their own display controls.","A consistent setup improves comparability, not calibration. Research on smartphone photographs of skin-tone standards also found changes with viewing geometry. The same numeric color on two devices is not a promise of the same perceived result."],source:{label:"Apple: display brightness and color temperature",url:"https://support.apple.com/en-us/109351"}},
      {id:"use",title:"Use Palevie’s camera or mirror route",paragraphs:["Open Live Color Draping and approve camera access when your browser asks. Compare the available colors beside your face and record which effect you observe, or choose Not sure when the difference is unclear. You do not need an account to try the comparison.","If the camera does not start inside another app, try opening the page in your regular browser and review that browser’s camera permission. The mirror route is available without camera access. A permission request alone does not mean that the live video has started."]},
      {id:"limits",title:"Know what the guide is measuring",paragraphs:["Palevie’s current live guide compares lightness contrast for a Soft/Bold effect. It does not automatically establish a warm/cool undertone or a four-season result. A changing exposure or heavy shadow is a reason to repeat or stop, not a reason to trust a stronger score.","The Live Draping and Virtual Try On camera features are designed to process frames on your device rather than upload face video. This statement concerns those live features; review the separate privacy information before using any other image feature. A digital overlay is not proof of how a fabric or cosmetic will look in person."],source:{label:"Research: limits of repeatable smartphone color capture",url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC10247498/"}}
    ],
    faqs:[
      {question:"Can I use Palevie without a camera?",answer:"Yes. The seven-question Quick Quiz and mirror comparison do not require live camera access. The quiz explores a starting color mood; it is not a measured face result."},
      {question:"Should I trust a result when the image keeps getting brighter?",answer:"Repeat the comparison with a steadier setup. An exposure change is not evidence that one color suits you better."},
      {question:"Does the digital drape behave exactly like real cloth?",answer:"No. It places displayed color beside the camera image. It does not reproduce all the reflected light, texture or viewing conditions of physical cloth."}
    ]
  },
  {
    slug:"choose-makeup-shades-online",
    title:"How to Choose Makeup Shades Online Without Guessing from One Swatch",
    description:"Compare shade, depth, coverage and finish, check the exact product variant, and use digital try-on as a shortlist rather than a match guarantee.",
    answer:"Use online swatches to make a shortlist, not to promise an exact match. Compare color direction, depth, coverage and finish separately, then check the exact shade and product size on the retailer’s page before you buy.",
    action:"shop",actionLabel:"Compare makeup in the Shop",
    sections:[
      {id:"reference",title:"Begin with something you can compare",paragraphs:["Choose a makeup shade you already know in person, or a color direction you observed beside your face. Write down what you want to keep and what you want to change: perhaps the same rose family with less depth, or a similar color with a different finish.","This is more specific than searching for a universal perfect pink. Keep your reason for the shortlist visible. A product that resembles a chosen digital palette has not thereby been proven to suit your skin."]},
      {id:"four-checks",title:"Separate four product decisions",paragraphs:["Use this checklist for each candidate rather than judging from a product name alone."],steps:["Color direction: compare peach, rose, berry or another family against your reference.","Depth: ask whether the option is lighter, similar or deeper than the reference you know.","Coverage and form: distinguish a sheer tinted oil or gloss from a more opaque lipstick; check the brand’s description.","Finish: compare matte, glossy or dewy effects within the relevant product type. Do not assume every shade in a range has the same finish."]},
      {id:"digital",title:"What digital tools can and cannot tell you",paragraphs:["Palevie’s result cards explain product form, finish and why a documented digital swatch was selected. Product-type and finish choices can narrow those options. Some combinations have no documented close candidates; that is better than silently substituting an unrelated shade.","Virtual Try On is available on supported makeup products and provides an illustrative overlay. It cannot establish exact coverage, texture, wear, skin compatibility or a foundation match. Use it to compare an idea, not as evidence that you have tested the physical product."]},
      {id:"checkout",title:"Check the listing before leaving with a purchase",paragraphs:["Read the selected shade name, size and item count on the retailer page. Confirm whether you are looking at a mini or full-size product, a single item or a set, and the intended formula. Check the current seller, availability, price and return terms there.","Palevie’s Shop uses reviewed Amazon product-detail links, not a guarantee that the item is currently in stock. Digital color illustrations are not product photographs. As an Amazon Associate, Palevie earns from qualifying purchases; checkout takes place on Amazon, not Palevie.","A useful first purchase tests one specific idea. There is no need to replace your entire routine to explore a new color direction. Save alternatives and compare again before deciding."]}
    ],
    faqs:[
      {question:"Why does the same shade name appear in different products?",answer:"A name alone does not identify the formula, finish or selected variant. Compare the full product name and shade, and verify the listing rather than substituting a similarly named item."},
      {question:"Does an Amazon click mean a purchase?",answer:"No. A click opens a retailer destination. Orders and any commission are separate events reported by Amazon."},
      {question:"Do I have to sign up or pay to compare?",answer:"No. Palevie’s core exploration and shopping tools are free without mandatory signup. Buying a physical product is optional and takes place with the retailer."}
    ]
  }
];
export function colorGuide(slug:string):ColorGuide|undefined { return colorGuides.find(guide=>guide.slug===slug); }
export function guidePath(slug:string):`/guides/${string}` { return `/guides/${slug}`; }
export function guideJsonLd(guide:ColorGuide) {
  const url=GUIDE_ORIGIN+guidePath(guide.slug);
  return {"@context":"https://schema.org","@graph":[
    {"@type":"Article","@id":`${url}#article`,headline:guide.title,description:guide.description,inLanguage:"en-US",datePublished:GUIDE_UPDATED,dateModified:GUIDE_UPDATED,mainEntityOfPage:{"@type":"WebPage","@id":url},author:{"@type":"Organization",name:"Palevie",url:GUIDE_ORIGIN+"/guides#about"},publisher:{"@type":"Organization",name:"Palevie",url:GUIDE_ORIGIN},isAccessibleForFree:true},
    {"@type":"BreadcrumbList",itemListElement:[
      {"@type":"ListItem",position:1,name:"Palevie",item:GUIDE_ORIGIN+"/"},
      {"@type":"ListItem",position:2,name:"Color guides",item:GUIDE_ORIGIN+"/guides"},
      {"@type":"ListItem",position:3,name:guide.title,item:url}
    ]}
  ]};
}
export function safeJsonLd(value:unknown):string { return JSON.stringify(value).replace(/</g,"\\u003c"); }
