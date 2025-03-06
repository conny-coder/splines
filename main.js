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

  update(precomputed, speed) {
    if (this.t < 1) {
      this.t += speed;
      const pos = this.spline(precomputed, this.t);
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
    particle.precomputed = catmullRomPrecompute(points);
    this.particles.push(particle);
  }

  update() {
    this.particles.forEach((p) => p.update(p.precomputed, p.speed));
  }

  draw(ctx) {
    this.particles.forEach((p) => p.draw(ctx));
  }
}

// Предварительный расчёт контрольных точек для Catmull-Rom
function catmullRomPrecompute(points, alpha = 0.5) {
  const p0 = points[0];
  const p1 = points[1];
  const p2 = points[2];
  const p3 = points.length > 3 ? points[3] : p2;

  // Расстояния между точками
  const d1 = Math.hypot(p1.x - p0.x, p1.y - p0.y);
  const d2 = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const d3 = Math.hypot(p3.x - p2.x, p3.y - p2.y);

  // Вычисляем степени расстояний
  const d1a = Math.pow(d1, alpha);
  const d2a = Math.pow(d2, alpha);
  const d3a = Math.pow(d3, alpha);
  const d1a2 = Math.pow(d1, 2 * alpha);
  const d2a2 = Math.pow(d2, 2 * alpha);
  const d3a2 = Math.pow(d3, 2 * alpha);

  // Вычисляем коэффициенты для преобразования в кубическую Bézier
  const A = 2 * d1a2 + 3 * d1a * d2a + d2a2;
  const B = 2 * d3a2 + 3 * d3a * d2a + d2a2;
  let N = 3 * d1a * (d1a + d2a);
  let M = 3 * d3a * (d3a + d2a);
  N = N !== 0 ? 1 / N : 0;
  M = M !== 0 ? 1 / M : 0;

  let bp1 = {
    x: (-d2a2 * p0.x + A * p1.x + d1a2 * p2.x) * N,
    y: (-d2a2 * p0.y + A * p1.y + d1a2 * p2.y) * N,
  };
  let bp2 = {
    x: (d3a2 * p1.x + B * p2.x - d2a2 * p3.x) * M,
    y: (d3a2 * p1.y + B * p2.y - d2a2 * p3.y) * M,
  };

  if (bp1.x === 0 && bp1.y === 0) bp1 = { x: p1.x, y: p1.y };
  if (bp2.x === 0 && bp2.y === 0) bp2 = { x: p2.x, y: p2.y };

  return { p1, bp1, bp2, p2 };
}

function catmullRomAtT(precomputed, t) {
  const { p1, bp1, bp2, p2 } = precomputed;
  const mt = 1 - t;
  return {
    x:
      mt * mt * mt * p1.x +
      3 * mt * mt * t * bp1.x +
      3 * mt * t * t * bp2.x +
      t * t * t * p2.x,
    y:
      mt * mt * mt * p1.y +
      3 * mt * mt * t * bp1.y +
      3 * mt * t * t * bp2.y +
      t * t * t * p2.y,
  };
}

const particleManager = new ParticleManager();

// Частица 1
particleManager.addParticle(
  100,
  300,
  [
    { x: 100, y: 400 },
    { x: 100, y: 300 },
    { x: 900, y: 200 },
    { x: 700, y: 300 },
  ],
  0.005,
  catmullRomAtT
);

// Частица 2
particleManager.addParticle(
  150,
  350,
  [
    { x: 150, y: 450 },
    { x: 150, y: 350 },
    { x: 850, y: 250 },
    { x: 650, y: 350 },
  ],
  0.006,
  catmullRomAtT
);

// Частица 3
particleManager.addParticle(
  200,
  400,
  [
    { x: 200, y: 500 },
    { x: 200, y: 400 },
    { x: 800, y: 300 },
    { x: 600, y: 400 },
  ],
  0.007,
  catmullRomAtT
);

// Частица 4
particleManager.addParticle(
  250,
  450,
  [
    { x: 250, y: 550 },
    { x: 250, y: 450 },
    { x: 750, y: 350 },
    { x: 550, y: 450 },
  ],
  0.005,
  catmullRomAtT
);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particleManager.update();
  particleManager.draw(ctx);

  requestAnimationFrame(animate);
}

animate();
