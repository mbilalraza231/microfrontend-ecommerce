import React from "react";
import { Link } from "react-router-dom";

/**
 * Home lives INSIDE the shell (decision made): it is a static marketing
 * page — no cart logic, no own state — so it needs no separate MFE.
 */
const CATEGORIES = [
  { slug: "home", title: "Home & Living", blurb: "Lamps, linen, coffee kits and more." },
  { slug: "audio", title: "Audio", blurb: "Headphones, speakers, studio monitors." },
  { slug: "electronics", title: "Electronics", blurb: "Keyboards, hubs, webcams." },
  { slug: "stationery", title: "Stationery", blurb: "Notebooks for slow thinking." },
];

export default function Home() {
  return (
    <div>
      <section className="home-hero">
        <h1>Everything shop. One page.</h1>
        <p>
          A storefront built from independently deployable micro-frontends:
          React shell + React shop/search + Vue account + Angular checkout.
        </p>
      </section>
      <section className="home-cats">
        {CATEGORIES.map((c) => (
          <Link key={c.slug} to={`/search?category=${c.slug}`} className="home-cat">
            <h3>{c.title}</h3>
            <p>{c.blurb}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
