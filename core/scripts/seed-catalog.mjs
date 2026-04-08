#!/usr/bin/env node
/**
 * seed-catalog.mjs — Seeds BigCommerce with an Industrial/Facility Supplies B2B catalog
 *
 * Usage:
 *   node core/scripts/seed-catalog.mjs              # Run against .env.local
 *   node core/scripts/seed-catalog.mjs --dry-run    # Preview without creating
 *
 * Requires: BIGCOMMERCE_STORE_HASH, BIGCOMMERCE_ACCESS_TOKEN in env or .env.local
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local
const envPath = resolve(process.cwd(), 'core/.env.local');
try {
  const envFile = readFileSync(envPath, 'utf-8');
  for (const line of envFile.split('\n')) {
    const match = line.match(/^([A-Z_]+)=(.+)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim();
    }
  }
} catch { /* ignore */ }

const STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
const ACCESS_TOKEN = process.env.BIGCOMMERCE_ACCESS_TOKEN;
const CHANNEL_ID = 1694736;
const DRY_RUN = process.argv.includes('--dry-run');

if (!STORE_HASH || !ACCESS_TOKEN) {
  console.error('Missing BIGCOMMERCE_STORE_HASH or BIGCOMMERCE_ACCESS_TOKEN');
  process.exit(1);
}

const BASE = `https://api.bigcommerce.com/stores/${STORE_HASH}/v3`;

async function api(endpoint, method = 'GET', body = null, retries = 3) {
  const url = `${BASE}${endpoint}`;
  if (DRY_RUN && method !== 'GET') {
    console.log(`  [DRY RUN] ${method} ${endpoint}`, body ? JSON.stringify(body).slice(0, 120) : '');
    return { data: { id: Math.floor(Math.random() * 99999), ...body } };
  }
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, {
      method,
      headers: { 'X-Auth-Token': ACCESS_TOKEN, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : null,
    });
    if (res.status === 429) {
      const wait = parseInt(res.headers.get('x-retry-after') || '2', 10) * 1000;
      console.log(`  Rate limited, waiting ${wait}ms...`);
      await new Promise(r => setTimeout(r, wait));
      continue;
    }
    if (!res.ok) {
      const text = await res.text();
      if (i === retries - 1) throw new Error(`${method} ${endpoint}: ${res.status} — ${text.slice(0, 300)}`);
      await new Promise(r => setTimeout(r, 1000));
      continue;
    }
    const json = await res.json();
    return json;
  }
}

// Small delay between creates to respect rate limits
const delay = (ms = 250) => new Promise(r => setTimeout(r, ms));

// ─── BRANDS ──────────────────────────────────────────────────────────────────

const BRANDS = [
  { name: 'SafeGuard Pro', meta_description: 'Premium PPE and safety equipment for industrial workplaces' },
  { name: 'CleanMax', meta_description: 'Professional janitorial and cleaning solutions' },
  { name: 'ProGrip', meta_description: 'Industrial gloves and hand protection specialists' },
  { name: 'AirShield', meta_description: 'Respiratory protection and air quality solutions' },
  { name: 'BrightLine', meta_description: 'Commercial and industrial lighting solutions' },
  { name: 'ToughWear', meta_description: 'Industrial workwear and protective uniforms' },
  { name: 'FloorMaster', meta_description: 'Floor care equipment and maintenance supplies' },
  { name: 'MaintenancePro', meta_description: 'MRO tools, hardware, and facility maintenance' },
];

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

const CATEGORY_TREE = [
  {
    name: 'Industrial & Facility Supplies', children: [
      {
        name: 'Safety & PPE', children: [
          { name: 'Head Protection' },
          { name: 'Eye & Face Protection' },
          { name: 'Hand Protection' },
          { name: 'Respiratory Protection' },
          { name: 'Hi-Vis & Workwear' },
        ]
      },
      {
        name: 'Janitorial & Cleaning', children: [
          { name: 'Cleaning Chemicals' },
          { name: 'Paper Products' },
          { name: 'Trash & Waste' },
          { name: 'Floor Care' },
        ]
      },
      {
        name: 'Breakroom Supplies', children: [
          { name: 'Beverages & Snacks' },
          { name: 'Utensils & Disposables' },
          { name: 'Appliances' },
        ]
      },
      {
        name: 'Maintenance & Tools', children: [
          { name: 'Hand Tools' },
          { name: 'Power Tool Accessories' },
          { name: 'Fasteners & Hardware' },
        ]
      },
      {
        name: 'Lighting & Electrical', children: [
          { name: 'LED Bulbs & Tubes' },
          { name: 'Extension Cords & Strips' },
        ]
      },
      {
        name: 'First Aid & Medical', children: [
          { name: 'First Aid Kits' },
          { name: 'Medical Supplies' },
        ]
      },
    ]
  },
];

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

