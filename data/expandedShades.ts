import { verifiedShadeColors } from "./verifiedShadeColors";
import type { CatalogProduct } from "@/lib/types";

/**
 * Research-backed shade names from the brands' own published color ranges.
 * Hexes are ILLUSTRATIVE, not measured swatches, and Amazon links are SEARCH
 * pages, not claims about exact product availability, price or shade.
 * We only flag manually verified direct product detail pages as affiliateReady.
 */
type Collection = { id:string; brand:string; family:string; kind:"lip"|"blush"|"eyeshadow"|"gloss"; shades:string; source:string; };
const collections:Collection[]=[
  {id:"nyx-bg",brand:"NYX",family:"Butter Gloss",kind:"gloss",source:"https://www.nyxcosmetics.com/lip/lip-gloss/butter-gloss-non-sticky-lip-gloss/800897024956.html",shades:"Éclair|Merengue|Crème Brulee|Tiramisu|Vanilla Crème Pie|Peaches And Cream|Fortune Cookie|Madeleine|Angel Food Cake|Praline|Ginger Snap|Devils Food Cake|Red Velvet|Strawberry Cheesecake|Bit of Honey|Sorbet|Orangesicle|Summer Fruit|Rocky Road|Apple Crisp|Cranberry Pie|Marshmallow|Sugar High|Butterscotch|Spiked Toffee|Cinnamon Roll|Fudge Me|Caramelt|Brownie Drip|Lava Cake|Sugar Glass|Licorice|Bring the Bling|Dripped Out|Pricey|Pay Me In Gold|She Got Money|Shimmer Down|Big Spender|Hustla"},
  {id:"may-lifter",brand:"Maybelline",family:"Lifter Gloss",kind:"gloss",source:"https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid",shades:"Pearl|Ice|Reef|Silk|Moon|Stone|Petal|Topaz|Brass|Opal|Heat|Gummy Bear|Sweetheart|Bubblegum|Taffy|Honey|Caramel|Maple|Toast|Toffee"},
  {id:"elf-oil",brand:"e.l.f.",family:"Glow Reviver Lip Oil",kind:"gloss",source:"https://www.elfcosmetics.com/blogs/the-elf-word/glow-reviver-lip-oil-shades",shades:"Pink Quartz|Honey Talks|Rose Envy|Coral Fixation|Red Delicious|Jam Session|Crystal Clear|Money Mauve|It's Giving Guava|Hot as Fudge"},
  {id:"rare-pinch",brand:"Rare Beauty",family:"Soft Pinch Liquid Blush",kind:"blush",source:"https://www.rarebeauty.com/products/soft-pinch-liquid-blush",shades:"Hope|Bliss|Adore|Happy|Worth|Virtue|Love|Resilience|Joy|Grateful|Lucky|Spirited|Grace|Encourage|Believe|Faith"},
  {id:"elf-bite",brand:"e.l.f.",family:"Bite-Size Eyeshadow",kind:"eyeshadow",source:"https://www.elfcosmetics.com/en_MX/bite-size-collection",shades:"Orange Dreamsicle|I Love You a Latte|Cream & Sugar|Rose Water|Berry Bad|Pumpkin Pie|Hot Jalapeño|Açaí You|Truffles|Carnival Candy|Take Your Pink|Total Smokeshow|Cold Brew"},
  {id:"cp-shock",brand:"ColourPop",family:"Super Shock Shadow",kind:"eyeshadow",source:"https://colourpop.com/collections/super-shock-shadow-singles",shades:"DGAF|Sequin|Drift|Frog|Bae|Moonwalk|So Quiche|Ritz|Ladybird"},
  {id:"nyx-ultimate",brand:"NYX",family:"Ultimate Color Palette",kind:"eyeshadow",source:"https://www.nyxcosmetics.com/ultimate-shadow-palette/800897182755.html",shades:"Warm Neutrals|Cool Neutrals|Smokey & Highlight|Phoenix|Ultimate Utopia|Ultimate Queen"},
  {id:"rare-bouncy",brand:"Rare Beauty",family:"Soft Pinch Matte Bouncy Blush",kind:"blush",source:"https://www.rarebeauty.com/collections/soft-pinch-collection-1",shades:"Hope|Happy|Spirited|Divine|Worth|Alive|Grateful|Thriving|Truth|Soulful"}
];
const search = (query:string) => "https://www.amazon.com/s?k=" + encodeURIComponent(query);

/** Browseable, brand-documented shades; availability and exact Amazon variant NOT validated. */
export const expandedShades:CatalogProduct[] = collections.flatMap(collection=>
  collection.shades.split("|").map((shade,index)=>{
    const key = collection.id+"-"+String(index+1).padStart(2,"0");
    const ref = verifiedShadeColors[key];
    // Never manufacture different product shades from a rotating palette.
    // No digital reference means no shade overlay until sourced and validated.
    const colorHex = ref?.hex;
    return {
      id:key, brand:collection.brand,
      name: key==="nyx-bg-38" ? "Butter Gloss Bling · Shimmer Down"
        : key==="rare-pinch-04" ? "Soft Pinch Liquid Blush · Happy (Mini 0.11 fl oz)"
        : collection.family+" · "+shade,
      category:"makeup" as const,
      subcategory:collection.kind==="gloss"?"gloss":collection.kind,
      description: ref
        ? "Brand digital shade reference; camera color is an approximate visualization, not exact skin payoff."
        : "Brand-listed shade; digital color reference not verified yet.",
      colorHex,
      tags:["shade-range", ...(ref ? ["brand-digital-swatch", "shade-source:"+ref.source] : ["shade-unverified"]), "brand-shade-source:"+collection.source],
      offers:[{id:"of-"+key,retailer:"amazon" as const,url:search(collection.brand+" "+collection.family+" "+shade),affiliateReady:false,currency:"USD" as const}],
    };
  })
);
