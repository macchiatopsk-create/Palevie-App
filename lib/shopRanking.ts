/**
 * Curated Korean-first shop discovery order. This is not a best-seller chart
 * or a claim about Amazon sales, and the order within the Korean group is
 * editorial rather than based on measured popularity.
 *
 * Keep shoppers' choice broad: alternate Korean brands before moving on to
 * the international group, rather than filling the first screen with one brand.
 */
export const KOREAN_BRAND_ORDER = [
  "Laneige", "TIRTIR", "rom&nd", "Peripera", "CLIO", "Etude",
  "Beauty of Joseon", "COSRX", "Anua", "Round Lab", "Illiyoon",
  "Mediheal", "goodal", "Some By Mi", "the SAEM",
] as const;

export const INTERNATIONAL_BRAND_ORDER = [
  "e.l.f.", "Maybelline", "NYX", "ColourPop", "Rare Beauty",
  "NARS", "Milani", "Physicians Formula",
] as const;

const koreanRank = new Map<string,number>(KOREAN_BRAND_ORDER.map((brand,i)=>[brand,i]));
const globalRank = new Map<string,number>(INTERNATIONAL_BRAND_ORDER.map((brand,i)=>[brand,i]));

export type FeaturedShopItem = {
  id:string;
  brand:string;
  category:string;
  match?:number;
  tags?:string[];
  offers:{affiliateReady?:boolean}[];
};

function rotateBrands<T extends FeaturedShopItem>(items:readonly T[],rank:Map<string,number>):T[] {
  const grouped=new Map<string,T[]>();
  for(const p of items){
    const list=grouped.get(p.brand)??[];
    list.push(p);
    grouped.set(p.brand,list);
  }
  const brands=[...grouped.keys()].sort((a,b)=>{
    const ar=rank.get(a),br=rank.get(b);
    return (ar??Number.MAX_SAFE_INTEGER)-(br??Number.MAX_SAFE_INTEGER) || a.localeCompare(b);
  });
  for(const products of grouped.values()){
    products.sort((a,b)=>
      Number(Boolean(b.offers[0]?.affiliateReady))-Number(Boolean(a.offers[0]?.affiliateReady))
      || Number(Boolean(b.tags?.includes("brand-digital-swatch")))-Number(Boolean(a.tags?.includes("brand-digital-swatch")))
      || (b.match??-1)-(a.match??-1)
    );
  }
  const ordered:T[]=[];
  let remain=items.length;
  while(remain){
    for(const brand of brands){
      const item=grouped.get(brand)?.shift();
      if(item){ordered.push(item);remain--;}
    }
  }
  return ordered;
}

export function featuredShopOrder<T extends FeaturedShopItem>(items:readonly T[]):T[] {
  // All Korean brands precede international ones, without any single
  // Korean brand monopolizing the opening rows.
  return [
    ...rotateBrands(items.filter(p=>koreanRank.has(p.brand)),koreanRank),
    ...rotateBrands(items.filter(p=>!koreanRank.has(p.brand)),globalRank),
  ];
}
