import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import ShopPage from "./remotes/ShopPage";
import SearchPage from "./remotes/SearchPage";
import AccountPage from "./remotes/AccountPage";
import CheckoutPage from "./remotes/CheckoutPage";

/**
 * The shell is deliberately thin:
 *  - routing: URL -> which MFE gets loaded
 *  - layout: header/nav/footer + cart badge (event subscriber)
 *  - composition: mounts React remotes as components, Vue/Angular via mount()
 * No ecommerce business logic lives here.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="shell-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop/*" element={<ShopPage />} />
          <Route path="/search/*" element={<SearchPage />} />
          <Route path="/account/*" element={<AccountPage />} />
          <Route path="/checkout/*" element={<CheckoutPage />} />
        </Routes>
      </main>
      <footer className="shell-footer">
        microfrontend-ecommerce — shell (React) · shop (React) · search (React) ·
        account (Vue) · checkout (Angular)
      </footer>
    </BrowserRouter>
  );
}
