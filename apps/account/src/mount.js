import { createApp } from "vue";
import AccountApp from "./AccountApp.vue";

/**
 * PUBLIC CONTRACT of the account MFE (Vue 3).
 * The React shell cannot render Vue components, so instead of a component
 * we expose a mount function: give us an element, we own that DOM island.
 * Returns the unmount cleanup, which the shell calls on route change.
 */
export function mount(el) {
  const app = createApp(AccountApp);
  app.mount(el);
  return () => app.unmount();
}
