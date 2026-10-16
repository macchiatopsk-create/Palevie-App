/**
 * US Amazon shade-specific ASIN map. Each entry is a real `amazon.com/dp/ASIN`
 * with selected color/size corroborated on Amazon's detail-page variation data
 * or an exact-title US item page. This is not a live price/stock guarantee.
 * Source family pages inspected 2026-10-15:
 * https://www.amazon.com/dp/B09F4MFNWY (NYX Butter Gloss variation mapping)
 * https://www.amazon.com/dp/B085S9HD3L (Maybelline Lifter Gloss variation mapping)
 * https://www.amazon.com/dp/B0CL8W1HZQ (e.l.f. Glow Reviver shade options)
 * https://www.amazon.com/dp/B09T418D54 (Rare Beauty Liquid Blush)
 * https://www.amazon.com/dp/B085P2FL8B (e.l.f. Bite-Size Eyeshadow)
 * Avoid multipacks and leave absent shades unmapped. The Bare Grape
 * Amazon.co.jp ASIN remains US-variant unverified; do not reinsert it.
 */
export const researchedAmazonAsins: Readonly<Record<string,string>> = {
  // NYX Butter Gloss
  "nyx-bg-01": "B00BKH3Q58",
  "nyx-bg-02": "B00BKH7ZDC",
  "nyx-bg-03": "B00BKH9HRE",
  "nyx-bg-04": "B00BKHDF9A",
  "nyx-bg-05": "B00BKHFXWW",
  "nyx-bg-06": "B00BKH59G2",
  "nyx-bg-07": "B00ICS9JN6",
  "nyx-bg-08": "B00ICT8JRC",
  "nyx-bg-09": "B00ICTZ3YE",
  "nyx-bg-10": "B00ICU1JIC",
  "nyx-bg-11": "B00ICU2UZS",
  "nyx-bg-12": "B00ICULJ5K",
  "nyx-bg-13": "B00ICUJ8S0",
  "nyx-bg-14": "B0725VJFVJ",
  "nyx-bg-15": "B083RQY6FY",
  "nyx-bg-16": "B083RQS7CH",
  "nyx-bg-17": "B0845HGBYP",
  "nyx-bg-18": "B0845HLJDR",
  "nyx-bg-19": "B0845HDTXF",
  "nyx-bg-20": "B0845HDTXG",
  "nyx-bg-21": "B0845HT37C",
  "nyx-bg-22": "B083RR5CFQ",
  "nyx-bg-23": "B0924YTG91",
  "nyx-bg-24": "B0924X16TJ",
  "nyx-bg-25": "B0924Z3M9X",
  "nyx-bg-26": "B0924V4PLT",
  "nyx-bg-27": "B09F4MFNWY",
  "nyx-bg-28": "B09F3XXDFR",
  "nyx-bg-29": "B09F3W62FN",
  "nyx-bg-30": "B09F4FKX37",
  "nyx-bg-31": "B09SP2XHKT",
  "nyx-bg-32": "B0CCWXC21V",
  "nyx-bg-33": "B0CX74X16K",
  "nyx-bg-34": "B0CX7KS5Q2",
  "nyx-bg-35": "B0CX7L1B3D",
  "nyx-bg-36": "B0CX7DJ5W4",
  "nyx-bg-37": "B0CX7PMCL8",
  "nyx-bg-39": "B0CXRYYQQX",
  "nyx-bg-40": "B0CXRPVWPT",
  // Maybelline Lifter Gloss
  "may-lifter-01": "B085S9HD3L",
  "may-lifter-02": "B085S9N6JP",
  "may-lifter-03": "B085S9YFR5",
  "may-lifter-04": "B085S9YFR9",
  "may-lifter-05": "B085S94V2K",
  "may-lifter-06": "B085S96KS4",
  "may-lifter-07": "B085S8SRF8",
  "may-lifter-08": "B085S9JBD1",
  "may-lifter-09": "B091HZ6TZ8",
  "may-lifter-10": "B091HYFZD9",
  "may-lifter-11": "B091J1GCHL",
  "may-lifter-12": "B0C1MH8R2M",
  "may-lifter-13": "B0C1MBCGKH",
  "may-lifter-14": "B0C1MDXSLD",
  "may-lifter-15": "B0C1M7XYHS",
  "may-lifter-16": "B0DZD9P3SB",
  "may-lifter-17": "B0DZDBBLYS",
  "may-lifter-18": "B0DZD8KVLS",
  "may-lifter-19": "B0DZDBBTQP",
  "may-lifter-20": "B0DZD8XH5X",
  // e.l.f. Glow Reviver Lip Oil
  "elf-oil-01": "B0CL8W1HZQ",
  "elf-oil-02": "B0CMJZVT5P",
  "elf-oil-03": "B0CMJZ8G6Y",
  "elf-oil-04": "B0CLRMVBVM",
  "elf-oil-05": "B0CLRPWT11",
  "elf-oil-06": "B0CMJXGCFQ",
  "elf-oil-07": "B0CLRMZ4S2",
  "elf-oil-08": "B0DFMW6VZV",
  "elf-oil-09": "B0DFMX8YWJ",
  "elf-oil-10": "B0DFMWGXYL",
  // Rare Beauty Soft Pinch Liquid Blush
  "rare-pinch-01": "B09T418D54",
  "rare-pinch-06": "B0C1GY3BPH",
  "rare-pinch-07": "B08KXK95C4",
  "rare-pinch-09": "B08KFPVVXY",
  "rare-pinch-10": "B08L79L91T",
  "rare-pinch-14": "B09T3W9L5D",
  "rare-pinch-15": "B09T3W1M3D",
  // e.l.f. Bite-Size Eyeshadow
  "elf-bite-02": "B0B432CK33",
  "elf-bite-03": "B085P318XM",
  "elf-bite-04": "B085P2FL8B",
  "elf-bite-05": "B085P2V45X",
  "elf-bite-06": "B085P3CCQP",
  "elf-bite-07": "B094SXS84D",
  "elf-bite-08": "B09JL59M8K",
  "elf-bite-10": "B085P21LBX",
  // Rare Beauty Matte Bouncy Blush
  "rare-bouncy-01": "B0DY6PVJKW",
  "rare-bouncy-02": "B0F44C7R7B",
  // Other verified options
  "cp-shock-04": "B0799P831X",
  "cp-shock-08": "B0784D39L9",
  "elf-putty-tahiti": "B0947CYBHW",
  "rare-pinch-joy": "B08KFPVVXY", // Same Soft Pinch Liquid Blush Joy as rare-pinch-09
  "nyx-smlc-istanbul": "B004LXJOBI", // NYX Soft Matte Lip Cream Istanbul — Amazon variation 1 Count (Pack of 1)
  "mbl-matte-lover": "B06XF16MWM",
  "sk-cosrx-bha": "B00OZEJ8R8",
  // US Amazon exact individual listing/variation spot-check, Oct 2026
  "rmd-jlt-09": "B087BHZQQV", // Juicy Lasting Tint 09 Litchi Coral
  "ppr-ink-17": "B0F242ZPX5", // Ink the Velvet 17 Rosy Nude
  "ppr-ink-08": "B0FB1FMPHZ", // Ink the Velvet 08 Sellout Red
  "elf-halo-fair": "B0B5MG15B2", // Halo Glow Liquid Filter 1 Fair
  "tirtir-21n": "B09LCMQM44", // Mask Fit Red Cushion 21N Ivory, 0.63 fl oz single
  "lng-sleep": "B0F7ZJQP4K", // Water Sleeping Mask
  "sk-some-aha": "B07BYJF7L7", // SOME BY MI AHA BHA PHA Toner single 150 ml
  "sk-round-panthe": "B08FM81QBZ", // ROUND LAB 1025 Dokdo Cream 2.71 fl oz single
  "elf-bite-09": "B085P2NG1C", // Bite-Size Eyeshadow Truffles
  "nyx-ultimate-05": "B08GPT8N32", // Ultimate Shadow Palette Utopia
  "nyx-ultimate-06": "B09QMH2DKM", // Ultimate Shadow Palette Ultimate Queen
  "nyx-ultimate-01": "B01IW02HX2", // Ultimate Shadow Palette Warm Neutrals
  "clio-pro-02": "B09NRBYPNW", // Pro Eye Palette 002 Brown Choux
  "cp-shock-01": "B0DZ1D8DRZ", // Super Shock Shadow DGAF single
  // Rare Beauty Matte Bouncy Blush: full-size US Amazon pages checked Oct 2026
  "rare-bouncy-05": "B0F44B5G87", // Worth (True Rose) 0.22oz / 6.4g
  "rare-bouncy-07": "B0F44CF9F6", // Grateful (Soft Red) 0.22oz / 6.4g
  "rare-bouncy-09": "B0F44BK3V2", // Truth (Soft Plum) 0.22oz / 6.4g
  // U.S. Amazon product title, color and product form cross-checked 2026-10-15.
  "rmd-jlt-12": "B07ZKC767Z", // rom&nd Juicy Lasting Tint 12 Cherry Bomb
  "rmd-jlt-25": "B0DXFH4F21", // rom&nd beauty Juicy Lasting Tint 25 Bare Grape (updated 12HR listing)
  "rmd-btp-fog": "B08ZJPFXZG", // rom&nd Better Than Palette Dusty Fog Garden (single palette)
  "rmd-veil": "B08MQP8977", // rom&nd See-Through Veilighter Hanbok Edition 01 Sun Kissed Veil
  "sk-cosrx-reti": "B0B5DKJ8TS", // COSRX The Retinol 0.1 Cream, single 0.67 fl oz US listing
  "mbl-vinyl-peachy": "B09QH7SS43", // Maybelline Super Stay Vinyl Ink Peachy 0.14 fl oz single
};
