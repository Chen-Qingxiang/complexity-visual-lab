const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const fmt = (value, digits = 4) => {
  if (!Number.isFinite(value)) return "—";
  const a = Math.abs(value);
  if ((a > 0 && a < 1e-3) || a >= 1e5) return value.toExponential(3);
  return value.toLocaleString(undefined, { maximumFractionDigits: digits });
};
const sleepFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

function sourceUrl(repo) {
  return `https://github.com/Chen-Qingxiang/${repo}`;
}

function labHeader(lab, intro, formula = "") {
  return `
    <header class="lab-header">
      <div>
        <div class="eyebrow">${lab.group} · ${lab.number}</div>
        <h1>${lab.title}</h1>
        <p>${intro}</p>
      </div>
      <a class="button secondary" href="${sourceUrl(lab.source)}" target="_blank" rel="noreferrer">Original project ↗</a>
    </header>
    ${formula ? `<div class="formula">${formula}</div>` : ""}
  `;
}

function canvasContext(canvas, width = 720, height = 360) {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  return ctx;
}

function drawPlot(canvas, series, options = {}) {
  const { xMin, xMax, yMin, yMax, xLabel = "", yLabel = "", points = false } = options;
  const ctx = canvasContext(canvas);
  const W = canvas.width, H = canvas.height;
  const pad = { left: 58, right: 18, top: 18, bottom: 42 };
  const xmin = xMin ?? Math.min(...series.flatMap(s => s.data.map(p => p[0])));
  const xmax = xMax ?? Math.max(...series.flatMap(s => s.data.map(p => p[0])));
  const ymin = yMin ?? Math.min(...series.flatMap(s => s.data.map(p => p[1])));
  const ymax = yMax ?? Math.max(...series.flatMap(s => s.data.map(p => p[1])));
  const sx = x => pad.left + (x - xmin) / ((xmax - xmin) || 1) * (W - pad.left - pad.right);
  const sy = y => H - pad.bottom - (y - ymin) / ((ymax - ymin) || 1) * (H - pad.top - pad.bottom);

  ctx.strokeStyle = "#dce2e8";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#667381";
  ctx.font = "12px system-ui";
  for (let i = 0; i <= 5; i++) {
    const tx = xmin + (xmax - xmin) * i / 5;
    const ty = ymin + (ymax - ymin) * i / 5;
    const px = sx(tx), py = sy(ty);
    ctx.beginPath(); ctx.moveTo(px, pad.top); ctx.lineTo(px, H - pad.bottom); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad.left, py); ctx.lineTo(W - pad.right, py); ctx.stroke();
    ctx.fillText(fmt(tx, 2), px - 12, H - 20);
    ctx.fillText(fmt(ty, 2), 5, py + 4);
  }
  ctx.strokeStyle = "#65707b";
  ctx.beginPath(); ctx.moveTo(pad.left, pad.top); ctx.lineTo(pad.left, H - pad.bottom); ctx.lineTo(W - pad.right, H - pad.bottom); ctx.stroke();

  const palette = ["#3b5ccc", "#d36b3d", "#26866c", "#9a4eb3"];
  series.forEach((s, index) => {
    ctx.strokeStyle = s.color || palette[index % palette.length];
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = s.width || 2;
    ctx.beginPath();
    s.data.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(sx(x), sy(y)); else ctx.lineTo(sx(x), sy(y));
    });
    ctx.stroke();
    if (points || s.points) {
      s.data.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(sx(x), sy(y), 2.3, 0, Math.PI * 2); ctx.fill(); });
    }
  });
  ctx.fillStyle = "#394653";
  ctx.font = "13px system-ui";
  if (xLabel) ctx.fillText(xLabel, W / 2 - 25, H - 4);
  if (yLabel) { ctx.save(); ctx.translate(14, H / 2 + 30); ctx.rotate(-Math.PI / 2); ctx.fillText(yLabel, 0, 0); ctx.restore(); }
}

function logGamma(z) {
  const p = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
  z -= 1;
  let x = p[0];
  for (let i = 1; i < p.length; i++) x += p[i] / (z + i);
  const t = z + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function logBallVolume(n, r = 1) {
  return n / 2 * Math.log(Math.PI) - logGamma(n / 2 + 1) + n * Math.log(r);
}
