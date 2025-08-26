export function parseCookieMaxAge(expires: string | undefined): number {
  if (!expires) return 7 * 24 * 3600 * 1000;
  if (expires.endsWith('ms')) return Number(expires.slice(0, -2));
  if (expires.endsWith('s')) return Number(expires.slice(0, -1)) * 1000;
  if (expires.endsWith('m')) return Number(expires.slice(0, -1)) * 60 * 1000;
  if (expires.endsWith('h'))
    return Number(expires.slice(0, -1)) * 60 * 60 * 1000;
  if (expires.endsWith('d'))
    return Number(expires.slice(0, -1)) * 24 * 60 * 60 * 1000;
  // fallback: try parse as number seconds
  const n = Number(expires);
  return Number.isFinite(n) ? n * 1000 : 7 * 24 * 3600 * 1000;
}
