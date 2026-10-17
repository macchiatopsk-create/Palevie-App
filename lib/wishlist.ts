import type { StylePiece,StyleId } from "./style";
import {safeStorage,readStoredJson} from "./safeStorage";
export type SavedStylePiece=StylePiece&{kind:"style";id:string;style:StyleId;toneId:string;addedAt:string};
export type SavedProduct={kind:"product";id:string;productId:string;addedAt:string};
export type SavedItem=SavedStylePiece|SavedProduct;
const KEY="palevie-wishlist-v1",MAX=60;
export const WISHLIST_EVENT="palevie-wishlist-changed";
export const pieceId=(style:StyleId,query:string)=>`${style}:${query}`;
export const productKey=(productId:string)=>`product:${productId}`;
function normalize(value:unknown):SavedItem[]{
  if(!Array.isArray(value))return [];
  const seen=new Set<string>(),items:SavedItem[]=[];
  for(const raw of value){
    if(!raw||typeof raw!=="object"||Array.isArray(raw)||typeof raw.id!=="string"||seen.has(raw.id))continue;
    const item={...raw,kind:raw.kind||"style"};
    if(item.kind==="product"&&typeof item.productId!=="string")continue;
    if(item.kind==="style"&&(typeof item.query!=="string"||typeof item.label!=="string"||typeof item.style!=="string"))continue;
    if(item.kind!=="product"&&item.kind!=="style")continue;
    seen.add(item.id);items.push(item as SavedItem);if(items.length===MAX)break;
  }
  return items;
}
export function loadWishlist():SavedItem[]{return normalize(readStoredJson(KEY));}
function persist(items:SavedItem[]):SavedItem[]{const next=normalize(items);safeStorage.setItem(KEY,JSON.stringify(next));if(typeof window!=="undefined")window.dispatchEvent(new Event(WISHLIST_EVENT));return next;}
export function replaceWishlist(items:SavedItem[]):SavedItem[]{return persist(items);}
export function isSaved(id:string,items?:SavedItem[]){return (items??loadWishlist()).some(i=>i.id===id);}
export function toggleSaved(piece:StylePiece,style:StyleId,toneId:string):{items:SavedItem[];saved:boolean}{const id=pieceId(style,piece.query),items=loadWishlist();if(items.some(i=>i.id===id))return {items:persist(items.filter(i=>i.id!==id)),saved:false};return {items:persist([{...piece,kind:"style",id,style,toneId,addedAt:new Date().toISOString()},...items]),saved:true};}
export function toggleProduct(productId:string):{items:SavedItem[];saved:boolean}{const id=productKey(productId),items=loadWishlist();if(items.some(i=>i.id===id))return {items:persist(items.filter(i=>i.id!==id)),saved:false};return {items:persist([{kind:"product",id,productId,addedAt:new Date().toISOString()},...items]),saved:true};}
export function removeSaved(id:string):SavedItem[]{return persist(loadWishlist().filter(i=>i.id!==id));}