// Images by category (Unsplash photo IDs — stable URLs)
const IMG = {
  'Hand Protection':       'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=800&q=80&fit=crop',
  'Head Protection':       'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80&fit=crop',
  'Eye & Face Protection': 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&q=80&fit=crop',
  'Respiratory Protection':'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=800&q=80&fit=crop',
  'Hi-Vis & Workwear':     'https://images.unsplash.com/photo-1618517048289-4b00c0a0b08c?w=800&q=80&fit=crop',
  'Cleaning Chemicals':    'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&q=80&fit=crop',
  'Paper Products':        'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800&q=80&fit=crop',
  'Trash & Waste':         'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80&fit=crop',
  'Floor Care':            'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80&fit=crop',
  'Beverages & Snacks':    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&fit=crop',
  'Utensils & Disposables':'https://images.unsplash.com/photo-1586980368323-8ce5db4c85ce?w=800&q=80&fit=crop',
  'Appliances':            'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80&fit=crop',
  'Hand Tools':            'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80&fit=crop',
  'Power Tool Accessories':'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80&fit=crop',
  'Fasteners & Hardware':  'https://images.unsplash.com/photo-1586864387789-628af9feed72?w=800&q=80&fit=crop',
  'LED Bulbs & Tubes':     'https://images.unsplash.com/photo-1565814329452-e1432aa73113?w=800&q=80&fit=crop',
  'Extension Cords & Strips':'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80&fit=crop',
  'First Aid Kits':        'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800&q=80&fit=crop',
  'Medical Supplies':      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80&fit=crop',
};

