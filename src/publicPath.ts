/** Vite `base`(BASE_URL) 기준 public 경로 — zip·서브폴더 배포용 */
export function resolvePublicPath(path: string): string {
  const base = import.meta.env.BASE_URL;
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${normalized}`;
}
