export function getMastersCountLabel(count: number, language: string): string {
  if (language === 'ru') return getMastersLabelRu(count);
  if (language === 'ro') return getMastersLabelRo(count);
  return count === 1 ? `${count} master` : `${count} masters`;
}

function getMastersLabelRu(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} мастер`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${count} мастера`;
  return `${count} мастеров`;
}

function getMastersLabelRo(count: number): string {
  if (count === 1) return `${count} meșter`;
  return `${count} meseriași`;
}
