import React, { Suspense, lazy } from "react";

// Public contract consumed: shop/ShopApp (a React component).
// React.lazy is the Module Federation consumption pattern from your notes:
// the remote's code is fetched at runtime from remoteEntry.js.
const ShopApp = lazy(() => import("shop/ShopApp"));

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="remote-loading">Loading shop (React MFE)…</div>}>
      <ShopApp />
    </Suspense>
  );
}
