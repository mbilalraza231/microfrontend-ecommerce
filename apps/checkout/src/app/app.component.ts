import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// The event-bus package is plain framework-neutral JS — Angular imports it
// exactly like React/Vue do. That is why the bus is the right MFE<->MFE
// channel: it carries no framework baggage.
// @ts-ignore - plain JS workspace package without type declarations
import eventBus, { EVENTS } from '@mfe-shop/event-bus';

interface CartItem {
  product: { id: number; name: string; price: number };
  quantity: number;
}

/**
 * Checkout MFE (Angular) — PUBLIC surface is only ./mount.
 * Subscribes to cart.itemAdded published by the React shop MFE.
 * Publishes order.placed consumed by the Vue account MFE + shell badge.
 */
@Component({
  selector: 'checkout-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="co">
      <h2 class="co-title">Checkout <span class="co-tech">· Angular MFE</span></h2>

      <div *ngIf="lastEvent" class="co-flash">{{ lastEvent }}</div>

      <div class="co-card">
        <h3>Order summary</h3>
        <div *ngIf="!cart.length" class="co-empty">
          Your cart is empty. Add items in the Shop — this panel updates via the
          <code>cart.itemAdded</code> event, without the two apps knowing each other.
        </div>
        <div class="co-row" *ngFor="let item of cart">
          <span>{{ item.product.name }} × {{ item.quantity }}</span>
          <span>{{ item.product.price * item.quantity | currency:'USD':'symbol':'1.0-2' }}</span>
        </div>
        <div class="co-row co-total" *ngIf="cart.length">
          <span>Total</span>
          <span>{{ total | currency:'USD':'symbol':'1.0-2' }}</span>
        </div>
      </div>

      <div class="co-card">
        <h3>Payment</h3>
        <p class="co-note">Demo checkout — no real payment, no card fields.</p>
        <button class="co-pay" [disabled]="!cart.length || placing" (click)="placeOrder()">
          {{ placing ? 'Placing order…' : 'Place order' }}
        </button>
        <div *ngIf="placedMsg" class="co-done">{{ placedMsg }}</div>
      </div>
    </section>
  `,
  styles: [`
    .co { font-family: var(--mfe-font-stack); max-width: 560px; }
    .co-title { font-size: 20px; margin: 0 0 16px; }
    .co-tech { font-size: 12px; color: var(--mfe-color-muted); font-weight: 400; }
    .co-flash {
      background: #fff4ec; color: var(--mfe-color-primary-dark);
      border: 1px solid #f3d9c6; border-radius: var(--mfe-radius-md);
      padding: 8px 16px; margin-bottom: 16px; font-size: 13px;
    }
    .co-card {
      background: var(--mfe-color-surface); border: 1px solid var(--mfe-color-border);
      border-radius: var(--mfe-radius-lg); padding: 16px; margin-bottom: 16px;
    }
    .co-card h3 { margin: 0 0 12px; font-size: 15px; }
    .co-row { display: flex; justify-content: space-between; font-size: 14px; padding: 6px 0; border-bottom: 1px solid var(--mfe-color-border); }
    .co-total { font-weight: 700; border-bottom: none; }
    .co-empty { color: var(--mfe-color-muted); font-size: 13px; }
    .co-note { color: var(--mfe-color-muted); font-size: 12px; margin: 0 0 12px; }
    .co-pay {
      background: var(--mfe-color-primary); color: #fff; border: none;
      border-radius: var(--mfe-radius-md); padding: 10px 20px;
      font-weight: 700; font-size: 14px; cursor: pointer; font-family: var(--mfe-font-stack);
    }
    .co-pay:disabled { opacity: 0.5; cursor: not-allowed; }
    .co-done { color: var(--mfe-color-success); font-size: 13px; margin-top: 10px; }
  `],
})
export class AppComponent implements OnInit, OnDestroy {
  cart: CartItem[] = [];
  lastEvent = '';
  placedMsg = '';
  placing = false;

  private offAdded?: () => void;
  private offRemoved?: () => void;

  get total(): number {
    return this.cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  }

  ngOnInit(): void {
    this.loadCart();
    // SUBSCRIBER side of the domain-event contract (see React shop app).
    this.offAdded = eventBus.subscribe(EVENTS.CART_ITEM_ADDED, (e: any) => {
      this.lastEvent = `cart.itemAdded received: ${e.payload.name} (from another MFE)`;
      setTimeout(() => (this.lastEvent = ''), 3500);
      this.loadCart();
    });
    this.offRemoved = eventBus.subscribe(EVENTS.CART_ITEM_REMOVED, () => this.loadCart());
  }

  ngOnDestroy(): void {
    if (this.offAdded) this.offAdded();
    if (this.offRemoved) this.offRemoved();
  }

  loadCart(): void {
    fetch('http://localhost:4000/api/cart')
      .then((r) => r.json())
      .then((items) => (this.cart = items))
      .catch(() => {});
  }

  /** PUBLISHER side: order.placed -> Vue account MFE refreshes, shell badge resets. */
  placeOrder(): void {
    this.placing = true;
    fetch('http://localhost:4000/api/orders', { method: 'POST' })
      .then((r) => r.json())
      .then((order) => {
        this.placing = false;
        this.placedMsg = `Order #${order.id} placed — order.placed published on the bus`;
        eventBus.publish(EVENTS.ORDER_PLACED, {
          orderId: order.id,
          total: order.total,
          items: order.items.length,
        });
        this.cart = [];
        setTimeout(() => (this.placedMsg = ''), 5000);
      })
      .catch(() => (this.placing = false));
  }
}
