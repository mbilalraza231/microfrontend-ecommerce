import React, { Suspense, lazy } from "react";

// Public contract consumed: search/SearchApp (a React component).
const SearchApp = lazy(() => import("search/SearchApp"));

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="remote-loading">Loading search (React MFE)…</div>}>
      <SearchApp />
    </Suspense>
  );
}
