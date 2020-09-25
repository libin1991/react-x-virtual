export function getRandColor() {
  const rColor = '#' + Math.floor(Math.random() * 16777215).toString(16);

  return rColor;
}

export function getRandSize(min, max) {
  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new Error('Invalid min/max value');
  }
  return min + Math.floor(Math.random() * (max - min));
}
