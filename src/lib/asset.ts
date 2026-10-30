/** Join a public asset path with the Vite base (needed for GitHub Pages). */
export function asset(path: string) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${path.replace(/^\//, '')}`
}
