const options = {
  width: 400,
  height: 400,
  time: 20,
};

const textOptions = {
  word: "赤蓝紫",
  font: "200px Arial",
};

const mousePosition = {
  mouseX: undefined,
  mouseY: undefined,
};

/** 中心影响的半径 */
const Radius = 100;
/** 排斥/吸引 力度 */
const Power = 0.8;

function initCanvas() {
  const canvas = document.getElementById("particle");
  const ctx = canvas.getContext("2d");

  options.width = document.body.clientWidth;
  options.height = document.body.clientHeight;

  canvas.width = options.width;
  canvas.height = options.height;

  return { canvas, ctx };
}
const { canvas, ctx } = initCanvas();

class Particle {
  constructor(point) {
    this.targetX = point.x;
    this.targetY = point.y;

    this.x = Math.round(Math.random() * canvas.width);
    this.y = Math.round(Math.random() * canvas.height);

    const mx = this.targetX - this.x;
    const my = this.targetY - this.y;
    this.vx = mx / options.time;
    this.vy = my / options.time;

    this.radius = 3;
    this.color = `purple`;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
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

      const repX = cos * Power * disPercent;
      const repY = sin * Power * disPercent;

      this.vx -= repX; // 将力度转换为x、y方向上的速度。如果是斥力，则速度减去得到的值。否则，速度加上得到的值。
      this.vy -= repY;
    }

    this.x += this.vx;
    this.y += this.vy;
  }

  change(targetX, targetY) {
    this.targetX = targetX;
    this.targetY = targetY;
  }
}

const points = getPointsInfo(options);
draw(points, options);

function getPointsInfo({ width, height }) {
  const virtualCvs = document.createElement("canvas");
  virtualCvs.width = width;
  virtualCvs.height = height;

  const virtualCtx = virtualCvs.getContext("2d");

  drawText(virtualCtx, options, textOptions);
  return getWordPxInfo(virtualCtx, options);
}

function drawText(virtualCtx, { width, height }, { font, word }) {
  virtualCtx.font = font;
  const measure = virtualCtx.measureText(word); // 获取文字的宽高

  virtualCtx.fillText(word, (width - measure.width) / 2, height / 2); // (width - measure.width) / 2是为了让文字居中
}

function getWordPxInfo(virtualCtx, { width, height, speed }) {
  const imageData = virtualCtx.getImageData(0, 0, width, height).data;

  const gap = 6;
  const particles = [];

  for (let y = 0; y < height; y += gap) {
    for (let x = 0; x < width; x += gap) {
      const position = (width * y + x) * 4; // 获取点阵信息
      const r = imageData[position];
      const g = imageData[position + 1];
      const b = imageData[position + 2];
      const a = imageData[position + 3];

      // 判断当前像素是否有文字
      if (r + g + b + a > 0) {
        // 粒子实例化
        particles.push(new Particle({ x, y }));
      }
    }
  }

  return particles;
}

function draw(points, { width, height }) {
  ctx.clearRect(0, 0, width, height);

  points.forEach((point) => {
    point.draw();
  });

  window.requestAnimationFrame(function () {
    draw(points, options);
  });
}

const inputEle = document.querySelector("input");
inputEle.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    textOptions.word = inputEle.value;

    const newPoints = getPointsInfo(options);
    changeFont(points, newPoints);
  }
});

function shuffle(oldPoints) {
  // 随机打算顺序，让切换更自然
  let len = oldPoints.length;
  while (len) {
    const randomIndex = Math.round(Math.random() * len--);
    const randomPoint = oldPoints[randomIndex];

    const { targetX, targetY } = randomPoint;

    randomPoint.targetX = oldPoints[len].targetX;
    randomPoint.targetY = oldPoints[len].targetY;

    oldPoints[len].targetX = targetX;
    oldPoints[len].targetY = targetY;
  }
}

function changeFont(oldPoints, newPoints) {
  const oldLen = oldPoints.length;
  const newLen = newPoints.length;

  for (let i = 0; i < newPoints.length; i++) {
    const { targetX, targetY } = newPoints[i];

    // 如果在旧的点集里存在，则调用change改变位置。否则，新增
    if (oldPoints[i]) {
      oldPoints[i].change(targetX, targetY);
    } else {
      oldPoints[i] = new Particle({ x: targetX, y: targetY });
    }
  }

  // 新点集比旧点击小
  if (newLen < oldLen) {
    oldPoints.splice(newLen, oldLen);
  }

  shuffle(oldPoints);
}

canvas.addEventListener("mousemove", (e) => {
  const { left, top } = canvas.getBoundingClientRect();
  const { clientX, clientY } = e;

  mousePosition.mouseX = clientX - left;
  mousePosition.mouseY = clientY - top;
});

canvas.addEventListener("mouseleave", () => {
  mousePosition.mouseX = undefined;
  mousePosition.mouseY = undefined;
});
