const options = {
  width: 400,
  height: 400,
  speed: 10
};

const textOptions = {
  words: '赤蓝紫',
  font: '200px Arial'
};

function pointCanvas(canvas, { width, height }) {
  canvas.width = width;
  canvas.height = height;
  ctx = canvas.getContext('2d');
  return ctx;
}

function createVitualCvs({ width, height }) {
  const vitualCvs = document.createElement('canvas');
  vitualCvs.width = width;
  vitualCvs.height = height;

  const vitualCtx = vitualCvs.getContext('2d');

  initCanvas(vitualCtx, options, textOptions);

  return getWordPxInfo(vitualCtx, options);
}

function initCanvas(ctx, { width, height }, { font, words }) {
  ctx.font = font;
  const measure = ctx.measureText(words);   // 获取文字的宽高

  ctx.fillText(words, (width - measure.width) / 2, height / 2);
}

function getWordPxInfo(ctx, { width, height, speed}) {
  const imageData = ctx.getImageData(0, 0, width, height).data;

  const grains = [];

  const gap = 4;

  for (let x = 0; x < width; x += gap) {
    for (let y = 0; y < height; y += gap) {

      const position = (width * y + x) * 4;   // 获取点阵信息
      // r: imageData[potision]
      // g: imageData[potision + 1]
      // b: imageData[potision + 2]

      const transparentIndex = position + 3;

      // 判断当前像素是否有文字
      if (imageData[transparentIndex] > 0) {
        grains.push(
          new grain({x, y, speed})
        )
      }
    }
  }

  return grains;
}

function init(points, { width, height }) {
  ctx.clearRect(0, 0, width, height);

  points.forEach((point) => {
    point.draw();
  });

  const timer = window.requestAnimationFrame(function () {
    init(points, options);
  })
}

class grain {
  constructor(point) {
    this.x = point.x;
    this.y = point.y;

    this.mx = Math.random() * canvas.width;
    this.my = Math.random() * canvas.height;

    this.radius = 3;
    this.speed = Math.random() * 40 + point.speed;

    this.color = `purple`;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.mx, this.my, this.radius, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.closePath();
    this.update();
  }

  update() {
    this.mx = this.mx + (this.x - this.mx) / this.speed;
    this.my = this.my + (this.y - this.my) / this.speed;
  }
}

window.onload = () => {
  options.width = document.body.clientWidth;
  options.height = document.body.clientHeight;

  window.canvas = document.getElementById('grain');

  pointCanvas(window.canvas, options);

  const points = createVitualCvs(options);
  init(points, options);
}

