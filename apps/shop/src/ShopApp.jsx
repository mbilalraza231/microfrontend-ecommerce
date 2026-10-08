import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, EmptyState, formatPrice } from "@mfe-shop/ui";
import eventBus, { EVENTS } from "@mfe-shop/event-bus";
import "./shop.css";

const API = "http://localhost:4000/api";

/**
 * PUBLIC CONTRACT of the shop MFE: this single React component.
 * The shell may mount it; it may NOT reach into hooks/state/fetch logic.
 *
 * Products + Cart merged into one MFE (your decision). Domain events still
 * leave this app for OTHER MFEs: cart.itemAdded -> checkout (Angular) +
 * shell cart badge. That is the cross-framework loose-coupling demo.
 */
export default function ShopApp() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [flash, setFlash] = useState("");

  const loadCart = useCallback(() => {
    fetch(`${API}/cart`).then((r) => r.json()).then(setCart).catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API}/products`).then((r) => r.json()).then(setProducts).catch(() => {});
    loadCart();
  }, [loadCart]);

  const total = useMemo(
    () => cart.reduce((s, i) => s + i.product.price * i.quantity, 0),
    [cart]
  );

  async function addToCart(product) {
    // 1) persist via the API contract (backend), 2) broadcast the domain event.
    await fetch(`${API}/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    });
    setFlash(`Added "${product.name}" — cart.itemAdded published`);
    setTimeout(() => setFlash(""), 2000);
    eventBus.publish(EVENTS.CART_ITEM_ADDED, {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
    loadCart();
  }

  async function removeFromCart(item) {
    await fetch(`${API}/cart/${item.product.id}`, { method: "DELETE" });
    eventBus.publish(EVENTS.CART_ITEM_REMOVED, {
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
    });
    loadCart();
  }

  return (
    <div className="shop-grid">
      <section>
        <h2 className="shop-title">All products</h2>
        <div className="shop-products">
          {products.map((p) => (
            <Card key={p.id} className="shop-product">
              <img src={p.image} alt={p.name} loading="lazy" />
              <div className="cat">{p.category}</div>
              <h4>{p.name}</h4>
              <div className="price">{formatPrice(p.price)}</div>
              <div className="row">
                <span className="shop-added-flash" style={{ fontSize: 11, flex: 1 }}>
                  {p.id && flash.includes(p.name) ? "✓ added" : ""}
                </span>
                <Button onClick={() => addToCart(p)}>Add to cart</Button>
              </div>
            </Card>
          ))}
          {!products.length && <EmptyState message="Loading products…" />}
        </div>
      </section>

      <aside>
        <Card className="shop-cart">
          <h3>Your cart</h3>
          {cart.map((item) => (
            <div key={item.product.id} className="shop-cart-item">
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <span>
                {formatPrice(item.product.price * item.quantity)}{" "}
                <button title="remove" onClick={() => removeFromCart(item)}>✕</button>
              </span>
            </div>
          ))}
          {!cart.length && <EmptyState message="Cart is empty. Add something nice." />}
          <div className="shop-cart-total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="shop-added-flash">{flash}</div>
        </Card>
      </aside>
    </div>
  );
}
