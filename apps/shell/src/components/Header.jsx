import React from "react";
import { NavLink, Link } from "react-router-dom";
import { Badge } from "@mfe-shop/ui";
import CartBadge from "./CartBadge";

export default function Header() {
  return (
    <header className="shell-header">
      <Link to="/" className="shell-logo" style={{ textDecoration: "none", color: "inherit" }}>
        mfe<span>·</span>shop
      </Link>
      <nav className="shell-nav">
        <NavLink to="/shop" end>Shop</NavLink>
        <NavLink to="/search">Search</NavLink>
        <NavLink to="/account">Account</NavLink>
        <NavLink to="/checkout">Checkout</NavLink>
      </nav>
      <div className="shell-cart">
        Cart <CartBadge />
      </div>
    </header>
  );
}
