import type {CatalogProduct,ProductOffer} from "@/lib/types";

/**
 * Independent PALEVIE reference tints for named shades that lack a reusable
 * official digital color. Inspired by shade-family descriptions only; NOT
 * sampled product art, colorimetry, formula data, exact skin payoff, or a
 * color-match recommendation. Every application adds illustrative-preview.
 *
 * A color is only assigned to a confirmed named cosmetic or variant.
 * NYX Butter Gloss shade-family descriptions were checked against the
 * brand's official shade selector (Nov 4, 2026); hexes remain OUR estimates.
 */
export const ADDITIONAL_ILLUSTRATIVE_TINTS:Readonly<Record<string,string>>={
  "nyx-bg-05": "#BE78A7",
  "nyx-bg-06": "#D59A7F",
  "nyx-bg-08": "#B99179",
  "nyx-bg-09": "#AC7583",
  "nyx-bg-12": "#7A4359",
  "nyx-bg-15": "#C8947D",
  "nyx-bg-16": "#D9919B",
  "nyx-bg-17": "#E08D5C",
  "nyx-bg-18": "#D852A1",
  "nyx-bg-22": "#B9A1CC",
  "nyx-bg-23": "#DDB19A",
  "nyx-bg-24": "#9C6D50",
  "nyx-bg-25": "#835047",
  "nyx-bg-26": "#976955",
  "nyx-bg-27": "#64413B",
  "nyx-bg-28": "#A26C57",
  "nyx-bg-29": "#7A4C44",
  "nyx-bg-30": "#8A4B3F",
  "nyx-bg-31": "#DFD3D2",
  "nyx-bg-32": "#6B4D51",
  "nyx-bg-33": "#DDC2A1",
  "nyx-bg-34": "#E4A18C",
  "nyx-bg-35": "#D58B50",
  "nyx-bg-36": "#CAA172",
  "nyx-bg-37": "#D64D98",
  "nyx-bg-38": "#BA694E",
  "nyx-bg-39": "#A64B64",
  "nyx-bg-40": "#6C473C",
  "elf-bite-02": "#9E765A",
  "elf-bite-03": "#D9B48F",
  "elf-bite-04": "#B97C8E",
  "elf-bite-05": "#9C5672",
  "elf-bite-06": "#BF8255",
  "elf-bite-07": "#6C6954",
  "elf-bite-08": "#8B5D77",
  "elf-bite-09": "#775A59",
  "elf-bite-10": "#BC7585",
  "cp-shock-01": "#A36843",
  "cp-shock-02": "#AD5765",
  "cp-shock-03": "#91556E",
  "cp-shock-04": "#CAA7B4",
  "cp-shock-05": "#584B7E",
  "cp-shock-06": "#9D8E6C",
  "cp-shock-07": "#A18476",
  "cp-shock-08": "#BAA18C",
  "nyx-ultimate-01": "#B28D70",
  "nyx-ultimate-05": "#B090A6",
  "nyx-ultimate-06": "#AC7779",
  "per-velvet-29": "#AA7C83",
  "per-mood-10": "#CB877C",
  "per-water-07": "#AE777D",
  "per-water-09": "#A980A0",
  "per-water-10": "#A36B8D",
  "clio-mesh-01": "#EFDBD2",
  "clio-mesh-03": "#EED2C9",
  "clio-concealer-01": "#F0D5C0",
  "clio-concealer-02": "#EDD0BE",
  "clio-concealer-05": "#D9B79E",
  "rom-juicy-01": "#BE727A",
  "rom-juicy-04": "#D56D75",
  "rom-juicy-12": "#B75F70",
  "rom-the-juicy-05": "#BE727A",
  "rom-the-juicy-06": "#B75F70",
  "rom-the-juicy-13": "#9B5C47",
  "rom-the-juicy-18": "#D88A82",
  "rom-the-juicy-21": "#9B5849",
  "rom-zo-gloss-03": "#B4D0C4",
  "rare-lip-oil-04": "#B16A86",
  "rare-lip-oil-05": "#B97978",
  "rare-lip-oil-06": "#A17A70",
  "rare-lip-oil-07": "#A76F68",
  "rare-lip-oil-08": "#9B5776",
  "rare-lip-stick-02": "#8F6049",
  "rare-lip-stick-03": "#D86148",
  "rare-lip-stick-04": "#BC5A9F",
  "rare-lip-stick-05": "#8D435B",
  "rare-lip-stick-06": "#67483E",
  "fenty-gloss-03": "#C0B5BC",
  "fenty-gloss-06": "#D08CA9",
  "fenty-gloss-08": "#D5A0A0",
  "fenty-gloss-09": "#AB777E",
  "fenty-gloss-14": "#C6A3A1",
  "fenty-gloss-15": "#D4B9A1",
  "fenty-gloss-16": "#875744",
  "fenty-gloss-19": "#9B6858",
  "fenty-gloss-20": "#DAA2B5",
  "cp-stix-01": "#D17C91",
  "cp-stix-03": "#D9A0A8",
  "cp-stix-05": "#C9887E",
  "cp-stix-06": "#C17574",
  "cp-stix-07": "#B47D8A",
  "cp-stix-08": "#B986A8",
  "cp-stix-09": "#DC9C84",
  "cp-stix-10": "#B1667A",
  "laneige-glaze-07": "#945E52",
  "cp-shadow-02": "#C79C75",
  "cp-shadow-03": "#B49CAC",
  "cp-shadow-05": "#9C6A78"
};

