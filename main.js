const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
  constructor(x, y, image, spline) {
    this.x = x;
    this.y = y;
    this.image = image;
    this.t = 0;
    this.spline = spline;
  }

  update(points, speed) {
    if (this.t < 1) {
      this.t += speed;
      const pos = this.spline(points, this.t);
      this.x = pos.x;
      this.y = pos.y;
    }
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x - 25, this.y - 25, 50, 50);
  }
}

class ParticleManager {
  constructor() {
    this.particles = [];
  }

  addParticle(x, y, points, speed, spline) {
    const img = new Image();
    img.src = "./star.svg";
    const particle = new Particle(x, y, img, spline);
    particle.points = points;
    particle.speed = speed;
    this.particles.push(particle);
  }

  update() {
    this.particles.forEach((p) => p.update(p.points, p.speed));
  }

  draw(ctx) {
    this.particles.forEach((p) => p.draw(ctx));
  }
}

const catmullRom = (points, t = 0.5) => {
  const alpha = 0.5;

  const p0 = points[0];
  const p1 = points[1];
  const p2 = points[2];
  const p3 = points.length > 3 ? points[3] : p2;

  // Вычисляем расстояния между соседними точками
  const d1 = Math.hypot(p1.x - p0.x, p1.y - p0.y);
  const d2 = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const d3 = Math.hypot(p3.x - p2.x, p3.y - p2.y);

  // Вычисляем степени расстояний для альфа
  const d1powA = Math.pow(d1, alpha);
  const d2powA = Math.pow(d2, alpha);
  const d3powA = Math.pow(d3, alpha);
  const d1pow2A = Math.pow(d1, 2 * alpha);
  const d2pow2A = Math.pow(d2, 2 * alpha);
  const d3pow2A = Math.pow(d3, 2 * alpha);

  // Вычисляем коэффициенты для преобразования в кривую Безье
  const A = 2 * d1pow2A + 3 * d1powA * d2powA + d2pow2A;
  const B = 2 * d3pow2A + 3 * d3powA * d2powA + d2pow2A;
  let N = 3 * d1powA * (d1powA + d2powA);
  let M = 3 * d3powA * (d3powA + d2powA);
  N = N !== 0 ? 1 / N : 0;
  M = M !== 0 ? 1 / M : 0;

  // Вычисляем контрольные точки для преобразования Catmull-Rom в кубическую кривую Безье
  let bp1 = {
    x: (-d2pow2A * p0.x + A * p1.x + d1pow2A * p2.x) * N,
    y: (-d2pow2A * p0.y + A * p1.y + d1pow2A * p2.y) * N,
  };

  let bp2 = {
    x: (d3pow2A * p1.x + B * p2.x - d2pow2A * p3.x) * M,
    y: (d3pow2A * p1.y + B * p2.y - d2pow2A * p3.y) * M,
  };

  // Если полученные контрольные точки оказались нулевыми (что может случиться при совпадении точек),
  // используем сами опорные точки
  if (bp1.x === 0 && bp1.y === 0) bp1 = { x: p1.x, y: p1.y };
  if (bp2.x === 0 && bp2.y === 0) bp2 = { x: p2.x, y: p2.y };

  // Вычисляем точку на кривой, используя стандартную формулу кубического Безье
  // Здесь конечными точками являются p1 и p2 (то есть кривая проходит через них)
  const x =
    Math.pow(1 - t, 3) * p1.x +
    3 * Math.pow(1 - t, 2) * t * bp1.x +
    3 * (1 - t) * Math.pow(t, 2) * bp2.x +
    Math.pow(t, 3) * p2.x;
  const y =
    Math.pow(1 - t, 3) * p1.y +
    3 * Math.pow(1 - t, 2) * t * bp1.y +
    3 * (1 - t) * Math.pow(t, 2) * bp2.y +
    Math.pow(t, 3) * p2.y;

  return { x, y };
};

function bezier(points, t) {
  const x =
    Math.pow(1 - t, 3) * points[0].x +
    3 * Math.pow(1 - t, 2) * t * points[1].x +
    3 * (1 - t) * Math.pow(t, 2) * points[2].x +
    Math.pow(t, 3) * points[3].x;

  const y =
    Math.pow(1 - t, 3) * points[0].y +
    3 * Math.pow(1 - t, 2) * t * points[1].y +
    3 * (1 - t) * Math.pow(t, 2) * points[2].y +
    Math.pow(t, 3) * points[3].y;

  return { x, y };
}

const particleManager = new ParticleManager();

particleManager.addParticle(
  100,
  100,
  [
    { x: 100, y: 100 },
    { x: 375, y: 75 },
    { x: 431, y: 296 },
    { x: 500, y: 300 },
  ],
  0.01,
  bezier
);

particleManager.addParticle(
  100,
  300,
  [
    { x: 100, y: 100 },
    { x: 100, y: 300 },
    { x: 500, y: 500 },
    { x: 700, y: 100 },
  ],
  0.01,
  catmullRom
);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particleManager.update();
  particleManager.draw(ctx);

  requestAnimationFrame(animate);
}

animate();