const PRODUCTS = [
  // Safety & PPE — Hand Protection
  { name: 'ProGrip Nitrile Disposable Gloves — Case of 1000', sku: 'PG-NDG-1000', brand: 'ProGrip', price: 89.99, retail: 129.99, weight: 8.5, cat: 'Hand Protection', desc: 'Industrial-grade powder-free nitrile gloves. Latex-free, textured fingertips for superior grip. Ideal for manufacturing, food processing, and general facility maintenance. 4 mil thickness, ambidextrous fit.' },
  { name: 'ProGrip Cut-Resistant Work Gloves — 12 Pack', sku: 'PG-CRG-12', brand: 'ProGrip', price: 64.99, retail: 89.99, weight: 2.5, cat: 'Hand Protection', desc: 'ANSI Level A4 cut-resistant gloves with polyurethane palm coating. Breathable 13-gauge HPPE liner. Machine washable. Perfect for metal handling, glass work, and assembly.' },
  { name: 'ProGrip Chemical-Resistant Neoprene Gloves — 12 Pack', sku: 'PG-CNG-12', brand: 'ProGrip', price: 78.99, retail: 109.99, weight: 3.0, cat: 'Hand Protection', desc: '18-inch neoprene chemical-resistant gloves with flock lining. Resists acids, caustics, oils, and solvents. Embossed grip pattern. Ideal for chemical handling and janitorial applications.' },

  // Safety & PPE — Head Protection
  { name: 'SafeGuard Pro Hard Hat — Type I Class E', sku: 'SG-HH-T1CE', brand: 'SafeGuard Pro', price: 24.99, retail: 39.99, weight: 1.0, cat: 'Head Protection', desc: 'ANSI/ISEA Z89.1 Type I Class E hard hat with 4-point ratchet suspension. UV-resistant HDPE shell. Accessory slots for face shields, earmuffs, and lights. Available in multiple colors for crew identification.' },

  // Safety & PPE — Eye & Face Protection
  { name: 'SafeGuard Pro Safety Glasses — Clear Lens (12 Pack)', sku: 'SG-SG-CLR-12', brand: 'SafeGuard Pro', price: 42.99, retail: 64.99, weight: 1.5, cat: 'Eye & Face Protection', desc: 'ANSI Z87.1+ rated wraparound safety glasses. Anti-fog, anti-scratch polycarbonate lens. Soft rubber nose bridge and temple tips for all-day comfort. UV400 protection.' },
  { name: 'SafeGuard Pro Full-Face Shield with Headgear', sku: 'SG-FS-HG', brand: 'SafeGuard Pro', price: 18.99, retail: 29.99, weight: 0.8, cat: 'Eye & Face Protection', desc: 'ANSI Z87.1 compliant full-face shield with adjustable headgear. Clear polycarbonate visor provides 99.9% UV protection. Ratchet adjustment fits most head sizes. Can be worn over prescription glasses.' },

  // Safety & PPE — Respiratory Protection
  { name: 'AirShield N95 Respirator Masks — Box of 20', sku: 'AS-N95-20', brand: 'AirShield', price: 34.99, retail: 49.99, weight: 0.5, cat: 'Respiratory Protection', desc: 'NIOSH-approved N95 particulate respirator. Filters at least 95% of airborne particles. Adjustable nose clip and dual-strap design for a secure seal. Individually wrapped for hygiene.' },
  { name: 'AirShield Half-Face Respirator with P100 Filters', sku: 'AS-HFR-P100', brand: 'AirShield', price: 45.99, retail: 69.99, weight: 0.8, cat: 'Respiratory Protection', desc: 'Reusable half-face respirator with bayonet-style P100 filter cartridges. Silicone face seal with dual-valve exhalation for cool, dry comfort. Ideal for paint, chemical, and particulate environments.' },
  { name: 'AirShield Replacement P100 Cartridges — 2 Pack', sku: 'AS-P100-2PK', brand: 'AirShield', price: 16.99, retail: 24.99, weight: 0.3, cat: 'Respiratory Protection', desc: 'Replacement P100 organic vapor/particulate filter cartridges for AirShield half-face and full-face respirators. NIOSH approved. Replace every 40 hours of use or when breathing resistance increases.' },

  // Safety & PPE — Hi-Vis & Workwear
  { name: 'ToughWear Hi-Vis Safety Vest — Class 2', sku: 'TW-HV-C2', brand: 'ToughWear', price: 12.99, retail: 19.99, weight: 0.3, cat: 'Hi-Vis & Workwear', desc: 'ANSI/ISEA 107 Class 2 hi-vis safety vest. Fluorescent lime-yellow mesh with 2-inch reflective silver tape. Zipper front closure, two interior pockets, and a mic tab. Lightweight and breathable.' },
  { name: 'ToughWear Flame-Resistant Coveralls', sku: 'TW-FRC', brand: 'ToughWear', price: 89.99, retail: 129.99, weight: 2.0, cat: 'Hi-Vis & Workwear', desc: 'NFPA 2112 compliant flame-resistant coveralls. 7 oz inherent FR fabric — will not melt, drip, or ignite. Two-way brass zipper with Nomex tape. Multiple utility pockets. HRC 2 / ATPV 8.9 cal/cm².' },
  { name: 'SafeGuard Pro Steel-Toe Rubber Boots', sku: 'SG-STRB', brand: 'SafeGuard Pro', price: 54.99, retail: 79.99, weight: 4.0, cat: 'Hi-Vis & Workwear', desc: 'ASTM F2413 steel-toe rubber boots with puncture-resistant plate. Waterproof PVC construction with oil and chemical-resistant outsole. Removable cushion insole. 16-inch shaft height.' },

  // Janitorial — Cleaning Chemicals
  { name: 'CleanMax Industrial Degreaser — 5 Gallon', sku: 'CM-IDG-5G', brand: 'CleanMax', price: 47.99, retail: 69.99, weight: 42.0, cat: 'Cleaning Chemicals', desc: 'Heavy-duty water-based industrial degreaser. Cuts through grease, oil, carbon, and grime on contact. Non-flammable, biodegradable formula. Safe for use on metal, concrete, and painted surfaces. Dilutable up to 10:1.' },
  { name: 'CleanMax Multi-Surface Disinfectant — Case of 12', sku: 'CM-MSD-12', brand: 'CleanMax', price: 62.99, retail: 89.99, weight: 24.0, cat: 'Cleaning Chemicals', desc: 'EPA-registered hospital-grade disinfectant. Kills 99.9% of bacteria and viruses including MRSA, Norovirus, and Influenza A. Ready-to-use spray bottles. 1-minute contact time.' },
  { name: 'CleanMax Glass Cleaner Concentrate — 1 Gallon', sku: 'CM-GCC-1G', brand: 'CleanMax', price: 18.99, retail: 27.99, weight: 8.5, cat: 'Cleaning Chemicals', desc: 'Professional-grade ammonia-free glass cleaner concentrate. Streak-free formula for glass, mirrors, chrome, and stainless steel. Dilutes 64:1 — one gallon makes 64 quarts of ready-to-use solution.' },

  // Janitorial — Paper Products
  { name: 'CleanMax Jumbo Roll Paper Towels — Case of 6', sku: 'CM-JRT-6', brand: 'CleanMax', price: 54.99, retail: 79.99, weight: 18.0, cat: 'Paper Products', desc: 'High-capacity jumbo roll paper towels. 800 feet per roll, 6 rolls per case. 1-ply recycled fiber, absorbent and strong. Compatible with most jumbo roll dispensers. Ideal for high-traffic restrooms and kitchens.' },
  { name: 'CleanMax 2-Ply Toilet Tissue — Case of 96 Rolls', sku: 'CM-TT-96', brand: 'CleanMax', price: 68.99, retail: 99.99, weight: 30.0, cat: 'Paper Products', desc: 'Premium 2-ply toilet tissue. 500 sheets per roll, 96 rolls per case. Soft, absorbent, and septic-safe. Standard roll size fits all standard dispensers. Made from 100% recycled fiber.' },
  { name: 'CleanMax Center-Pull Paper Towels — Case of 6', sku: 'CM-CPT-6', brand: 'CleanMax', price: 38.99, retail: 54.99, weight: 12.0, cat: 'Paper Products', desc: '2-ply center-pull paper towels for controlled dispensing. 600 sheets per roll, 6 rolls per case. Reduces waste by dispensing one sheet at a time. White, perforated for easy tear.' },

  // Janitorial — Trash & Waste
  { name: 'CleanMax Heavy-Duty Trash Bags — 55 Gallon (100 ct)', sku: 'CM-TB-55G', brand: 'CleanMax', price: 44.99, retail: 64.99, weight: 15.0, cat: 'Trash & Waste', desc: '2 mil thick heavy-duty contractor trash bags. 55-gallon capacity, 38" x 58". Puncture and tear resistant. Star-sealed bottom prevents leaks. Black. Ideal for construction debris, yard waste, and industrial trash.' },
  { name: 'CleanMax Recycling Bin — 23 Gallon', sku: 'CM-RB-23G', brand: 'CleanMax', price: 34.99, retail: 49.99, weight: 6.0, cat: 'Trash & Waste', desc: 'Slim-profile 23-gallon recycling container with venting channels for easy bag removal. Color-coded lids for waste stream separation. Commercial-grade resin construction. Stackable for storage.' },

  // Janitorial — Floor Care
  { name: 'FloorMaster Commercial Wet Mop Kit', sku: 'FM-WMK', brand: 'FloorMaster', price: 32.99, retail: 47.99, weight: 5.0, cat: 'Floor Care', desc: 'Complete commercial wet mop system. Includes 35-quart side-press wringer bucket, fiberglass handle, and blended cotton/synthetic mop head. Wringer mechanism reduces strain and improves water extraction.' },
  { name: 'FloorMaster Auto Floor Scrubber — Walk-Behind', sku: 'FM-AFS-WB', brand: 'FloorMaster', price: 2849.00, retail: 3499.00, weight: 180.0, cat: 'Floor Care', desc: '20-inch walk-behind automatic floor scrubber with 14-gallon solution tank. Scrubs, sweeps, and dries in one pass. Maintenance-free gel batteries provide 2.5 hours of run time. 28,000 sqft/hour productivity.' },
  { name: 'FloorMaster Floor Finish — High-Gloss (5 Gallon)', sku: 'FM-FF-HG-5G', brand: 'FloorMaster', price: 58.99, retail: 84.99, weight: 42.0, cat: 'Floor Care', desc: '25% solids high-gloss floor finish. Provides a durable, non-yellowing shine on VCT, terrazzo, concrete, and stone floors. Slip-resistant formula meets UL 410 and ASTM D2047 standards. 5 coats recommended.' },
  { name: 'FloorMaster Microfiber Dust Mop — 36 inch', sku: 'FM-MDM-36', brand: 'FloorMaster', price: 24.99, retail: 36.99, weight: 2.0, cat: 'Floor Care', desc: '36-inch microfiber dust mop with aluminum telescoping handle. Electrostatic microfiber traps dust, dirt, and hair without chemicals. Machine washable — lasts 500+ washings. Swivel frame for easy maneuverability.' },

  // Breakroom — Beverages & Snacks
  { name: 'Premium Coffee Pods — Medium Roast (80 ct)', sku: 'BR-CP-MR-80', brand: 'CleanMax', price: 42.99, retail: 59.99, weight: 3.0, cat: 'Beverages & Snacks', desc: '100% Arabica medium roast coffee pods. Compatible with all K-Cup brewers. Individually sealed for freshness. Smooth, balanced flavor with notes of chocolate and caramel. 80 pods per box.' },
  { name: 'Bottled Water — 16.9 oz (40 Pack)', sku: 'BR-BW-40', brand: 'CleanMax', price: 12.99, retail: 18.99, weight: 28.0, cat: 'Beverages & Snacks', desc: 'Purified drinking water in convenient 16.9 oz (500ml) bottles. BPA-free recycled PET plastic. Perfect for breakrooms, meetings, and hydration stations. 40 bottles per case.' },
  { name: 'Assorted Snack Box — 50 Count', sku: 'BR-ASB-50', brand: 'CleanMax', price: 34.99, retail: 49.99, weight: 8.0, cat: 'Beverages & Snacks', desc: 'Variety pack of individually wrapped snacks. Mix of chips, crackers, cookies, granola bars, and nuts. No artificial flavors or colors. Perfect for breakroom stocking. 50 individually wrapped items.' },

  // Breakroom — Utensils & Disposables
  { name: 'Disposable Hot Cups — 12 oz (500 ct)', sku: 'BR-DHC-500', brand: 'CleanMax', price: 44.99, retail: 64.99, weight: 12.0, cat: 'Utensils & Disposables', desc: 'Double-wall insulated paper hot cups. No sleeve needed — comfortable to hold with hot beverages. Leak-resistant design with rolled rim. Compatible with standard dome and flat lids (sold separately). 500 per case.' },
  { name: 'Heavy-Duty Plastic Utensil Set — 300 ct', sku: 'BR-PUS-300', brand: 'CleanMax', price: 22.99, retail: 32.99, weight: 4.0, cat: 'Utensils & Disposables', desc: 'Individually wrapped knife, fork, and napkin sets. Heavy-duty polypropylene utensils — sturdy enough for any meal. White. 300 sets per case. Ideal for cafeterias, breakrooms, and catered events.' },
  { name: 'Foam Plates — 9 inch (500 ct)', sku: 'BR-FP-500', brand: 'CleanMax', price: 28.99, retail: 42.99, weight: 6.0, cat: 'Utensils & Disposables', desc: 'Lightweight 9-inch white foam plates. Grease and moisture resistant. Microwave safe. Ideal for breakroom meals, company events, and cafeteria service. 500 plates per case.' },

  // Breakroom — Appliances
  { name: 'Commercial Coffee Maker — 12 Cup', sku: 'BR-CCM-12', brand: 'MaintenancePro', price: 129.99, retail: 179.99, weight: 8.0, cat: 'Appliances', desc: '12-cup commercial coffee maker with stainless steel carafe. Programmable brew timer, auto shut-off, and adjustable brew strength. NSF certified for commercial use. Brews in under 10 minutes.' },
  { name: 'Compact Microwave Oven — 1.2 Cu Ft', sku: 'BR-CMO-12', brand: 'MaintenancePro', price: 189.99, retail: 249.99, weight: 30.0, cat: 'Appliances', desc: '1.2 cubic foot commercial-grade microwave. 1200 watts, 10 power levels. Stainless steel interior for easy cleaning. Programmable menu pads with 3 cooking stages. UL listed for commercial use.' },

  // Maintenance & Tools — Hand Tools
  { name: 'MaintenancePro 150-Piece Mechanic Tool Set', sku: 'MP-MTS-150', brand: 'MaintenancePro', price: 249.99, retail: 349.99, weight: 25.0, cat: 'Hand Tools', desc: 'Professional 150-piece mechanic tool set in a blow-molded carrying case. Includes ratchets, sockets (SAE and metric), combination wrenches, pliers, screwdrivers, hex keys, and extensions. Chrome vanadium steel.' },
  { name: 'MaintenancePro Adjustable Wrench Set — 4 Piece', sku: 'MP-AWS-4', brand: 'MaintenancePro', price: 38.99, retail: 54.99, weight: 3.5, cat: 'Hand Tools', desc: '4-piece adjustable wrench set: 6", 8", 10", and 12". Chrome vanadium steel with satin finish. Precision-machined jaws with laser-etched SAE/metric scales. Ergonomic cushion-grip handles.' },
  { name: 'MaintenancePro WD-40 Industrial Size — Case of 12', sku: 'MP-WD40-12', brand: 'MaintenancePro', price: 72.99, retail: 99.99, weight: 18.0, cat: 'Hand Tools', desc: 'WD-40 Multi-Use Product in 16 oz industrial cans with Smart Straw. Lubricates, penetrates, protects, and displaces moisture. 12 cans per case. Essential for every maintenance toolkit and facility.' },
  { name: 'MaintenancePro Wire Stripper & Crimper Tool', sku: 'MP-WSC', brand: 'MaintenancePro', price: 19.99, retail: 29.99, weight: 0.5, cat: 'Hand Tools', desc: 'Multi-function wire stripper, cutter, and crimper. Strips 10-22 AWG solid and stranded wire. Built-in bolt cutter for 6-32 and 8-32 screws. Spring-loaded self-opening with comfort grips.' },
  { name: 'MaintenancePro Digital Multimeter — Professional Grade', sku: 'MP-DMM-PRO', brand: 'MaintenancePro', price: 89.99, retail: 129.99, weight: 0.8, cat: 'Hand Tools', desc: 'True-RMS digital multimeter rated CAT III 1000V / CAT IV 600V. Measures AC/DC voltage, current, resistance, capacitance, frequency, and temperature. Auto-ranging with backlit display. Includes test leads and case.' },

  // Maintenance & Tools — Power Tool Accessories
  { name: 'MaintenancePro Cordless Drill Bit Set — 100 Piece', sku: 'MP-DBS-100', brand: 'MaintenancePro', price: 32.99, retail: 49.99, weight: 3.0, cat: 'Power Tool Accessories', desc: '100-piece drill and drive bit set. Includes HSS twist drills, masonry bits, spade bits, nutsetters, and magnetic bit holder. Titanium-coated for longer life. Organized in a durable carrying case.' },
  { name: 'MaintenancePro Cut-Off Wheels — 25 Pack', sku: 'MP-COW-25', brand: 'MaintenancePro', price: 24.99, retail: 36.99, weight: 4.0, cat: 'Power Tool Accessories', desc: 'Type 1 reinforced aluminum oxide cut-off wheels. 0.045" thin kerf for fast, clean cuts. For use on steel, stainless steel, and ferrous metals. Max RPM: 13,300. 25 wheels per box.' },

  // Maintenance & Tools — Fasteners & Hardware
  { name: 'MaintenancePro Hex Bolt Assortment — 1200 Piece', sku: 'MP-HBA-1200', brand: 'MaintenancePro', price: 64.99, retail: 89.99, weight: 15.0, cat: 'Fasteners & Hardware', desc: '1200-piece grade 5 hex bolt, nut, and washer assortment. SAE sizes from #6 to 3/8". Zinc-plated for corrosion resistance. Organized in a 40-compartment storage bin. Essential hardware for any maintenance shop.' },
  { name: 'MaintenancePro Cable Ties — Assorted (1000 ct)', sku: 'MP-CT-1000', brand: 'MaintenancePro', price: 18.99, retail: 27.99, weight: 2.5, cat: 'Fasteners & Hardware', desc: 'Self-locking nylon cable ties in assorted sizes: 4", 8", 11", and 14". UV-resistant for indoor/outdoor use. 50 lb tensile strength. 1000 ties per bag — 250 of each size.' },
  { name: 'MaintenancePro Duct Tape — Contractor Grade (12 Pack)', sku: 'MP-DT-12', brand: 'MaintenancePro', price: 42.99, retail: 59.99, weight: 10.0, cat: 'Fasteners & Hardware', desc: '2-inch x 60-yard contractor-grade duct tape. 12 mil total thickness with aggressive adhesive. Tears cleanly by hand. Waterproof polyethylene backing. 12 rolls per case. Silver.' },

  // Lighting & Electrical
  { name: 'BrightLine LED T8 Tube — 4ft (25 Pack)', sku: 'BL-T8-4FT-25', brand: 'BrightLine', price: 124.99, retail: 179.99, weight: 10.0, cat: 'LED Bulbs & Tubes', desc: '4-foot LED T8 replacement tubes. 18W replaces 32W fluorescent — 44% energy savings. 2200 lumens, 50,000-hour rated life. Type A+B compatible (works with or without ballast). DLC Premium listed for utility rebates. 25 per case.' },
  { name: 'BrightLine LED High Bay Light — 150W', sku: 'BL-HBL-150W', brand: 'BrightLine', price: 89.99, retail: 134.99, weight: 5.0, cat: 'LED Bulbs & Tubes', desc: '150W LED high bay light replacing 400W metal halide. 21,000 lumens at 140 lm/W efficacy. IP65 rated for damp locations. 0-10V dimmable. Built-in driver, 5-year warranty. Ideal for warehouses, manufacturing, and gyms.' },
  { name: 'BrightLine Heavy-Duty Extension Cord — 100ft', sku: 'BL-EC-100', brand: 'BrightLine', price: 54.99, retail: 79.99, weight: 8.0, cat: 'Extension Cords & Strips', desc: '100-foot 12/3 SJTW outdoor extension cord. 15A/125V rated, grounded. Bright yellow jacket for visibility and safety. Power indicator light. UL listed. Ideal for construction sites, events, and facility maintenance.' },
  { name: 'BrightLine Surge Protector Power Strip — 12 Outlet', sku: 'BL-SP-12', brand: 'BrightLine', price: 34.99, retail: 49.99, weight: 2.0, cat: 'Extension Cords & Strips', desc: '12-outlet metal surge protector with 4320 joules of protection. 15-foot cord with flat plug. Two USB-A ports for device charging. Circuit breaker and power switch with indicator light. UL 1449 listed.' },

  // First Aid & Medical
  { name: 'SafeGuard Pro First Aid Kit — 200 Piece (OSHA Compliant)', sku: 'SG-FAK-200', brand: 'SafeGuard Pro', price: 64.99, retail: 94.99, weight: 3.0, cat: 'First Aid Kits', desc: 'OSHA/ANSI compliant 200-piece first aid kit in a wall-mountable metal case. Covers 50 people. Includes bandages, gauze, antiseptic, gloves, cold packs, scissors, tweezers, and first aid guide. Meets ANSI Z308.1-2021.' },
  { name: 'SafeGuard Pro Wall-Mount First Aid Cabinet — Industrial', sku: 'SG-FAC-IND', brand: 'SafeGuard Pro', price: 149.99, retail: 219.99, weight: 12.0, cat: 'First Aid Kits', desc: 'Industrial 4-shelf wall-mount first aid cabinet stocked with 1,092 pieces. Covers 150 people. Steel cabinet with clear-view door and keyed lock. Organized compartments with refill labels. ANSI Class B compliant.' },
  { name: 'SafeGuard Pro Eye Wash Station — Dual Bottle', sku: 'SG-EWS-DB', brand: 'SafeGuard Pro', price: 42.99, retail: 62.99, weight: 5.0, cat: 'Medical Supplies', desc: 'Wall-mount emergency eye wash station with two 32 oz bottles of sterile saline solution. OSHA compliant. Includes dust cover, mirror, and eye cup. Easy snap-out bottles for quick access. 24-month shelf life.' },
  { name: 'SafeGuard Pro AED Defibrillator — Workplace Package', sku: 'SG-AED-WP', brand: 'SafeGuard Pro', price: 1299.99, retail: 1799.99, weight: 6.0, cat: 'Medical Supplies', desc: 'FDA-cleared automated external defibrillator with workplace package. Includes AED unit, adult pads, wall-mount cabinet with alarm, CPR pocket mask, and rescue kit. Real-time voice and visual prompts. 8-year warranty, 5-year battery.' },
];

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🏭 Industrial Facility Supplies Catalog Seed`);
  console.log(`   Store: ${STORE_HASH} | Channel: ${CHANNEL_ID} | Dry Run: ${DRY_RUN}\n`);

  // 1. Create brands
  console.log('--- Creating Brands ---');
  const brandMap = {};
  for (const b of BRANDS) {
    try {
      const { data } = await api('/catalog/brands', 'POST', { name: b.name, meta_description: b.meta_description });
      brandMap[b.name] = data.id;
      console.log(`  + Brand: ${b.name} (ID: ${data.id})`);
    } catch (e) {
      // Brand might already exist
      if (e.message.includes('409') || e.message.includes('already exists') || e.message.includes('duplicate')) {
        const { data: brands } = await api(`/catalog/brands?name=${encodeURIComponent(b.name)}`);
        if (brands.length) {
          brandMap[b.name] = brands[0].id;
          console.log(`  = Brand exists: ${b.name} (ID: ${brands[0].id})`);
        }
      } else {
        console.error(`  ! Brand error: ${b.name} — ${e.message}`);
      }
    }
    await delay();
  }

  // 2. Create categories
  console.log('\n--- Creating Categories ---');
  const catMap = {};

  async function createCategories(nodes, parentId = 0) {
    for (const node of nodes) {
      try {
        const payload = { name: node.name, parent_id: parentId, is_visible: true };
        const { data } = await api('/catalog/categories', 'POST', payload);
        catMap[node.name] = data.id;
        console.log(`  + Category: ${node.name} (ID: ${data.id}, parent: ${parentId})`);
      } catch (e) {
        if (e.message.includes('409') || e.message.includes('already exists') || e.message.includes('duplicate')) {
          const { data: cats } = await api(`/catalog/categories?name=${encodeURIComponent(node.name)}&parent_id=${parentId}`);
          if (cats.length) {
            catMap[node.name] = cats[0].id;
            console.log(`  = Category exists: ${node.name} (ID: ${cats[0].id})`);
          }
        } else {
          console.error(`  ! Category error: ${node.name} — ${e.message}`);
        }
      }
      await delay();
      if (node.children) {
        await createCategories(node.children, catMap[node.name]);
      }
    }
  }
  await createCategories(CATEGORY_TREE);

  // 3. Create products
  console.log('\n--- Creating Products ---');
  const productIds = [];

  for (const p of PRODUCTS) {
    const catId = catMap[p.cat];
    const brandId = brandMap[p.brand];
    const imageUrl = IMG[p.cat] || 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80&fit=crop';

    const payload = {
      name: p.name,
      type: 'physical',
      sku: p.sku,
      description: `<p>${p.desc}</p>`,
      weight: p.weight,
      price: p.price,
      retail_price: p.retail,
      categories: catId ? [catId] : [],
      brand_id: brandId || 0,
      availability: 'available',
      is_visible: true,
      images: [{ image_url: imageUrl, is_thumbnail: true, description: p.name }],
    };

    try {
      const { data } = await api('/catalog/products', 'POST', payload);
      productIds.push(data.id);
      console.log(`  + Product: ${p.name} (ID: ${data.id}, $${p.price})`);
    } catch (e) {
      if (e.message.includes('409') || e.message.includes('duplicate')) {
        console.log(`  = Product exists: ${p.name} — skipping`);
      } else {
        console.error(`  ! Product error: ${p.name} — ${e.message}`);
      }
    }
    await delay(350); // Slightly longer delay for product creation (image download)
  }

  // 4. Assign products to channel
  if (productIds.length > 0) {
    console.log(`\n--- Assigning ${productIds.length} products to channel ${CHANNEL_ID} ---`);
    const assignments = productIds.map(id => ({ product_id: id, channel_id: CHANNEL_ID }));
    // Batch in groups of 50
    for (let i = 0; i < assignments.length; i += 50) {
      const batch = assignments.slice(i, i + 50);
      try {
        await api('/catalog/products/channel-assignments', 'PUT', batch);
        console.log(`  + Assigned batch ${Math.floor(i / 50) + 1} (${batch.length} products)`);
      } catch (e) {
        console.error(`  ! Channel assignment error: ${e.message}`);
      }
      await delay();
    }
  }

  // 5. Update B2B price list with wholesale pricing (20% off)
  console.log('\n--- Updating B2B Price List ---');
  const PRICE_LIST_ID = 2; // "B2B 1" price list

  if (productIds.length > 0) {
    // Fetch variants for each product to get variant IDs
    const priceRecords = [];
    for (const pid of productIds) {
      try {
        const { data: variants } = await api(`/catalog/products/${pid}/variants`);
        if (variants && variants.length > 0) {
          for (const v of variants) {
            priceRecords.push({
              variant_id: v.id,
              price: parseFloat((v.price * 0.80).toFixed(2)),
              retail_price: v.price,
              currency: 'USD',
            });
          }
        } else {
          // Product without variants — use product ID to find default variant
          const { data: product } = await api(`/catalog/products/${pid}`);
          if (product.variants && product.variants.length > 0) {
            priceRecords.push({
              variant_id: product.variants[0].id,
              price: parseFloat((product.price * 0.80).toFixed(2)),
              retail_price: product.price,
              currency: 'USD',
            });
          }
        }
      } catch (e) {
        console.error(`  ! Variant fetch error for product ${pid}: ${e.message}`);
      }
      await delay(100);
    }

    // Batch upsert price list records
    if (priceRecords.length > 0) {
      for (let i = 0; i < priceRecords.length; i += 50) {
        const batch = priceRecords.slice(i, i + 50);
        try {
          await api(`/pricelists/${PRICE_LIST_ID}/records`, 'PUT', batch);
          console.log(`  + Price records batch ${Math.floor(i / 50) + 1} (${batch.length} records at 20% off)`);
        } catch (e) {
          console.error(`  ! Price record error: ${e.message}`);
        }
        await delay();
      }
    }
  }

  // Summary
  console.log('\n========================================');
  console.log(`  Brands created:     ${Object.keys(brandMap).length}`);
  console.log(`  Categories created: ${Object.keys(catMap).length}`);
  console.log(`  Products created:   ${productIds.length}`);
  console.log(`  Channel assigned:   ${CHANNEL_ID}`);
  console.log(`  Price list updated: ID ${PRICE_LIST_ID} (B2B @ 20% off)`);
  console.log('========================================\n');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
