/**
 * MERIT official single-shade swatch photographs pixel audit, 2026-11-04.
 *
 * Sample method: fetch official 352px JPEG, mask the off-white/neutral studio
 * backdrop by pigment chroma (max-min > max(17, max*.065), max<249, min<245),
 * compute per-channel median over colored pixels in the central 68% frame.
 * Typical swatch is a single tapered colored brushstroke on a neutral backdrop.
 *
 * Five low-variance images are used strictly as photo-derived screen examples;
 * eight are held for ambiguous hue descriptions or center-channel variance.
 * These are NOT sampled physical pigments, calibration data, or predictions of
 * how blush will look on different skin tones. No images are stored/reused.
 * Re-run manually via npm run audit:merit-swatches; never fetch on production.
 */
export type MeritPhotoSwatch={
 shade:string;hex:string;source:string;
 method:"center-pigment-masked-jpeg-median-v1";
 width:352;height:352;centerPigmentFraction:number;
 channelMedianAbsoluteDeviation:readonly [number,number,number];
 recordedOn:"2026-11-04";applied:boolean;
};
export const MERIT_PHOTO_SWATCHES:Readonly<Record<string,MeritPhotoSwatch>>={
  "merit-flush-shade-01": {
    "shade": "Beverly Hills",
    "hex": "#D26E65",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-BeverlyHills-Swatch.jpg?v=1752587581&width=352",
    "method": "center-pigment-masked-jpeg-median-v1",
    "width": 352,
    "height": 352,
    "centerPigmentFraction": 0.3,
    "channelMedianAbsoluteDeviation": [
      7,
      3,
      3
    ],
    "recordedOn": "2026-11-04",
    "applied": true
  },
  "merit-flush-shade-02": {
    "shade": "Stockholm",
    "hex": "#E58691",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-Stockholm-Swatch.jpg?v=1744400861&width=352",
    "method": "center-pigment-masked-jpeg-median-v1",
    "width": 352,
    "height": 352,
    "centerPigmentFraction": 0.272,
    "channelMedianAbsoluteDeviation": [
      5,
      4,
      2
    ],
    "recordedOn": "2026-11-04",
    "applied": true
  },
  "merit-flush-shade-03": {
    "shade": "Archival",
    "hex": "#AE5F61",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-Archival-Swatch.jpg?v=1752587584&width=352",
    "method": "center-pigment-masked-jpeg-median-v1",
    "width": 352,
    "height": 352,
    "centerPigmentFraction": 0.317,
    "channelMedianAbsoluteDeviation": [
      2,
      1,
      2
    ],
    "recordedOn": "2026-11-04",
    "applied": false
  },
  "merit-flush-shade-04": {
    "shade": "Cheeky",
    "hex": "#C2666F",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-Cheeky-Swatch.jpg?v=1752587584&width=352",
    "method": "center-pigment-masked-jpeg-median-v1",
    "width": 352,
    "height": 352,
    "centerPigmentFraction": 0.312,
    "channelMedianAbsoluteDeviation": [
      3,
      2,
      2
    ],
    "recordedOn": "2026-11-04",
    "applied": false
  },
  "merit-flush-shade-05": {
    "shade": "Le Bonbon",
    "hex": "#D53961",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-LeBonBon-Swatch.jpg?v=1744400866&width=352",
    "method": "center-pigment-masked-jpeg-median-v1",
    "width": 352,
    "height": 352,
    "centerPigmentFraction": 0.293,
    "channelMedianAbsoluteDeviation": [
      8,
      4,
      5
    ],
    "recordedOn": "2026-11-04",
    "applied": true
  },
  "merit-flush-shade-06": {
    "shade": "Fox",
    "hex": "#9E4543",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-Fox-Swatch.jpg?v=1744400858&width=352",
    "method": "center-pigment-masked-jpeg-median-v1",
    "width": 352,
    "height": 352,
    "centerPigmentFraction": 0.309,
    "channelMedianAbsoluteDeviation": [
      4,
      1,
      1
    ],
    "recordedOn": "2026-11-04",
    "applied": false
  },
  "merit-flush-shade-07": {
    "shade": "Après",
    "hex": "#961F2B",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-Apres-Swatch.jpg?v=1752587584&width=352",
    "method": "center-pigment-masked-jpeg-median-v1",
    "width": 352,
    "height": 352,
    "centerPigmentFraction": 0.295,
    "channelMedianAbsoluteDeviation": [
      43,
      6,
      11
    ],
    "recordedOn": "2026-11-04",
    "applied": false
  },
  "merit-flush-shade-08": {
    "shade": "Postmodern",
    "hex": "#782726",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-Postmodern-Swatch.jpg?v=1744400863&width=352",
    "method": "center-pigment-masked-jpeg-median-v1",
    "width": 352,
    "height": 352,
    "centerPigmentFraction": 0.301,
    "channelMedianAbsoluteDeviation": [
      7,
      2,
      2
    ],
    "recordedOn": "2026-11-04",
    "applied": true
  },
  "merit-flush-shade-09": {
    "shade": "Persimmon",
    "hex": "#BC3D26",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-Persimmon-Swatch.jpg?v=1744400859&width=352",
    "method": "center-pigment-masked-jpeg-median-v1",
    "width": 352,
    "height": 352,
    "centerPigmentFraction": 0.303,
    "channelMedianAbsoluteDeviation": [
      25,
      8,
      4
    ],
    "recordedOn": "2026-11-04",
    "applied": false
  },
  "merit-flush-shade-10": {
    "shade": "Lusitano",
    "hex": "#E65B4E",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-Lusitano-Swatch.jpg?v=1744400865&width=352",
    "method": "center-pigment-masked-jpeg-median-v1",
    "width": 352,
    "height": 352,
    "centerPigmentFraction": 0.274,
    "channelMedianAbsoluteDeviation": [
      5,
      4,
      3
    ],
    "recordedOn": "2026-11-04",
    "applied": false
  },
  "merit-flush-shade-11": {
    "shade": "Rouge",
    "hex": "#D01F35",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-Rouge-Swatch.jpg?v=1744400862&width=352",
    "method": "center-pigment-masked-jpeg-median-v1",
    "width": 352,
    "height": 352,
    "centerPigmentFraction": 0.233,
    "channelMedianAbsoluteDeviation": [
      20,
      4,
      5
    ],
    "recordedOn": "2026-11-04",
    "applied": false
  },
  "merit-flush-shade-12": {
    "shade": "Terracotta",
    "hex": "#C97B58",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-Terracotta-Swatch.jpg?v=1744400868&width=352",
    "method": "center-pigment-masked-jpeg-median-v1",
    "width": 352,
    "height": 352,
    "centerPigmentFraction": 0.275,
    "channelMedianAbsoluteDeviation": [
      14,
      12,
      4
    ],
    "recordedOn": "2026-11-04",
    "applied": true
  },
  "merit-flush-shade-13": {
    "shade": "Bespoke",
    "hex": "#925254",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-Bespoke-Swatch.jpg?v=1744400867&width=352",
    "method": "center-pigment-masked-jpeg-median-v1",
    "width": 352,
    "height": 352,
    "centerPigmentFraction": 0.328,
    "channelMedianAbsoluteDeviation": [
      14,
      6,
      7
    ],
    "recordedOn": "2026-11-04",
    "applied": false
  }
};
