import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Card, EmptyState, formatPrice } from "@mfe-shop/ui";
import eventBus, { EVENTS } from "@mfe-shop/event-bus";
import "./search.css";

const API = "http://localhost:4000/api";
const CATEGORIES = ["home", "audio", "electronics", "stationery"];

/**
 * PUBLIC CONTRACT of the search MFE: this component.
 * Internals (debounce, filters, fetch) are private — the "kitchen".
 * Meilisearch can replace the naive /api/search call later without the
 * shell or any other MFE noticing: the contract stays the same.
 */
export default function SearchApp() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "";
  const [term, setTerm] = useState(params.get("q") || "");
  const [debounced, setDebounced] = useState(term);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  // Debounce: never fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(term), 300);
    return () => clearTimeout(t);
  }, [term]);

  useEffect(() => {
    const qs = new URLSearchParams();
    if (debounced) qs.set("q", debounced);
    if (category) qs.set("category", category);
    const url = `${API}/search?${qs.toString()}`;
    fetch(url).then((r) => r.json()).then((data) => {
      setResults(data);
      setSearched(true);
    }).catch(() => {});
  }, [debounced, category]);

  function toggleCategory(cat) {
    const next = new URLSearchParams(params);
    if (next.get("category") === cat) next.delete("category");
    else next.set("category", cat);
    setParams(next);
  }

  async function addToCart(product) {
    await fetch(`${API}/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    });
    // Same event contract as the shop MFE — checkout can't tell which app
    // published it, and doesn't need to.
    eventBus.publish(EVENTS.CART_ITEM_ADDED, {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  }

  const heading = useMemo(() => {
    if (!searched) return "Searching…";
    if (!results.length) return "No matches";
    return `${results.length} result${results.length > 1 ? "s" : ""}`;
  }, [results, searched]);

  return (
    <div>
      <div className="search-bar">
        <input
          className="search-input"
          placeholder="Search products… (try 'lamp' or 'audio')"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            const next = new URLSearchParams(params);
            if (e.target.value) next.set("q", e.target.value);
            else next.delete("q");
            setParams(next, { replace: true });
          }}
        />
        <div className="search-filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={category === cat ? "active" : ""}
              onClick={() => toggleCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="search-meta">{heading}</div>

      <div className="search-results">
        {results.map((p) => (
          <Card key={p.id} className="search-result">
            <img src={p.image} alt={p.name} loading="lazy" />
            <h4>{p.name}</h4>
            <div className="price">{formatPrice(p.price)}</div>
            <div className="row">
              <span className="search-meta">{p.category}</span>
              <Button variant="ghost" onClick={() => addToCart(p)}>Add</Button>
            </div>
          </Card>
        ))}
        {searched && !results.length && (
          <EmptyState message="Nothing found. Try another word or clear the category filter." />
        )}
      </div>
    </div>
  );
}
