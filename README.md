# FORMA — HTML / CSS / JavaScript Webshop

A standalone English-language portfolio webshop. No framework, package installation, external services, API keys or build step required.

## Open the store

Extract the ZIP, keep all the files together, and open `index.html` in a modern browser. It also works on any ordinary static hosting service. All product images are included locally; the site does not need an internet connection.

## Files

- `index.html` — page structure and accessible dialog containers
- `styles.css` — design tokens, desktop/mobile layouts, reduced-motion support
- `store.js` — catalog data and pure cart/filter calculations
- `app.js` — rendering, search, sorting, favourites, cart and demo checkout
- `assets/` — generated product photographs

## Included

- Six sample products in three categories
- Live search, category filtering and price/name sorting
- Product detail dialogs with quantity selection
- Favourites and a shopping bag, remembered in the same browser when storage is available
- Quantity changes, removal and item/shipping/total calculations
- Validated demo checkout and confirmation
- Mobile layout, keyboard controls and native modal focus handling

## Important

This is a **frontend demonstration**, not a production store. Brand, products, descriptions, prices and policies are fictional examples. There is no payment processor, live inventory, customer account, order submission or delivery. Demo checkout details are not saved or transmitted. No real order is placed.

Sample shipping is €4.90, waived at a subtotal of €100 or more. Currency values are stored in integer cents. Cart quantities are limited to 99 per product.

Browser storage may be unavailable when using `file://` or privacy modes; the store continues to work for the current session in that case.

To customise the collection, edit `products` in `store.js`. To customise the appearance, edit the CSS variables at the top of `styles.css`.