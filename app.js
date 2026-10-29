(function () {
  'use strict';
  const Store = window.FormaStore;
  if (!Store) return;
  const $ = id => document.getElementById(id);
  const icon = (name, extra = '') => `<svg class="icon ${extra}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const money = cents => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
    catch { return fallback; }
  };
  const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* The store also works when browser storage is unavailable. */ } };
  let cart = Store.normalizeCart(read('forma-cart-v1', []));
  const storedFavourites = read('forma-favourites-v1', []);
  let favourites = Array.isArray(storedFavourites) ? [...new Set(storedFavourites.filter(id => Store.products.some(p => p.id === id)))] : [];
  const filters = { category: 'All', query: '', sort: 'featured', savedOnly: false };
  let activeProduct = null;
  let detailQuantity = 1;
  let toastTimer;

  function toast(message) {
    clearTimeout(toastTimer);
    $('toast').textContent = message;
    $('toast').classList.add('visible');
    toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 2600);
  }
  function openDialog(dialog) {
    document.querySelectorAll('dialog[open]').forEach(item => item.close());
    dialog.showModal();
  }
  function renderCatalog() {
    const list = Store.filterProducts({ ...filters, favourites: filters.savedOnly ? favourites : null });
    $('result-count').textContent = `${list.length} ${filters.savedOnly ? 'saved ' : ''}${list.length === 1 ? 'object' : 'objects'}`;
    $('reset-filters').hidden = filters.category === 'All' && !filters.query && !filters.savedOnly && filters.sort === 'featured';
    document.querySelectorAll('.tab').forEach(tab => tab.setAttribute('aria-pressed', String(tab.dataset.category === filters.category)));
    $('favourites-toggle').setAttribute('aria-pressed', String(filters.savedOnly));
    $('favourites-toggle').setAttribute('aria-label', filters.savedOnly ? 'Show all products' : 'Show favourites');
    $('favourites-toggle').title = filters.savedOnly ? 'Show all products' : 'Show favourites';
    $('product-grid').innerHTML = list.length ? list.map(p => `
      <article class="product-card" data-product="${p.id}">
        <div class="product-visual">
          <button class="image-button" data-detail="${p.id}" aria-label="View ${p.name}"><img src="${p.image}" alt="${p.name} in ${p.color.toLowerCase()}" width="1024" height="1024" ${p.id === 'headphones' || p.id === 'lamp' || p.id === 'speaker' ? 'fetchpriority="high"' : 'loading="lazy"'}></button>
          ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
          <button class="icon-button" data-favourite="${p.id}" aria-pressed="${favourites.includes(p.id)}" aria-label="${favourites.includes(p.id) ? 'Unsave' : 'Save'} ${p.name}" title="${favourites.includes(p.id) ? 'Unsave' : 'Save'} ${p.name}">${icon('heart', 'heart')}</button>
        </div>
        <div class="product-info"><h2><button class="product-name" data-detail="${p.id}">${p.name}</button></h2></div>
        <p class="product-color">${p.color}</p>
        <div class="product-bottom"><span class="price">${money(p.price)}</span><button class="icon-button" data-add="${p.id}" aria-label="Add ${p.name} to bag" title="Add to bag">${icon('plus')}</button></div>
      </article>`).join('') : `<div class="empty-state">${icon(filters.savedOnly ? 'heart' : 'search')}<h2>${filters.savedOnly ? 'A little room for favourites.' : 'No objects found.'}</h2><p>${filters.savedOnly ? 'Your saved objects will be waiting here.' : 'Try a different search or explore the full collection.'}</p><button class="button" data-reset>Explore all objects ${icon('arrow')}</button></div>`;
  }
  function resetFilters() {
    Object.assign(filters, { category: 'All', query: '', sort: 'featured', savedOnly: false });
    $('search-input').value = '';
    $('sort-select').value = 'featured';
    renderCatalog();
  }
  function persistCart() {
    save('forma-cart-v1', cart);
    renderCart();
  }
  function addProduct(id, quantity = 1) {
    const p = Store.products.find(item => item.id === id);
    if (!p) return;
    const current = cart.find(item => item.id === id)?.quantity || 0;
    if (current >= 99) { toast('This object is already at the quantity limit.'); return; }
    cart = Store.changeQuantity(cart, id, quantity);
    persistCart();
    toast(`${p.name} added to your bag.`);
  }
  function renderCart() {
    const t = Store.totals(cart);
    $('cart-count').textContent = t.count;
    $('cart-count').hidden = !t.count;
    $('cart-toggle').setAttribute('aria-label', `Open shopping bag, ${t.count} ${t.count === 1 ? 'item' : 'items'}`);
    $('cart-title-count').textContent = `(${t.count})`;
    $('cart-items').innerHTML = cart.length ? cart.map(row => {
      const p = Store.products.find(item => item.id === row.id);
      if (!p) return '';
      return `<article class="cart-item"><img src="${p.image}" alt="${p.name}" width="82" height="94"><div><div class="cart-item-top"><h3>${p.name}</h3><button class="icon-button remove-button" data-remove="${p.id}" aria-label="Remove ${p.name}" title="Remove">${icon('trash')}</button></div><p class="product-color">${p.color}</p><div class="cart-item-controls"><div class="quantity-control"><button data-quantity="${p.id}" data-delta="-1" aria-label="Decrease ${p.name} quantity" title="Decrease quantity">${icon('minus')}</button><output aria-label="${p.name} quantity">${row.quantity}</output><button data-quantity="${p.id}" data-delta="1" aria-label="Increase ${p.name} quantity" title="Increase quantity" ${row.quantity >= 99 ? 'disabled' : ''}>${icon('plus')}</button></div><span class="price">${money(p.price * row.quantity)}</span></div></div></article>`;
    }).join('') : `<div class="empty-state">${icon('bag')}<h2>Your bag is taking a breather.</h2><p>Find something that makes your everyday better.</p><button class="button" data-close>Explore the collection ${icon('arrow')}</button></div>`;
    $('cart-summary').hidden = !t.count;
    $('cart-summary').innerHTML = t.count ? `<p class="shipping-progress">${t.subtotal >= 10000 ? 'A little extra: your shipping is on us.' : `You’re ${money(10000 - t.subtotal)} away from free shipping.`}</p><div class="summary-row"><span>Subtotal</span><span>${money(t.subtotal)}</span></div><div class="summary-row"><span>Shipping</span><span>${t.shipping ? money(t.shipping) : 'Free'}</span></div><div class="summary-row total"><span>Total</span><span>${money(t.total)}</span></div><button class="button" id="checkout-button">Continue to demo checkout ${icon('arrow')}</button><p class="demo-note">Demo only. No payment will be taken.</p>` : '';
  }
  function showProduct(id) {
    const p = Store.products.find(item => item.id === id);
    if (!p) return;
    activeProduct = p;
    detailQuantity = 1;
    $('product-detail').innerHTML = `<div class="product-detail"><img class="detail-image" src="${p.image}" alt="${p.name} in ${p.color.toLowerCase()}" width="1024" height="1024"><div class="detail-body"><p class="eyebrow">${p.category} collection</p><h3>${p.name}</h3><p class="product-color">${p.color}</p><p class="detail-price">${money(p.price)}</p><p class="detail-description">${p.description}</p><ul>${p.details.map(detail => `<li>${detail}</li>`).join('')}</ul><div class="detail-actions"><div class="quantity-control"><button id="detail-minus" aria-label="Decrease quantity" title="Decrease quantity" disabled>${icon('minus')}</button><output id="detail-quantity" aria-label="Quantity">1</output><button id="detail-plus" aria-label="Increase quantity" title="Increase quantity">${icon('plus')}</button></div><button class="button" id="detail-add">Add to bag ${icon('plus')}</button></div><p class="detail-stock">In stock · Sample product</p></div></div>`;
    openDialog($('product-dialog'));
  }
  function showCheckout() {
    const t = Store.totals(cart);
    if (!t.count) return;
    $('checkout-title').textContent = 'Demo checkout';
    $('checkout-content').innerHTML = `<div class="checkout-body"><p>This is a practice checkout. Use sample details — nothing is sent or stored, and no payment is collected.</p><form id="checkout-form"><div class="form-grid"><label class="field">First name<input name="firstName" required maxlength="80" autocomplete="off" placeholder="Alex"></label><label class="field">Last name<input name="lastName" required maxlength="80" autocomplete="off" placeholder="Taylor"></label><label class="field full">Email<input name="email" type="email" required maxlength="120" autocomplete="off" placeholder="alex@example.com"></label><label class="field full">Street address<input name="address" required maxlength="150" autocomplete="off" placeholder="12 Sample Street"></label><label class="field">City<input name="city" required maxlength="80" autocomplete="off" placeholder="Zagreb"></label><label class="field">Postal code<input name="postal" required maxlength="16" autocomplete="off" placeholder="10000"></label><label class="field full">Country<select name="country" aria-label="Country" required><option value="">Select a country</option><option>Croatia</option><option>Austria</option><option>Germany</option><option>Italy</option><option>Slovenia</option><option>France</option><option>Netherlands</option><option>Other</option></select></label></div><div class="checkout-total"><span>Demo order total</span><span>${money(t.total)}</span></div><button type="submit" class="button">Complete demo order ${icon('arrow')}</button><p class="demo-note">No card details needed. This will not create a real order.</p></form></div>`;
    openDialog($('checkout-dialog'));
  }
  function finishCheckout(event) {
    event.preventDefault();
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.reportValidity()) return;
    // Require meaningful content, not just whitespace, without storing customer data.
    for (const input of form.querySelectorAll('input[required]')) {
      if (!input.value.trim()) { input.setCustomValidity('Please fill out this field.'); input.reportValidity(); return; }
    }
    const t = Store.totals(cart);
    if (!t.count) return;
    cart = [];
    persistCart();
    $('checkout-title').textContent = 'All done';
    $('checkout-content').innerHTML = `<div class="success">${icon('check')}<h3>A little joy, on the way.</h3><p>Your demo order is complete.</p><p>${t.count} ${t.count === 1 ? 'object' : 'objects'} · ${money(t.total)}</p><p class="demo-note">No payment was taken and no real order was placed.<br>Your sample details were not saved.</p><button class="button" data-close>Back to the collection ${icon('arrow')}</button></div>`;
    $('checkout-content').querySelector('button').focus();
  }
  const information = {
    about: { title: 'The FORMA story', content: '<p>Good design belongs in the everyday. FORMA brings together simple, useful objects with a little personality — from your morning coffee soundtrack to the light beside your favourite chair.</p><p>FORMA is a fictional store created as a portfolio project. Product photography, descriptions, prices and store policies are sample content, not real offers.</p>' },
    shipping: { title: 'Shipping & returns', content: '<p>Sample shipping: €4.90 per order, or free on orders of €100 and above. Estimated delivery: 3–5 business days.</p><p>Sample returns: unused items may be returned within 30 days.</p><p>This is a demo store. No products are shipped, and no purchases or returns are processed.</p>' },
    contact: { title: 'Say hello', content: '<p>FORMA is a fictional design store, so there is no live customer service or support address.</p><p>All products and prices are examples. You can browse the collection, save favourites and try a demo checkout without making a real purchase.</p>' },
  };
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    if (button.hasAttribute('data-close')) { button.closest('dialog')?.close(); return; }
    if (button.dataset.category) {
      filters.category = button.dataset.category;
      filters.savedOnly = false;
      renderCatalog();
      if (button.classList.contains('nav-link')) $('catalog').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (button.dataset.detail) { showProduct(button.dataset.detail); return; }
    if (button.dataset.add) { addProduct(button.dataset.add); return; }
    if (button.dataset.favourite) {
      const id = button.dataset.favourite;
      favourites = favourites.includes(id) ? favourites.filter(item => item !== id) : [...favourites, id];
      save('forma-favourites-v1', favourites);
      renderCatalog();
      const replacement = document.querySelector(`[data-favourite="${id}"]`);
      if (replacement) replacement.focus({ preventScroll: true });
      else $('favourites-toggle').focus({ preventScroll: true });
      toast(favourites.includes(id) ? 'Saved to your favourites.' : 'Removed from favourites.');
      return;
    }
    if (button.dataset.quantity) {
      const id = button.dataset.quantity;
      const delta = Number(button.dataset.delta);
      cart = Store.changeQuantity(cart, id, delta);
      persistCart();
      const replacement = $('cart-items').querySelector(`[data-quantity="${id}"][data-delta="${delta}"]`);
      if (replacement && !replacement.disabled) replacement.focus({ preventScroll: true });
      else $('cart-dialog').querySelector('[data-close]').focus({ preventScroll: true });
      return;
    }
    if (button.dataset.remove) { cart = cart.filter(item => item.id !== button.dataset.remove); persistCart(); $('cart-dialog').querySelector('[data-close]').focus(); return; }
    if (button.hasAttribute('data-reset') || button.id === 'reset-filters') { resetFilters(); return; }
    if (button.dataset.info) {
      const info = information[button.dataset.info];
      if (info) { $('info-title').textContent = info.title; $('info-content').innerHTML = info.content; openDialog($('info-dialog')); }
      return;
    }
    switch (button.id) {
      case 'search-toggle': {
        const show = $('search-panel').hidden;
        $('search-panel').hidden = !show;
        button.setAttribute('aria-expanded', String(show));
        if (show) $('search-input').focus();
        else { filters.query = ''; $('search-input').value = ''; renderCatalog(); }
        break;
      }
      case 'search-clear': $('search-input').value = ''; filters.query = ''; renderCatalog(); $('search-input').focus(); break;
      case 'favourites-toggle': filters.savedOnly = !filters.savedOnly; filters.category = 'All'; filters.query = ''; $('search-input').value = ''; renderCatalog(); break;
      case 'cart-toggle': renderCart(); openDialog($('cart-dialog')); break;
      case 'checkout-button': showCheckout(); break;
      case 'detail-minus':
      case 'detail-plus':
        detailQuantity = Math.max(1, Math.min(99, detailQuantity + (button.id === 'detail-plus' ? 1 : -1)));
        $('detail-quantity').textContent = detailQuantity;
        $('detail-minus').disabled = detailQuantity === 1;
        $('detail-plus').disabled = detailQuantity === 99;
        break;
      case 'detail-add':
        if (activeProduct) { addProduct(activeProduct.id, detailQuantity); $('product-dialog').close(); }
        break;
    }
  });
  $('search-input').addEventListener('input', event => { filters.query = event.target.value; renderCatalog(); });
  $('sort-select').addEventListener('change', event => { filters.sort = event.target.value; renderCatalog(); });
  $('checkout-content').addEventListener('submit', finishCheckout);
  $('checkout-content').addEventListener('input', event => { if (event.target instanceof HTMLInputElement) event.target.setCustomValidity(''); });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
  window.addEventListener('storage', event => {
    if (event.key === 'forma-cart-v1') { cart = Store.normalizeCart(read('forma-cart-v1', [])); renderCart(); }
    if (event.key === 'forma-favourites-v1') {
      const value = read('forma-favourites-v1', []);
      favourites = Array.isArray(value) ? [...new Set(value.filter(id => Store.products.some(p => p.id === id)))] : [];
      renderCatalog();
    }
  });
  renderCatalog();
  renderCart();
})();