import type {CatalogProduct} from "@/lib/types";

/**
 * Original vector packshots. They borrow only broad real-world bottle/compact
 * silhouettes and category colors, never official product images or logo art.
 * Product name text is a factual label; packaging is an illustration.
 */
type Item=Pick<CatalogProduct,"id"|"brand"|"name"|"category"|"subcategory"|"colorHex">;
export default function ShopProductVisual({product:p}:{product:Item}){
  const id="pv-"+p.id.replace(/[^a-z0-9-]/gi,"");
  const tone=/^#[0-9a-f]{6}$/i.test(p.colorHex||"")?p.colorHex!:
    p.brand==="Round Lab"?"#BDDEEF":p.brand==="Anua"?"#DFEBC5":
    p.brand==="Laneige"?"#B8CFEE":p.brand==="COSRX"?"#E7DDC7":"#EACEDB";
  const brand=p.brand.toUpperCase().replace(/&/g,"&");
  const family=p.name.split(" · ")[0];
  const shortFamily=family.length>21?family.slice(0,20)+"…":family;
  const brandSize=brand.length>16?7.5:brand.length>10?9:12;
  const gold=p.brand==="Milani"||p.brand==="Rare Beauty";
  const stroke=gold?"#BA9D76":"#9E8190";
  const cap=p.brand==="NYX"||p.brand==="Maybelline"||p.brand==="COSRX"?"#342A36":
    p.brand==="TIRTIR"?"#AD2538":gold?"#DFC6A0":"#EFE2EA";
  const logo=(y:number,size=brandSize,color="#5D4755")=><text x="110" y={y} textAnchor="middle" fill={color} fontSize={size} fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" letterSpacing=".35">{brand}</text>;
  const line=(y:number,max=20,color="#927785")=><text x="110" y={y} textAnchor="middle" fill={color} fontSize={8} fontFamily="Arial, Helvetica, sans-serif">{family.slice(0,max)}</text>;
  const shine=<><path d="M91 92v60" stroke="#fff" strokeWidth="7" strokeLinecap="round" opacity=".35"/><path d="M136 92v62" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".26"/></>;
  let packshot;
  if(p.category==="skincare"&&p.brand==="Beauty of Joseon"){
    packshot=<>
      <rect x="83" y="61" width="54" height="117" rx="14" fill={`url(#${id}-glass)`} stroke={stroke} strokeWidth="1.6"/>
      <rect x="89" y="49" width="42" height="16" rx="3" fill="#303039"/>
      <path d="M110 48V27" stroke="#34323C" strokeWidth="5"/><rect x="105" y="20" width="10" height="19" rx="4" fill="#34323C"/>
      <rect x="90" y="94" width="40" height="57" rx="2" fill="#F7F0DE" stroke="#DCCEB6"/>
      <text x="110" y="116" textAnchor="middle" fontSize="6.5" fill="#725B45" fontWeight="700">Beauty of</text>
      <text x="110" y="124" textAnchor="middle" fontSize="7.8" fill="#725B45" fontWeight="700">Joseon</text>
      <path d="M100 135h20" stroke="#BBAD90" strokeWidth="1.5"/>
    </>;
  } else if(p.category==="skincare"&&p.subcategory==="serum"){
    packshot=<>
      <rect x="79" y="63" width="62" height="116" rx="12" fill={`url(#${id}-glass)`} stroke={stroke} strokeWidth="1.6"/>
      <rect x="86" y="53" width="48" height="13" rx="2" fill={cap}/>
      <rect x="96" y="34" width="28" height="22" rx="5" fill={cap}/>
      <rect x="105" y="24" width="10" height="13" rx="3" fill={cap}/>
      <rect x="86" y="100" width="48" height="49" rx="3" fill="#FFFEFC" stroke="#E7DEE0"/>
      {logo(119,brandSize,"#3B3037")}{line(133,19,"#806A77")}
      <path d="M85 76v23" stroke="#fff" strokeWidth="5" opacity=".7"/>
    </>;
  } else if(p.category==="skincare"&&p.subcategory==="toner"){
    packshot=<>
      <rect x="76" y="50" width="68" height="129" rx="13" fill={`url(#${id}-glass)`} stroke={stroke} strokeWidth="1.6"/>
      <rect x="87" y="32" width="46" height="24" rx="5" fill={cap} stroke={stroke} strokeWidth="1"/>
      <rect x="81" y="94" width="58" height="64" rx="2" fill="#FFFAFB" opacity=".9"/>
      {logo(113,brandSize,"#4F4851")}{line(129,17)}
      <path d="M82 64v30" stroke="#fff" strokeWidth="5" opacity=".55"/>
      <path d="M89 145h41" stroke={tone} strokeWidth="5" strokeLinecap="round" opacity=".7"/>
    </>;
  } else if(p.category==="skincare"&&["sunscreen","cleanser"].includes(p.subcategory)){
    packshot=<>
      <path d="M79 50 Q110 45 141 50 L132 172 Q110 180 88 172 Z" fill={`url(#${id}-tube)`} stroke={stroke} strokeWidth="1.6"/>
      <rect x="93" y="171" width="34" height="16" rx="4" fill="#E5DCE0" stroke={stroke} strokeWidth="1"/>
      <rect x="91" y="96" width="38" height="48" rx="6" fill={tone} opacity=".48"/>
      {logo(110,brandSize,"#554758")}
      <text x="110" y="128" textAnchor="middle" fill="#766477" fontSize="8" fontWeight="700">{p.subcategory==="sunscreen"?"SUN CARE":"CLEANSER"}</text>
      <path d="M89 59l-1 32" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".85"/>
      <path d="M130 55l-3 38" stroke="#D5B9C6" strokeWidth="2" opacity=".35"/>
    </>;
  } else if(p.category==="skincare"){
    packshot=<>
      <rect x="56" y="89" width="108" height="76" rx="26" fill={`url(#${id}-jar)`} stroke={stroke} strokeWidth="1.6"/>
      <rect x="61" y="72" width="98" height="25" rx="10" fill={cap} stroke={stroke} strokeWidth="1.2"/>
      <path d="M67 84h85" stroke="#fff" strokeWidth="3" opacity=".45"/>
      <rect x="68" y="111" width="84" height="34" rx="6" fill="#FFFBF9" opacity=".86"/>
      {logo(127,brandSize,"#655A65")}
      <text x="110" y="138" textAnchor="middle" fill="#8C7982" fontSize="7">MOISTURE CREAM</text>
    </>;
  } else if(p.brand==="TIRTIR"&&p.subcategory==="cushion"){
    packshot=<>
      <ellipse cx="110" cy="134" rx="62" ry="57" fill="#B72338" stroke="#8B1F35" strokeWidth="4"/>
      <ellipse cx="110" cy="129" rx="57" ry="54" fill={`url(#${id}-red)`} stroke="#DE8290" strokeWidth="2"/>
      <ellipse cx="110" cy="124" rx="47" ry="45" fill="none" stroke="#EBA7B1" strokeWidth="2" opacity=".7"/>
      <text x="110" y="120" fill="#fff9f9" textAnchor="middle" fontSize="18" fontWeight="800" letterSpacing="1.2">TIRTIR</text>
      <text x="110" y="139" fill="#FFDCE0" textAnchor="middle" fontSize="8">MASK FIT</text>
      <text x="110" y="151" fill="#FFDCE0" textAnchor="middle" fontSize="8">RED CUSHION</text>
    </>;
  } else if(p.subcategory==="concealer"){
    packshot=<>
      <rect x="86" y="33" width="48" height="58" rx="10" fill={`url(#${id}-dark)`} stroke={stroke} strokeWidth="1.6"/>
      <rect x="81" y="90" width="58" height="101" rx="15" fill={`url(#${id}-glass)`} stroke={stroke} strokeWidth="2"/>
      <rect x="89" y="100" width="42" height="82" rx="11" fill={tone} opacity=".77"/>
      <path d="M96 105v68" stroke="#fff" strokeWidth="5" opacity=".37" strokeLinecap="round"/>
      {logo(139,brandSize,"#5E424A")}
      <text x="110" y="152" textAnchor="middle" fontSize="6.5" fill="#6E5864">CONCEAL</text>
    </>;
  } else if(p.subcategory==="cushion"){
    packshot=<>
      <circle cx="110" cy="124" r="57" fill={`url(#${id}-jar)`} stroke={stroke} strokeWidth="3"/>
      <circle cx="110" cy="124" r="47" fill={tone} opacity=".43" stroke="#fff" strokeWidth="2"/>
      {logo(121,brandSize)}<text x="110" y="135" textAnchor="middle" fontSize="8" fill="#6C5966">CUSHION</text>
    </>;
  } else if(p.brand==="Rare Beauty"&&p.subcategory==="blush"&&p.name.includes("Liquid")){
    packshot=<>
      <circle cx="110" cy="43" r="20" fill={`url(#${id}-metal)`} stroke="#BFA99E" strokeWidth="1"/>
      <rect x="83" y="64" width="54" height="115" rx="20" fill={`url(#${id}-glass)`} stroke="#BFA89C" strokeWidth="1.6"/>
      <rect x="90" y="95" width="40" height="70" rx="13" fill={tone} opacity=".83"/>
      <path d="M89 75v82" stroke="#fff" strokeWidth="7" strokeLinecap="round" opacity=".3"/>
      {logo(129,9,"#FFF9FA")}<text x="110" y="141" textAnchor="middle" fontSize="7" fill="#FFF9FA">soft pinch</text>
    </>;
  } else if(p.subcategory==="blush"||p.subcategory==="highlighter"){
    packshot=<>
      <circle cx="110" cy="124" r="59" fill={p.brand==="Milani"?"#D4B16F":"#E9DBE5"} stroke={stroke} strokeWidth="2.4"/>
      <circle cx="110" cy="119" r="50" fill={`url(#${id}-metal)`} stroke="#F8E9CC" strokeWidth="1.3"/>
      <circle cx="110" cy="118" r="43" fill={tone} stroke={p.brand==="Milani"?"#E8D0A0":"#F8EDF2"} strokeWidth="2"/>
      <path d="M80 99c20-14 42-11 59 4" fill="none" stroke="#fff" strokeWidth="4" opacity=".25"/>
      <path d="M90 133c14 8 26 10 39 4" fill="none" stroke="#fff" strokeWidth="4" opacity=".18"/>
      {logo(116,p.brand==="Milani"?13:brandSize,p.brand==="Milani"?"#FFF9EB":"#654757")}
      <text x="110" y="132" textAnchor="middle" fontSize="7.5" fill={p.brand==="Milani"?"#FFF9EB":"#6E5B68"}>{p.subcategory==="blush"?"BLUSH":"GLOW"}</text>
    </>;
  } else if(p.subcategory==="eyeshadow"){
    packshot=<>
      <rect x="40" y="70" width="140" height="101" rx="12" fill={p.brand==="CLIO"?"#342C35":"#E9DDE7"} stroke={stroke} strokeWidth="2"/>
      <rect x="47" y="77" width="126" height="76" rx="6" fill="#F7EEF2" stroke="#CDB4C2" strokeWidth="1"/>
      {[0,1,2,3].map((i)=><rect key={i} x={56+i*29} y="92" width="25" height="43" rx="7" fill={[tone,"#BFA0A9","#D49E8A","#77505E"][i]} stroke="#fff" strokeWidth="1.5"/>)}
      <path d="M48 80h123" stroke="#fff" strokeWidth="3" opacity=".7"/>
      {logo(162,p.brand==="CLIO"?13:brandSize,"#F6E9F2")}
    </>;
  } else if(p.brand==="Maybelline"&&p.name.includes("Vinyl Ink")){
    packshot=<>
      <rect x="77" y="39" width="66" height="65" rx="9" fill={`url(#${id}-dark)`} stroke="#3E3039" strokeWidth="2"/>
      <rect x="73" y="97" width="74" height="87" rx="10" fill={`url(#${id}-glass)`} stroke={stroke} strokeWidth="1.6"/>
      <rect x="78" y="112" width="64" height="65" rx="7" fill={tone} opacity=".94"/>
      <path d="M84 48v45M80 114v55" stroke="#fff" strokeWidth="6" opacity=".20" strokeLinecap="round"/>
      <text x="110" y="70" textAnchor="middle" fill="#FFF7F7" fontSize="8.5" fontWeight="800">MAYBELLINE</text>
      <text x="110" y="133" textAnchor="middle" fill="#FFF5F5" fontSize="10" fontWeight="800">VINYL</text>
      <text x="110" y="147" textAnchor="middle" fill="#FFF5F5" fontSize="10" fontWeight="800">INK</text>
    </>;
  } else if(p.subcategory==="gloss"||p.name.includes("Lip Oil")||p.name.includes("Lip Cream")){
    packshot=<>
      <rect x="83" y="28" width="54" height="62" rx="10" fill={`url(#${id}-dark)`} stroke="#4D3549" strokeWidth="1.4"/>
      <path d="M87 33v48" stroke="#fff" strokeWidth="5" opacity=".15"/>
      <rect x="80" y="84" width="60" height="104" rx="14" fill={`url(#${id}-glass)`} stroke={stroke} strokeWidth="1.4"/>
      <rect x="88" y="94" width="44" height="86" rx="11" fill={tone} opacity=".73"/>
      {shine}
      <rect x="89" y="119" width="42" height="35" rx="3" fill="#FFFAFA" opacity=".68"/>
      {logo(134,p.brand==="Maybelline"?8:brandSize,"#51404A")}
      <text x="110" y="145" textAnchor="middle" fontSize="6.5" fill="#795E6C">{p.brand==="NYX"?"BUTTER GLOSS":"LIP COLOR"}</text>
    </>;
  } else if(p.subcategory==="lip"){
    packshot=<>
      <rect x="83" y="104" width="54" height="80" rx="7" fill={`url(#${id}-dark)`} stroke="#564553" strokeWidth="2"/>
      <rect x="92" y="82" width="36" height="28" rx="3" fill={`url(#${id}-metal)`} stroke={stroke} strokeWidth="1"/>
      <path d="M95 81V51Q96 37 106 31L125 25V81Z" fill={tone} stroke="#B97485" strokeWidth="1.7"/>
      <path d="M99 53v25" stroke="#fff" strokeWidth="4" opacity=".3"/>
      {logo(151,brandSize,"#FFF4F8")}
    </>;
  } else {
    packshot=<>
      <rect x="79" y="59" width="62" height="120" rx="15" fill={`url(#${id}-glass)`} stroke={stroke} strokeWidth="2"/>
      <rect x="90" y="45" width="40" height="19" rx="6" fill={cap} stroke={stroke} strokeWidth="1"/>
      <rect x="88" y="101" width="44" height="49" rx="4" fill={tone} opacity=".67"/>
      {logo(131,brandSize)}{line(143,16)}
    </>;
  }
  return <svg className="sh-packshot-svg sh-packshot-rich" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id={id+"-glass"} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#E5D8DE"/><stop offset=".17" stopColor="#FFFBFD"/>
        <stop offset=".58" stopColor={tone}/><stop offset="1" stopColor="#BFA7B1"/>
      </linearGradient>
      <linearGradient id={id+"-metal"} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFFDFD"/><stop offset=".55" stopColor="#E3CBBE"/><stop offset="1" stopColor="#C3A9A5"/>
      </linearGradient>
      <linearGradient id={id+"-dark"} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#635564"/><stop offset=".45" stopColor={cap}/><stop offset="1" stopColor="#291F2B"/>
      </linearGradient>
      <linearGradient id={id+"-tube"} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#E9DDE4"/><stop offset=".28" stopColor="#FFFCFD"/><stop offset=".8" stopColor="#FEFAFD"/><stop offset="1" stopColor="#D9C8D3"/>
      </linearGradient>
      <linearGradient id={id+"-jar"} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFFBFC"/><stop offset=".54" stopColor="#F2E6E9"/><stop offset="1" stopColor={tone}/>
      </linearGradient>
      <linearGradient id={id+"-red"} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#F15E66"/><stop offset=".7" stopColor="#C83348"/><stop offset="1" stopColor="#951D35"/>
      </linearGradient>
    </defs>
    <ellipse cx="110" cy="194" rx="57" ry="9" fill="#9D8091" opacity=".12"/>
    {packshot}
    <text x="110" y="211" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="7.2" fill="#A38595" letterSpacing=".55">{shortFamily.toUpperCase()}</text>
  </svg>;
}
