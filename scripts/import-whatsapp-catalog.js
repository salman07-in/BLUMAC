/**
 * BLUMAC KOREAN STORE - WHATSAPP & BULK CATALOG IMPORTER SCRIPT
 * Usage:
 *   node scripts/import-whatsapp-catalog.js path/to/products.json
 *   or
 *   node scripts/import-whatsapp-catalog.js path/to/products.csv
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.log('\n❌ Kripya file path provide karein:');
    console.log('   node scripts/import-whatsapp-catalog.js <path-to-file.json or .csv>\n');
    process.exit(1);
  }

  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`\n❌ File nahi mili: ${fullPath}\n`);
    process.exit(1);
  }

  console.log(`\n🚀 Reading file: ${fullPath}...`);
  const rawContent = fs.readFileSync(fullPath, 'utf8');

  let items = [];
  if (fullPath.endsWith('.json')) {
    const parsed = JSON.parse(rawContent);
    items = Array.isArray(parsed) ? parsed : (parsed.products || parsed.items || []);
  } else {
    // Parse CSV
    const lines = rawContent.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) {
      console.log('❌ CSV me kam se kam ek header aur ek data row honi chahiye.');
      process.exit(1);
    }
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
    const nameIdx = headers.findIndex(h => h.includes('title') || h.includes('name'));
    const priceIdx = headers.findIndex(h => h.includes('price') || h.includes('amount'));
    const descIdx = headers.findIndex(h => h.includes('desc') || h.includes('details'));
    const imgIdx = headers.findIndex(h => h.includes('image') || h.includes('photo'));

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
      if (nameIdx !== -1 && parts[nameIdx]) {
        items.push({
          name: parts[nameIdx],
          price: priceIdx !== -1 ? parts[priceIdx] : '0',
          description: descIdx !== -1 ? parts[descIdx] : '',
          images: imgIdx !== -1 && parts[imgIdx] ? [parts[imgIdx]] : []
        });
      }
    }
  }

  console.log(`📦 Found ${items.length} items to import.`);

  const defaultCategory = await prisma.category.findFirst();
  const defaultBrand = await prisma.brand.findFirst();

  let imported = 0;
  for (const item of items) {
    const name = (item.name || item.title || '').trim();
    if (!name) continue;

    const price = typeof item.price === 'number' ? item.price : (parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0);
    const mrp = typeof item.mrp === 'number' ? item.mrp : (Math.round(price * 1.15) || price);
    const desc = item.description || `${name} - 100% authentic Korean skincare.`;
    const images = Array.isArray(item.images) && item.images.length > 0 ? item.images : ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'];

    const baseSlug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').slice(0, 45) || 'prd';
    const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    const sku = `BLU-WA-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await prisma.product.create({
        data: {
          name,
          slug,
          brandId: defaultBrand ? defaultBrand.id : null,
          categoryId: defaultCategory ? defaultCategory.id : null,
          subcategory: 'Imported',
          price,
          mrp,
          shortDescription: desc.slice(0, 100),
          description: desc,
          images: JSON.stringify(images),
          skinType: JSON.stringify(['All Skin Types']),
          concerns: JSON.stringify(['Hydration']),
          keyIngredients: JSON.stringify([{ name: 'Botanical Extract', benefit: 'Calming' }]),
          fullIngredients: 'Purified Water, Glycerin.',
          howToUse: 'Apply appropriately to face.',
          status: 'ACTIVE',
          inStock: true,
          variants: {
            create: {
              sku,
              size: 'Standard',
              price,
              mrp,
              inventory: {
                create: {
                  quantityOnHand: 30,
                  reservedQuantity: 0,
                  lowStockThreshold: 5,
                }
              }
            }
          }
        }
      });
      imported++;
      console.log(`✅ [${imported}/${items.length}] Imported: ${name} (₹${price})`);
    } catch (e) {
      console.error(`❌ Failed ${name}:`, e.message);
    }
  }

  console.log(`\n🎉 Process complete! Successfully imported ${imported} products into BLUMAC store.\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
