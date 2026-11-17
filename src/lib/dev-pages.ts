/**
 * Pages de démonstration (`/dev/*`) : visibles en développement, masquées en
 * production sauf si `ENABLE_DEV_PAGES=true` (environnement intégré, recette).
 */
export function isDevPagesEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.NODE_ENV !== "production" || env.ENABLE_DEV_PAGES === "true";
}
