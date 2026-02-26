require('dotenv').config();
const connectDB = require('./src/config/db');
const Product = require('./src/models/Product');

const products = [
  {
    name: 'Ethiopia Yirgacheffe',
    origin: 'Ethiopia',
    roast: 'Light',
    flavor: 'Floral',
    description:
      'Delicate jasmine and bergamot notes with a silky body. Perfect for pour-over brewing.',
    price: 28,
    visual: { bodyFill: '#1a1a1a', innerOpacity: '0.15', gradientClass: 'from-gold/20 to-dark' },
  },
  {
    name: 'Yemen Mocha',
    origin: 'Yemen',
    roast: 'Medium',
    flavor: 'Complex',
    description:
      'Rich wine-like acidity with chocolate undertones. A legendary origin with ancient heritage.',
    price: 35,
    badge: 'Bestseller',
    visual: { bodyFill: '#0a0a0a', innerOpacity: '0.2', gradientClass: 'from-gold/25 to-dark' },
  },
  {
    name: 'Colombia Supremo',
    origin: 'Colombia',
    roast: 'Dark',
    flavor: 'Bold',
    description:
      'Rich caramel sweetness with hints of dark chocolate. Perfect for espresso lovers.',
    price: 26,
    visual: { bodyFill: '#050505', innerOpacity: '0.1', gradientClass: 'from-gold/30 to-dark' },
  },
];

async function seed() {
  await connectDB();
  await Product.deleteMany({});
  const inserted = await Product.insertMany(products);
  console.log(`\n🌱  Seeded ${inserted.length} products:`);
  inserted.forEach((p) => console.log(`   • ${p.name} — $${p.price}`));
  console.log('\n✅  Done. Run `npm run dev` to start the server.\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
