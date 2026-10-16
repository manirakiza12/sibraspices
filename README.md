# SIBRA SPICES

A responsive wholesale and retail spice website built with Tailwind CSS 4 and plain JavaScript.

## Open

Open index.html directly in a browser. Compiled style.css, main.js, and local asset paths work without a server. The dist/index.html entry is also ready to open or deploy.

## Develop

npm install
npm run dev

Open http://localhost:5173. Edit index.html, main.js, and src/tailwind.css; refresh after changes. The source stylesheet is compiled into style.css. Set PORT to change the development port.

## Production and checks

npm run build
npm test

Upload the contents of dist/ to a static hosting service. The build recreates only the project's dist/ output directory.

## Features

- Utility bar, sticky navigation, mobile menu, floating WhatsApp action, and mobile contact bar.
- Three-slide crossfade carousel with arrows, dots, swipe navigation, keyboard controls, pause/play, and reduced-motion behavior. Autoplay pauses on hover, focus, and hidden tabs.
- Branch overview, product catalogue filters, four supplied UGX prices, and product-specific WhatsApp order drafts.
- Specialty blends, wholesale supply section, branch directions, TikTok links, and booking form.
- Validated booking intake for Name, Phone, Location, Service, and optional details. WhatsApp drafts use the supplied primary hotline in international format, +256763415857. The visitor reviews and sends the request; nothing is automatically sent or paid.
- Tailwind responsive layouts for small mobile screens, tablets, and desktop. Text inputs use 16px mobile type to avoid iOS focus zoom.

## Content and image notes

Branding, addresses, social proof, and prices follow the client brief. Opening hours were not supplied, so the footer asks visitors to confirm hours by phone. No appointments, inventory, or deliveries are automatically confirmed.

Photographs use the updated assets folder, including Sibra's own logo, shop, staff, jars, and supplied spice photographs. Descriptive copies include banner1.jpg, banner2.jpg, banner3.jpg, cardamom.jpg, cinnamon.jpg, cumin.jpg, star-anise.jpg, and storefront.jpg. Some catalogue photos show spice assortments and are labeled as such. Replace those with individual product photographs when available. Supplied image text and watermarks are retained.

## Verification

The production build, local image paths, internal anchors, brand data, and compiled responsive utilities pass automated checks. Interaction tests use a simulated DOM to exercise carousel navigation, swipes, pause, product filters, menu toggling, service selection, number validation, and WhatsApp draft encoding. These are not a substitute for real-browser/device QA, which was unavailable in the task environment.
