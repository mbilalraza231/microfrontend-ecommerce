# microfrontend-ecommerce

A production-pattern **ecommerce micro-frontends monorepo** demonstrating real-world MFE architecture: **five independently deployable apps, three frameworks, one seamless storefront** — composed at runtime with Webpack Module Federation.

This is a learning-grade reference implementation: no framework abstractions hiding the contracts. Every integration seam (HTTP, event bus, mount functions, shared singletons) is visible and documented.

## Architecture

| App | Framework | Port | Role |
|---|---|---|---|
| **shell** | React 18 | `3000` | Orchestrator: routing, layout, header, cart badge. Owns *no* business logic. Home page lives here. |
| **shop** | React 18 | `3001` | Products + cart in one MFE (merged on purpose — see [decisions](#architecture-decisions)). Exposes a React component. |
| **search** | React 18 | `3002` | Debounced search with category filters. Exposes a React component. |
| **account** | Vue 3 | `3003` | Order history. Exposes `mount(el)` — a DOM island, not a Vue component (React can't render Vue). |
| **checkout** | Angular 17 | `4200` | Order summary + place order. Exposes `mount(el)` — same island pattern. |
| **backend** | Express | `4000` | Single shared API. No BFF. Source of truth for products, cart, orders. |

```
                        ┌──────────────────────────────┐
      browser ────────► │  shell :3000 (React)         │
                        │  routes · header · cart badge│
                        └───────┬──────┬──────┬────────┘
                 Module         │      │      │
                 Federation   <script> <script> <script>   (remoteEntry.js)
                                │      │      │
                   ┌────────────┼──────┼──────┼──────────────┐
                   ▼            ▼      ▼      ▼              ▼
              shop :3001    search :3002  account :3003  checkout :4200
              (React)       (React)       (Vue island)   (Angular island)
                   │            │              │             │
                   └────────────┴───────┬──────┴─────────────┘
                                        ▼
                          in-memory domain event bus (zero network)
                                        │
              every app ──── HTTP/JSON (fetch + CORS) ──── backend :4000
```

### The three integration contracts

1. **Component contract** (React ↔ React): `shop/ShopApp`, `search/SearchApp` are exposed as components and rendered directly by the shell.
2. **Mount contract** (React ↔ Vue/Angular): `account/mount`, `checkout/mount` expose `mount(el) → unmount()`. The React shell treats them as DOM islands — a framework can never render another framework's components.
3. **Event contract** (any ↔ any): domain events on a shared in-memory bus — `cart.itemAdded`, `cart.itemRemoved`, `order.placed`, `user.loggedIn`, `user.loggedOut`. Publisher and subscribers never know each other exist.

**Key rule:** events are *doorbells, not data*. The backend is the source of truth — listeners refetch after an event (exception: the cart badge uses the event payload for an instant optimistic count; being briefly wrong is cheap there, being wrong about a payment total is not).

## Sharing rules

Shared via Module Federation `singleton`: `react`, `react-dom`, `react-router-dom`, `@mfe-shop/event-bus`, `@mfe-shop/ui`.

Deliberately **not** shared: `vue`, `@angular/*` — each framework island brings its own runtime. (Vue and Angular can't consume a React singleton anyway.)

Cross-framework design consistency comes from **tokens, not components**: `@mfe-shop/ui/tokens.css` (CSS custom properties) is imported by all five apps. The React component library (`@mfe-shop/ui`) is used only by React apps — that's normal, not a failure.

## Getting started

```bash
npm install          # once, at repo root (npm workspaces links everything)
```

Run each process in its own terminal (backend first, rest in any order):

```bash
npm run backend      # :4000
npm run dev:shell    # :3000  ← open THIS url only
npm run dev:shop     # :3001
npm run dev:search   # :3002
npm run dev:account  # :3003
npm run dev:checkout # :4200
```

Then browse **http://localhost:3000** — the shell pulls in all remotes at runtime.

### Try the domain-event flow

1. Home → **Shop**: add a product to cart → watch badge + cart sidebar update
2. **Checkout** (Angular island): see the cart line you just added, live
3. Place order → watch **Account** (Vue island) order history refresh without reload
4. DevTools console: every event shows as `[event-bus] published "cart.itemAdded" {...}`

### API

`GET /api/products` · `GET /api/products/:id` · `GET /api/search?q=&category=` · `GET|POST /api/cart` · `DELETE /api/cart/:productId` · `GET|POST /api/orders`

## Repo layout

```
packages/
  event-bus/    # framework-agnostic pub/sub, window singleton (no network)
  ui/           # design tokens (CSS vars) + React component library
backend/        # Express, in-memory data, CORS
apps/
  shell/        # React orchestrator (webpack 5 Module Federation host)
  shop/         # React remote — products + cart
  search/       # React remote — search
  account/      # Vue 3 remote — mount-island
  checkout/     # Angular 17 remote — mount-island (ngx-build-plus + @angular-architects)
```

## Architecture decisions

- **Products + cart merged in one `shop` MFE** — they share state transitions so tightly that splitting them would force event-sync between two halves of one domain. Merge boundary = transactional coupling, not page count.
- **Home lives inside the shell** — it's layout, not a bounded domain.
- **Single backend, no BFF** — five screens don't justify five aggregation layers. BFF earns its rent only when API shapes genuinely diverge per team.
- **In-memory browser event bus, not Kafka** — client-side coordination inside one tab needs zero infrastructure. A broker becomes relevant when events must cross users/devices, and that's a *server-side* conversation.

## Lessons learned (the Angular-as-remote gauntlet)

Introducing an Angular 17 MFE into a classic webpack React shell took four layered fixes — each invisible until the previous one was solved. Documented so you don't repeat them:

1. **zone.js absent in the host** — a remote's `index.html` polyfills never run inside a host; `import 'zone.js'` must live inside the exposed module.
2. **`Cannot use 'import.meta' outside a module`** — Angular 17 emits ESM runtime; the host loads `remoteEntry.js` as a classic `<script>`. Fix: `output: { module: false, environment: { module: false } }`.
3. **ESM container export** — host needs a global variable. Fix: `library: { name: 'checkout', type: 'var' }` (name is mandatory with `var`).
4. **`ChunkLoadError` from the wrong origin** — `publicPath: "auto"` resolves to the *page* URL inside a host. Fix: pin `output.publicPath` to the remote's own absolute origin.

Golden rule these taught: **the remote's build output must match the host's loader assumptions — script format, registration style, and asset base URL.** Source code can be flawless and still be "unreachable."

Also: cross-origin errors are masked by browsers as `Script error.` — always verify remotes by inspecting served bytes, not just standalone behavior.

## Tech stack

Webpack 5.94 (pinned — Angular's toolchain requires the version nested in `@angular-devkit`) · React 18 · Vue 3 · Angular 17 standalone · Express 4 · npm workspaces · `@mfe-shop/*` scope
