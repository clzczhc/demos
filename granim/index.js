const hexColorPairs = [
  ["#ff0000", "#0000ff"],
  ["#000000", "#ffffff"],
];

const rgbColorPairs = hexColorPairs.map((hexColorPair) => {
  return hexColorPair.map((hex) => convertHextoRgb(hex));
});

const rgbDiffPairs = rgbColorPairs.map((rgbColorPair, i) => {
  return rgbColorPair.map((rgbColor, j) => {
    if (i === rgbColorPairs.length - 1) {
      return getColorDiff(rgbColor, rgbColorPairs[0][j]);
    } else {
      return getColorDiff(rgbColor, rgbColorPairs[i + 1][j]);
    }
  });
});

let currentPairIndex = 0;
let paintColorPair = rgbColorPairs[currentPairIndex];

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 300;

const image = new Image();
image.src = "../granim/bg-forest.jpg";
ctx.globalCompositeOperation = "color-burn";

function makeGradient() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

  paintColorPair.forEach((paintColor, index) => {
    gradient.addColorStop(
      index === 0 ? 0 : 1,
      `rgb(${paintColor[0]}, ${paintColor[1]}, ${paintColor[2]})`
    );
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
makeGradient();

const duration = 5000; // 切换颜色的时间

let previousTimeStamp = 0; // 记录上一次地时间戳
let process = 0; // 进度，通过process /duration获取颜色累加的百分比
function animateColor(timestamp) {
  process = process + (timestamp - previousTimeStamp);
  previousTimeStamp = timestamp;

  const progressPercent = ((process / duration) * 100).toFixed(2);

  // 获取绘制颜色（颜色 + 偏移值）。偏移值会根据时间戳的变化，从0%到100%
  paintColorPair = rgbColorPairs[currentPairIndex].map((rgbColor, i) => {
    return rgbColor.map((item, j) => {
      return (
        item +
        Math.round(
          (rgbDiffPairs[currentPairIndex][i][j] / 100) * progressPercent
        )
      );
    });
  });

  // 绘制
  makeGradient();

  if (progressPercent < 100) {
    requestAnimationFrame(animateColor);
  } else {
    process = 0; // 进度超过百分比，重置进度

    if (currentPairIndex === rgbColorPairs.length - 1) {
      currentPairIndex = 0; // 更新到下一组颜色
    } else {
      currentPairIndex++;
    }

    requestAnimationFrame(animateColor);
  }
}

requestAnimationFrame(animateColor);
