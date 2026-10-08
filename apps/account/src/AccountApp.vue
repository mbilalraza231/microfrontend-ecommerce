<script>
import { defineComponent } from "vue";
import eventBus, { EVENTS } from "@mfe-shop/event-bus";

const API = "http://localhost:4000/api";

/**
 * Account MFE (Vue 3) — internal logic entirely private.
 * It knows NOTHING about the Angular checkout app; it only knows the
 * order.placed event CONTRACT. When checkout publishes an order, this
 * Vue list refreshes. React shell, Angular publisher, Vue subscriber —
 * three frameworks, one loose contract. That is the industry pattern.
 */
export default defineComponent({
  name: "AccountApp",
  data() {
    return {
      orders: [],
      user: { name: "Demo User", email: "demo@mfe-shop.dev" },
      notice: "",
    };
  },
  mounted() {
    this.loadOrders();
    // Subscribe BEFORE unmount cleanup: keep the reference for removal.
    this.offOrdered = eventBus.subscribe(EVENTS.ORDER_PLACED, (e) => {
      this.notice = `New order #${e.payload.orderId} just placed (via event bus)`;
      this.loadOrders();
      setTimeout(() => (this.notice = ""), 4000);
    });
  },
  unmounted() {
    if (this.offOrdered) this.offOrdered();
  },
  methods: {
    loadOrders() {
      fetch(`${API}/orders`)
        .then((r) => r.json())
        .then((orders) => (this.orders = orders))
        .catch(() => {});
    },
    money(n) {
      return Number(n).toLocaleString("en-US", { style: "currency", currency: "USD" });
    },
  },
});
</script>

<template>
  <section class="acct">
    <h2 class="acct-title">My account <span class="acct-tech">· Vue 3 MFE</span></h2>

    <div v-if="notice" class="acct-notice">{{ notice }}</div>

    <div class="acct-profile">
      <div class="acct-avatar">{{ user.name.charAt(0) }}</div>
      <div>
        <strong>{{ user.name }}</strong>
        <p class="acct-email">{{ user.email }}</p>
      </div>
    </div>

    <h3>Order history</h3>
    <div v-if="!orders.length" class="acct-empty">
      No orders yet. Add items in the Shop and place an order in Checkout —
      this list will refresh through the <code>order.placed</code> event.
    </div>
    <article v-for="order in orders" :key="order.id" class="acct-order">
      <header>
        <strong>Order #{{ order.id }}</strong>
        <span>{{ money(order.total) }}</span>
      </header>
      <ul>
        <li v-for="item in order.items" :key="item.productId">
          {{ item.name }} × {{ item.quantity }} — {{ money(item.price * item.quantity) }}
        </li>
      </ul>
      <footer>{{ new Date(order.placedAt).toLocaleString() }}</footer>
    </article>
  </section>
</template>

<style>
@import "@mfe-shop/ui/tokens.css";
</style>

<style scoped>
.acct { font-family: var(--mfe-font-stack); }
.acct-title { font-size: 20px; margin: 0 0 var(--mfe-space-4); }
.acct-tech { font-size: 12px; color: var(--mfe-color-muted); font-weight: 400; }
.acct-notice {
  background: #eaf6ec;
  color: var(--mfe-color-success);
  border: 1px solid #cfe8d4;
  border-radius: var(--mfe-radius-md);
  padding: var(--mfe-space-2) var(--mfe-space-4);
  margin-bottom: var(--mfe-space-4);
  font-size: 13px;
}
.acct-profile {
  display: flex; align-items: center; gap: var(--mfe-space-3);
  background: var(--mfe-color-surface);
  border: 1px solid var(--mfe-color-border);
  border-radius: var(--mfe-radius-lg);
  padding: var(--mfe-space-4);
  margin-bottom: var(--mfe-space-6);
}
.acct-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--mfe-color-primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 18px;
}
.acct-profile p { margin: 2px 0 0; }
.acct-email { color: var(--mfe-color-muted); font-size: 13px; }
.acct-empty { color: var(--mfe-color-muted); font-size: 14px; }
.acct-order {
  background: var(--mfe-color-surface);
  border: 1px solid var(--mfe-color-border);
  border-radius: var(--mfe-radius-md);
  padding: var(--mfe-space-4);
  margin-bottom: var(--mfe-space-3);
}
.acct-order header { display: flex; justify-content: space-between; font-size: 14px; }
.acct-order ul { margin: var(--mfe-space-2) 0; padding-left: var(--mfe-space-4); font-size: 13px; }
.acct-order footer { color: var(--mfe-color-muted); font-size: 12px; }
</style>
