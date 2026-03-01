function hashString(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function hslToCss(h: number, s = 70, l = 55) {
  return `hsl(${h} ${s}% ${l}%)`;
}

export function gradientFromId(id?: string) {
  const seed = hashString(id || 'unknown');
  const h1 = seed % 360;
  const h2 = (h1 + 40 + (seed % 60)) % 360;

  const c1 = hslToCss(h1, 75, 55);
  const c2 = hslToCss(h2, 75, 50);

  return { c1, c2 };
}
