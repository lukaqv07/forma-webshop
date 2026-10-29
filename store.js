(function (root) {
  'use strict';
  const products = [
    { id: 'headphones', name: 'Quiet Headphones', category: 'Audio', price: 12900, image: 'assets/headphones.jpg', color: 'Moss green', badge: 'Bestseller', description: 'Your own little quiet corner. Soft over-ear cushions and rich, balanced sound in a beautifully simple silhouette.', details: ['Wireless Bluetooth connection', 'Up to 30 hours of listening', 'Soft, padded ear cushions', 'USB-C charging cable included'] },
    { id: 'lamp', name: 'Dome Table Lamp', category: 'Home', price: 8900, image: 'assets/lamp.jpg', color: 'Ivory', badge: 'New arrival', description: 'A softer kind of light. A sculptural dome and warm glow turn any corner into your favourite spot.', details: ['Warm white LED light', 'Three brightness settings', 'Height: 28 cm', 'Plug-in power supply'] },
    { id: 'speaker', name: 'Tempo Speaker', category: 'Audio', price: 6900, image: 'assets/speaker.jpg', color: 'Poppy red', badge: '', description: 'A little colour. A lot of sound. Take your favourite soundtrack from your desk to your next weekend away.', details: ['Portable wireless speaker', 'Up to 12 hours of playback', 'Water-resistant construction', 'Integrated carrying loop'] },
    { id: 'vase', name: 'Arc Glass Vase', category: 'Home', price: 3900, image: 'assets/vase.jpg', color: 'Forest green', badge: '', description: 'Beautiful with a single stem, just as lovely on its own. A simple curved form in light-catching green glass.', details: ['Coloured glass', 'Height: 22 cm', 'Hand-wash recommended', 'Each finish is slightly unique'] },
    { id: 'bottle', name: 'Everyday Bottle', category: 'Everyday', price: 2900, image: 'assets/bottle.jpg', color: 'Brushed steel', badge: 'Bestseller', description: 'Your daily plus-one. A clean, durable bottle that goes wherever the day takes you.', details: ['Stainless steel construction', '500 ml capacity', 'Leak-resistant screw cap', 'Hand-wash recommended'] },
    { id: 'clock', name: 'Still Desk Clock', category: 'Home', price: 4500, image: 'assets/clock.jpg', color: 'Charcoal', badge: '', description: 'Make a little time for good design. A quiet, minimal clock with a clear face and a considered finish.', details: ['Silent movement', 'Diameter: 16 cm', 'Freestanding design', 'One AA battery required'] },
  ];
  function normalizeCart(value) {
    if (!Array.isArray(value)) return [];
    const result = new Map();
    for (const item of value) {
      if (!item || !products.some(p => p.id === item.id) || !Number.isInteger(item.quantity) || item.quantity < 1) continue;
      result.set(item.id, Math.min(99, (result.get(item.id) || 0) + item.quantity));
    }
    return [...result].map(([id, quantity]) => ({ id, quantity }));
  }
  function changeQuantity(cart, id, delta) {
    const next = normalizeCart(cart);
    if (!products.some(p => p.id === id) || !Number.isInteger(delta)) return next;
    const item = next.find(row => row.id === id);
    const quantity = Math.min(99, (item ? item.quantity : 0) + delta);
    if (quantity <= 0) return next.filter(row => row.id !== id);
    if (item) item.quantity = quantity;
    else next.push({ id, quantity });
    return next;
  }
  function totals(cart) {
    const rows = normalizeCart(cart);
    const count = rows.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = rows.reduce((sum, item) => sum + products.find(p => p.id === item.id).price * item.quantity, 0);
    const shipping = subtotal === 0 || subtotal >= 10000 ? 0 : 490;
    return { count, subtotal, shipping, total: subtotal + shipping };
  }
  function filterProducts({ category = 'All', query = '', sort = 'featured', favourites = null } = {}) {
    const search = query.trim().toLowerCase();
    const result = products.filter(p => (category === 'All' || category === p.category) && (!favourites || favourites.includes(p.id)) && `${p.name} ${p.category} ${p.color}`.toLowerCase().includes(search));
    if (sort === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sort === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }
  root.FormaStore = { products, normalizeCart, changeQuantity, totals, filterProducts };
})(typeof window !== 'undefined' ? window : globalThis);