/**
 * @mfe-shop/event-bus
 *
 * Tiny in-memory pub/sub shared by ALL micro-frontends regardless of
 * framework. It attaches itself to `window.__MFE_EVENT_BUS__` so that even
 * if webpack bundles this package into every MFE separately, every app
 * still gets THE SAME instance — the bus is a browser-level singleton.
 *
 * This is NOT an API and it does NOT hit the network. It only delivers
 * domain events like `cart.itemAdded` between apps running in the page.
 */

class EventBus {
  constructor() {
    this.listeners = new Map(); // eventType -> Set of callbacks
  }

  /** Publish a domain event. `payload` must follow the event contract. */
  publish(type, payload = {}) {
    const event = { type, payload, timestamp: Date.now() };
    const subs = this.listeners.get(type);
    if (subs) {
      subs.forEach((cb) => {
        try {
          cb(event);
        } catch (err) {
          // One broken subscriber must never take down the others.
          console.error(`[event-bus] subscriber error for "${type}":`, err);
        }
      });
    }
    // Debug aid: every published event is logged during development.
    console.info(`[event-bus] published "${type}"`, payload);
  }

  /** Subscribe to a domain event. Returns an unsubscribe function. */
  subscribe(type, callback) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(callback);
    return () => this.unsubscribe(type, callback);
  }

  unsubscribe(type, callback) {
    const subs = this.listeners.get(type);
    if (subs) subs.delete(callback);
  }
}

// Global singleton — first app to load creates it, everyone else reuses it.
const GLOBAL_KEY = "__MFE_EVENT_BUS__";
if (typeof window !== "undefined" && !window[GLOBAL_KEY]) {
  window[GLOBAL_KEY] = new EventBus();
}

export const eventBus =
  typeof window !== "undefined" ? window[GLOBAL_KEY] : new EventBus();

// Well-known domain event names (the event contracts of this storefront).
export const EVENTS = {
  CART_ITEM_ADDED: "cart.itemAdded",
  CART_ITEM_REMOVED: "cart.itemRemoved",
  ORDER_PLACED: "order.placed",
  USER_LOGGED_IN: "user.loggedIn",
  USER_LOGGED_OUT: "user.loggedOut",
};

export default eventBus;
