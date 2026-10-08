import React from "react";
import useMountRemote from "./useMountRemote";

// Public contract consumed: checkout/mount -> mount(el) (Angular app).
export default function CheckoutPage() {
  const { ref, error, loading } = useMountRemote(() => import("checkout/mount"));
  return (
    <div>
      {loading && <div className="remote-loading">Loading checkout (Angular MFE)…</div>}
      {error && (
        <div className="remote-error">
          Checkout MFE failed to load: {error.message} — check it is running on
          http://localhost:4200 and its mount contract exports mount(el).
        </div>
      )}
      <div ref={ref} />
    </div>
  );
}
