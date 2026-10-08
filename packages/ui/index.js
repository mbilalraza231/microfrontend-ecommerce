/**
 * @mfe-shop/ui — our own (self-developed, not commercial) design system.
 *
 * Written with React.createElement instead of JSX on purpose: this package
 * has NO build step. The React apps (shell, shop, search) import it directly
 * and babel/webpack never needs to transpile this folder.
 *
 * Vue/Angular apps cannot import these React components — they import the
 * shared tokens instead:  @import "~@mfe-shop/ui/tokens.css";
 */
import { createElement } from "react";

export function Button({ variant = "primary", className = "", children, ...rest }) {
  return createElement(
    "button",
    { className: `mfe-btn mfe-btn--${variant} ${className}`.trim(), ...rest },
    children
  );
}

export function Card({ className = "", children, ...rest }) {
  return createElement("div", { className: `mfe-card ${className}`.trim(), ...rest }, children);
}

export function Badge({ children, ...rest }) {
  return createElement("span", { className: "mfe-badge", ...rest }, children);
}

export function EmptyState({ message }) {
  return createElement("p", { className: "mfe-empty" }, message);
}

/** Format a number as USD without cents for whole amounts. */
export function formatPrice(value) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}
