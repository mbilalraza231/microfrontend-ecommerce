import React from "react";
import useMountRemote from "./useMountRemote";

// Public contract consumed: account/mount -> mount(el) (Vue 3 app).
export default function AccountPage() {
  const { ref, error, loading } = useMountRemote(() => import("account/mount"));
  return (
    <div>
      {loading && <div className="remote-loading">Loading account (Vue MFE)…</div>}
      {error && (
        <div className="remote-error">
          Account MFE failed to load: {error.message} — check it is running on
          http://localhost:3003 and its mount contract exports mount(el).
        </div>
      )}
      <div ref={ref} />
    </div>
  );
}
