// zone.js MUST be present before Angular bootstraps. Standalone, Angular
// loads it via the app polyfills in index.html. But when the React shell
// consumes this MFE as a remote, it only imports this exposed module and
// NEVER runs the remote's index.html/polyfills. Without zone.js,
// bootstrapApplication throws and the import rejects (masked as "Script
// error."). Importing it here guarantees the host gets it too.
import 'zone.js';
import { ApplicationRef } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { appConfig } from './app.config';

/**
 * PUBLIC CONTRACT of the checkout MFE (Angular 17, standalone).
 * The React shell cannot render Angular components, so we expose a mount
 * function that bootstraps the Angular app into its own DOM island and
 * returns an unmount cleanup.
 */
export function mount(el: HTMLElement): () => void {
  // Angular bootstraps by finding the root component's selector in the DOM.
  const host = document.createElement('checkout-root');
  el.appendChild(host);

  let appRef: ApplicationRef | undefined;
  bootstrapApplication(AppComponent, appConfig).then((ref: ApplicationRef) => (appRef = ref));

  return () => {
    if (appRef) appRef.destroy();
    host.remove();
  };
}
