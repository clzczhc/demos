const options = {
  width: 400,
  height: 400,
  time: 20
};

const textOptions = {
  words: '赤蓝紫',
  font: '200px Arial'
};

const mousePosition = {
  mouseX: 0,
  mouseY: 0
};

/** 中心影响的半径 */
const Radius = 100;
/** 排斥/吸引 力度 */
const Inten = 0.8;

const canvas = document.getElementById('grain');
const ctx = canvas.getContext('2d');

options.width = document.body.clientWidth;
options.height = document.body.clientHeight;

canvas.width = options.width;
canvas.height = options.height;

function createVitualCvs({ width, height }) {
  const vitualCvs = document.createElement('canvas');
  vitualCvs.width = width;
  vitualCvs.height = height;

  const vitualCtx = vitualCvs.getContext('2d');

  initCanvas(vitualCtx, options, textOptions);

  return getWordPxInfo(vitualCtx, options);
}

function initCanvas(vitualCtx, { width, height }, { font, words }) {
  vitualCtx.font = font;
  const measure = vitualCtx.measureText(words);   // 获取文字的宽高

  vitualCtx.fillText(words, (width - measure.width) / 2, height / 2);
}

function getWordPxInfo(vitualCtx, { width, height, speed}) {
  const imageData = vitualCtx.getImageData(0, 0, width, height).data;

  const gap = 6;
  const grains = [];

  for (let y = 0; y < height; y += gap) {
    for (let x = 0; x < width; x += gap) {
      const position = (width * y + x) * 4;   // 获取点阵信息
      const r = imageData[position];
      const g = imageData[position + 1];
      const b = imageData[position + 2];
      const a = imageData[position + 3];

      // 判断当前像素是否有文字
      if (r + g + b + a > 0) {
        grains.push(
          new Grain({x, y, speed})
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

  return timer;
}

class Grain {
  constructor(point) {
    this.targetX = point.x;
    this.targetY = point.y;

    this.x = (Math.random() * canvas.width) >> 0;
    this.y = (Math.random() * canvas.height) >> 0;

    this.radius = 3;
    // this.speed = Math.random() * 40 + point.speed;

    this.color = `purple`;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.closePath();
    this.update();
  }

  update() {
    const mx = this.targetX - this.x;
    const my = this.targetY - this.y;

    this.vx = mx / options.time;
    this.vy = my / options.time;

    const { mouseX, mouseY } = mousePosition;

    if (mouseX && mouseY) {
      // 计算粒子与鼠标的距离
      let dx = mouseX - this.x;
      let dy = mouseY - this.y;
      let distance = Math.sqrt(dx ** 2 + dy ** 2);

      // 粒子相对鼠标距离的比例，来确定收到的力度比例
      let disPercent = Radius / distance;

      // 设置阈值
      disPercent = disPercent > 7 ? 7 : disPercent;

      const angle = Math.atan2(dy, dx);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const repX = cos * disPercent * (-Inten);  // 将力度转换为x、y方向上的速度。如果是斥力，则速度减去得到的值。否则，速度加上得到的值。（即将Inten的负号去掉，就变成吸引）
      const repY = sin * disPercent * (-Inten);

      this.vx += repX;
      this.vy += repY;
    }

    this.x += this.vx;
    this.y += this.vy;
  }

  change(targetX, targetY) {
    
    this.targetX = targetX;
    this.targetY = targetY;
  }
}

canvas.addEventListener('mousemove', (e) => {
  const { left, top } = canvas.getBoundingClientRect();
  const { clientX, clientY } = e;

  mousePosition.mouseX = clientX - left;
  mousePosition.mouseY = clientY - top;
});

canvas.addEventListener('mouseleave', () => {
  mousePosition.mouseX = 0;
  mousePosition.mouseY = 0;
});

// 浅克隆
const points = [...createVitualCvs(options)];
const timer = init(points, options);

const inputEle = document.querySelector('input');
inputEle.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    textOptions.words = inputEle.value;

    const newPoints = createVitualCvs(options);
    changeFont(points, newPoints);
  }
});

function changeFont(oldPoints, newPoints) {
  const oldLen = oldPoints.length;
  const newLen = newPoints.length;

  for (let i = 0; i < newPoints.length; i++) {
    const { targetX, targetY } = newPoints[i];                                           

    // 如果在旧的点集里存在，则调用change改变位置。否则，新增
    if (oldPoints[i]) {
      oldPoints[i].change(targetX, targetY);
    } else {
      oldPoints[i] = new Grain({ x: targetX, y: targetY });
    }
  }

  // 新点集比旧点击小
  if (newLen < oldLen) {
    oldPoints.splice(newLen, oldLen);
  }

  // 随机打算顺序，让切换更自然
  let len = oldPoints.length;
  while (len) {
    const randomIndex = (Math.random() * (len--)) >> 0;
    const randomPoint = oldPoints[randomIndex];

    debugger;

    const { targetX, targetY } = randomPoint;

    randomPoint.targetX = oldPoints[len].targetX;
    randomPoint.targetY = oldPoints[len].targetY;

    oldPoints[len].targetX = targetX;
    oldPoints[len].targetY = targetY;
  }

}