/**
 * Named color variants already listed by these official product pages.
 * Each goes to the relevant family selector; none implies a preselected shade.
 * Sources checked 2026-11-04: MERIT Flush Balm, Glossier Cloud Paint, Saie Dew Blush.
 */
const FAMILIES=[
  {
    "slug": "merit-flush-shade",
    "brand": "MERIT",
    "name": "Flush Balm Cream Blush",
    "url": "https://www.meritbeauty.com/products/flush-balm/",
    "subcategory": "blush",
    "shades": [
      [
        "Beverly Hills",
        "#D69888"
      ],
      [
        "Stockholm",
        "#E5A5B6"
      ],
      [
        "Archival",
        "#AC7594"
      ],
      [
        "Cheeky",
        "#BE819E"
      ],
      [
        "Le Bonbon",
        "#DE6B92"
      ],
      [
        "Fox",
        "#977568"
      ],
      [
        "Après",
        "#A45B75"
      ],
      [
        "Postmodern",
        "#945D63"
      ],
      [
        "Persimmon",
        "#D98266"
      ],
      [
        "Lusitano",
        "#D79C82"
      ],
      [
        "Rouge",
        "#BE4E56"
      ],
      [
        "Terracotta",
        "#B87C63"
      ],
      [
        "Bespoke",
        "#AF7378"
      ]
    ]
  },
  {
    "slug": "glossier-cloud-shade",
    "brand": "Glossier",
    "name": "Cloud Paint Cheek Color",
    "url": "https://www.glossier.com/products/cloud-paint",
    "subcategory": "blush",
    "shades": [
      [
        "Puff",
        "#E3A0B6"
      ],
      [
        "Beam",
        "#E89B83"
      ],
      [
        "Dusk",
        "#B98778"
      ],
      [
        "Haze",
        "#9A5278"
      ],
      [
        "Storm",
        "#9C5866"
      ],
      [
        "Eve",
        "#6D496A"
      ],
      [
        "Dawn",
        "#D17B65"
      ],
      [
        "Spark",
        "#D45F5D"
      ],
      [
        "Soar",
        "#C95794"
      ],
      [
        "Wisp",
        "#B8A1D4"
      ]
    ]
  },
  {
    "slug": "saie-dew-shade",
    "brand": "Saie",
    "name": "Dew Blush",
    "url": "https://saiehello.com/products/dew-blush",
    "subcategory": "blush",
    "shades": [
      [
        "Baby",
        "#E4A5BB"
      ],
      [
        "Rosy",
        "#C88796"
      ],
      [
        "Cutie",
        "#BD837E"
      ],
      [
        "Chilly",
        "#A77791"
      ],
      [
        "Sweetie",
        "#D889A0"
      ],
      [
        "Spicy",
        "#B96A55"
      ],
      [
        "Hottie",
        "#D98B55"
      ],
      [
        "Dreamy",
        "#A04E76"
      ],
      [
        "Poppy",
        "#DA745F"
      ],
      [
        "Flirty",
        "#DA7278"
      ],
      [
        "Lady",
        "#C28992"
      ]
    ]
  }
] as const;

export const ADDITIONAL_TRYON_SHADES:CatalogProduct[]=FAMILIES.flatMap(f=>
  f.shades.map(([shade,hex],i):CatalogProduct=>{
    const id=f.slug+"-"+String(i+1).padStart(2,"0");
    const offer:ProductOffer={
      id:"of-"+id+"-official",retailer:"official",url:f.url,
      reviewedDirect:true,exactShade:false,affiliateReady:false,
      lastCheckedAt:"2026-11-04"
    };
    return {
      id,brand:f.brand,name:f.name+" · "+shade,
      category:"makeup",subcategory:f.subcategory,colorHex:hex,
      description:"Palevie illustrative blush preview. Choose the named shade on the official product page.",
      tags:["official-family-link","illustrative-preview","conceptual-tone"],
      offers:[offer]
    };
  })
);
