function convertHextoRgb(hex) {
  const result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

function getColorDiff(colorA, colorB) {
  const colorDiff = [];

  for (let i = 0; i < 3; i++) {
    colorDiff.push(colorB[i] - colorA[i]);
  }

  return colorDiff;
}
