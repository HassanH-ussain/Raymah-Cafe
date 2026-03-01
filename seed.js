require('dotenv').config();
const connectDB = require('./src/config/db');
const Product = require('./src/models/Product');

const products = [

  // ── Hot Drinks ──────────────────────────────────────────────────
  {
    name: 'Raymah Signature Espresso',
    category: 'drinks-hot',
    origin: 'House Blend',
    roast: 'N/A',
    flavor: 'Intense',
    description: 'Our house espresso — a bold, velvety shot with layers of dark chocolate and a lingering caramel finish. The soul of Raymah in a single cup.',
    price: 4.50,
    inStock: true,
    badge: null,
    visual: { bodyFill: '#0f0f0f', innerOpacity: '0.25', gradientClass: 'from-gold/30 to-dark' },
  },
  {
    name: 'Yemen Mocha Latte',
    category: 'drinks-hot',
    origin: 'Yemen',
    roast: 'N/A',
    flavor: 'Rich',
    description: 'Silky steamed milk poured over Yemen Mocha espresso, crowned with a dusting of cacao. An ancient origin reimagined for the modern palate.',
    price: 6.50,
    inStock: true,
    badge: 'Popular',
    visual: { bodyFill: '#0a0a0a', innerOpacity: '0.2', gradientClass: 'from-gold/25 to-dark' },
  },
  {
    name: 'Ethiopia Pour Over',
    category: 'drinks-hot',
    origin: 'Ethiopia',
    roast: 'N/A',
    flavor: 'Floral',
    description: 'Hand-brewed to order using Ethiopia Yirgacheffe beans. Delicate jasmine and citrus notes bloom with every slow, intentional pour.',
    price: 5.50,
    inStock: true,
    badge: null,
    visual: { bodyFill: '#1a1a1a', innerOpacity: '0.15', gradientClass: 'from-gold/20 to-dark' },
  },
  {
    name: 'Colombia Dark Americano',
    category: 'drinks-hot',
    origin: 'Colombia',
    roast: 'N/A',
    flavor: 'Bold',
    description: 'Colombia Supremo espresso diluted with just enough hot water to reveal its full caramel and dark chocolate depth. Pure, unfussy coffee.',
    price: 4.00,
    inStock: true,
    badge: null,
    visual: { bodyFill: '#050505', innerOpacity: '0.1', gradientClass: 'from-gold/30 to-dark' },
  },
  {
    name: 'Cardamom Arabic Coffee',
    category: 'drinks-hot',
    origin: 'Arabian Peninsula',
    roast: 'N/A',
    flavor: 'Spiced',
    description: 'A traditional preparation of lightly roasted beans steeped with freshly cracked cardamom pods. Warm, aromatic, and deeply comforting.',
    price: 5.00,
    inStock: true,
    badge: null,
    visual: { bodyFill: '#141414', innerOpacity: '0.18', gradientClass: 'from-gold/20 to-dark' },
  },
  {
    name: 'Saffron Cortado',
    category: 'drinks-hot',
    origin: 'House Blend',
    roast: 'N/A',
    flavor: 'Exotic',
    description: 'Equal parts espresso and warm milk, infused with a whisper of Kashmiri saffron. A rare balance of strength and subtle luxury.',
    price: 5.50,
    inStock: true,
    badge: null,
    visual: { bodyFill: '#181408', innerOpacity: '0.22', gradientClass: 'from-gold-dark/30 to-dark' },
  },

  // ── Cold Drinks ──────────────────────────────────────────────────
  {
    name: 'Cold Brew Reserve',
    category: 'drinks-cold',
    origin: 'Colombia',
    roast: 'N/A',
    flavor: 'Smooth',
    description: 'Colombia Supremo steeped cold for 20 hours, yielding a concentrate of extraordinary smoothness. Zero bitterness. All character.',
    price: 6.00,
    inStock: true,
    badge: 'Popular',
    visual: { bodyFill: '#080808', innerOpacity: '0.12', gradientClass: 'from-gold/20 to-dark' },
  },
  {
    name: 'Iced Ethiopia Yirgacheffe',
    category: 'drinks-cold',
    origin: 'Ethiopia',
    roast: 'N/A',
    flavor: 'Bright',
    description: 'Our light-roast Ethiopian single-origin brewed double-strength and poured over ice. Vivid blueberry and jasmine notes in every sip.',
    price: 5.50,
    inStock: true,
    badge: null,
    visual: { bodyFill: '#1a1a1a', innerOpacity: '0.15', gradientClass: 'from-gold/15 to-dark' },
  },
  {
    name: 'Vanilla Bean Cold Foam Latte',
    category: 'drinks-cold',
    origin: 'House Blend',
    roast: 'N/A',
    flavor: 'Velvety',
    description: 'House cold brew topped with airy vanilla bean cold foam. A study in contrast — robust coffee beneath a cloud of sweetness.',
    price: 6.50,
    inStock: true,
    badge: null,
    visual: { bodyFill: '#0f0f0f', innerOpacity: '0.2', gradientClass: 'from-gold/25 to-dark' },
  },
  {
    name: 'Mocha Frappé',
    category: 'drinks-cold',
    origin: 'Yemen',
    roast: 'N/A',
    flavor: 'Indulgent',
    description: 'Yemen Mocha espresso blended with dark chocolate, ice, and cream into a frozen luxury. Topped with house-made chocolate drizzle.',
    price: 7.00,
    inStock: true,
    badge: null,
    visual: { bodyFill: '#0a0a0a', innerOpacity: '0.22', gradientClass: 'from-gold/30 to-dark' },
  },

  // ── Food ─────────────────────────────────────────────────────────
  {
    name: 'Almond Croissant',
    category: 'food',
    origin: 'Café Kitchen',
    roast: 'N/A',
    flavor: 'Buttery',
    description: 'A twice-baked croissant filled with house almond cream and finished with toasted flaked almonds. Flaky layers, rich centre.',
    price: 4.50,
    inStock: true,
    badge: null,
    visual: { bodyFill: '#1a1408', innerOpacity: '0.2', gradientClass: 'from-gold-dark/25 to-dark' },
  },
  {
    name: 'Date & Cardamom Muffin',
    category: 'food',
    origin: 'Café Kitchen',
    roast: 'N/A',
    flavor: 'Aromatic',
    description: 'Moist muffin studded with Medjool dates and perfumed with green cardamom. A nod to the Gulf café tradition, baked fresh daily.',
    price: 3.50,
    inStock: true,
    badge: null,
    visual: { bodyFill: '#140f08', innerOpacity: '0.18', gradientClass: 'from-gold/20 to-dark' },
  },
  {
    name: 'Avocado Toast',
    category: 'food',
    origin: 'Café Kitchen',
    roast: 'N/A',
    flavor: 'Fresh',
    description: 'Sourdough, smashed seasonal avocado, poached egg, chilli flakes and micro herbs. A brunch staple executed with precision.',
    price: 8.00,
    inStock: true,
    badge: null,
    visual: { bodyFill: '#0a140a', innerOpacity: '0.15', gradientClass: 'from-gold/15 to-dark' },
  },
  {
    name: 'Açaí Bowl',
    category: 'food',
    origin: 'Café Kitchen',
    roast: 'N/A',
    flavor: 'Vibrant',
    description: 'Blended wild-harvested açaí topped with house granola, seasonal fruit, coconut flakes and a drizzle of raw honey. Nourishing and indulgent.',
    price: 9.00,
    inStock: true,
    badge: 'Popular',
    visual: { bodyFill: '#0a080f', innerOpacity: '0.2', gradientClass: 'from-gold/20 to-dark' },
  },

  // ── Whole Beans ──────────────────────────────────────────────────
  {
    name: 'Ethiopia Yirgacheffe',
    category: 'beans',
    origin: 'Ethiopia',
    roast: 'Light',
    flavor: 'Floral',
    description: 'Delicate jasmine and bergamot notes with a silky body. Perfect for pour-over brewing.',
    price: 28,
    inStock: true,
    badge: null,
    visual: { bodyFill: '#1a1a1a', innerOpacity: '0.15', gradientClass: 'from-gold/20 to-dark' },
  },
  {
    name: 'Yemen Mocha',
    category: 'beans',
    origin: 'Yemen',
    roast: 'Medium',
    flavor: 'Complex',
    description: 'Rich wine-like acidity with chocolate undertones. A legendary origin with ancient heritage.',
    price: 35,
    inStock: true,
    badge: 'Bestseller',
    visual: { bodyFill: '#0a0a0a', innerOpacity: '0.2', gradientClass: 'from-gold/25 to-dark' },
  },
  {
    name: 'Colombia Supremo',
    category: 'beans',
    origin: 'Colombia',
    roast: 'Dark',
    flavor: 'Bold',
    description: 'Rich caramel sweetness with hints of dark chocolate. Perfect for espresso lovers.',
    price: 26,
    inStock: true,
    badge: null,
    visual: { bodyFill: '#050505', innerOpacity: '0.1', gradientClass: 'from-gold/30 to-dark' },
  },

];

async function seed() {
  await connectDB();
  await Product.deleteMany({});
  const inserted = await Product.insertMany(products);
  console.log(`\n🌱  Seeded ${inserted.length} products:\n`);
  const categories = ['drinks-hot', 'drinks-cold', 'food', 'beans'];
  categories.forEach(cat => {
    const group = inserted.filter(p => p.category === cat);
    if (group.length) {
      console.log(`  [${cat}]`);
      group.forEach(p => console.log(`    • ${p.name} — $${p.price}`));
    }
  });
  console.log('\n✅  Done. Run `npm run dev` to start the server.\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
