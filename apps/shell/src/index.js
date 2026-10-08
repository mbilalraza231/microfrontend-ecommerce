// Module Federation rule: the entry file must ONLY dynamically import the
// bootstrap. This delay lets remotes/webpack runtime settle shared deps
// (the ONE React instance) before any component code executes.
import("./bootstrap");
