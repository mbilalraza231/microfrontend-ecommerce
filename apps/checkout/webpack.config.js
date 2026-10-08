const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

const federation = withModuleFederationPlugin({

  name: 'checkout',

  // Pin the container format to a classic-script global (`var checkout = ...`).
  // Angular 17's builder emits ESM output and re-enables it after our merge,
  // which makes remoteEntry.js end with `export {...}` — unparseable by the
  // <script> tag webpack hosts use, so the host reports "Loading script
  // failed (missing)". `type: 'var'` is what a classic webpack host expects.
  library: { name: 'checkout', type: 'var' },

  exposes: {
    // PUBLIC CONTRACT: a mount function, not an Angular component —
    // the React shell consumes it as import("checkout/mount").
    './mount': './src/app/mount.ts',
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: false, requiredVersion: 'auto' }),
  },

});

// Angular 17 builds with an ESM-friendly output environment, so webpack's
// publicPath-auto runtime emits `import.meta.url`. The React host loads
// remoteEntry.js as a CLASSIC <script>, where import.meta is a SyntaxError
// ("Cannot use 'import.meta' outside a module") and the whole container
// dies before registering. Forcing classic output makes this container
// consumable by any webpack 5 host, and standalone :4200 still works.
module.exports = {
  ...federation,
  output: {
    // Pin lazy-chunk URLs to THIS remote's origin. "auto" publicPath
    // self-detects via the page URL when running inside a host, so chunks
    // like 701.js were requested from :3000 (the shell) and 404'd.
    publicPath: 'http://localhost:4200/',
    module: false,
    environment: { module: false },
  },
};
