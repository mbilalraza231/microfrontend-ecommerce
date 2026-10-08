import React, { useEffect, useState } from "react";
import { Badge } from "@mfe-shop/ui";
import eventBus, { EVENTS } from "@mfe-shop/event-bus";

/**
 * The shell subscribes to the SAME domain event as the checkout MFE.
 * shop (React) publishes cart.itemAdded -> shell badge AND checkout (Angular)
 * react to it. Neither knows the other exists. That's loose coupling.
 */
export default function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Sync initial count from the backend on mount.
    fetch("http://localhost:4000/api/cart")
      .then((r) => r.json())
      .then((items) => setCount(items.reduce((s, i) => s + i.quantity, 0)))
      .catch(() => {});

    const offAdded = eventBus.subscribe(EVENTS.CART_ITEM_ADDED, (e) => {
      setCount((c) => c + (e.payload.quantity || 1));
    });
    const offRemoved = eventBus.subscribe(EVENTS.CART_ITEM_REMOVED, (e) => {
      setCount((c) => Math.max(0, c - (e.payload.quantity || 1)));
    });
    const offOrdered = eventBus.subscribe(EVENTS.ORDER_PLACED, () => setCount(0));
    return () => {
      offAdded();
      offRemoved();
      offOrdered();
    };
  }, []);

  return <Badge>{count}</Badge>;
}
