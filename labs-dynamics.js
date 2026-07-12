function logisticSeries(r, x0, steps) {
  const out = [x0];
  let x = x0;
  for (let i = 1; i < steps; i++) { x = r * x * (1 - x); out.push(x); }
  return out;
}

function renderLogistic(lab) {
  const app = $("#app");
  app.innerHTML = `
    ${labHeader(lab,
      "A single nonlinear recurrence moves from a fixed point to cycles and then chaos as the growth parameter increases. The bifurcation diagram is a compressed history of those transitions.",
      "xₜ₊₁ = r xₜ (1 − xₜ)"
    )}
    <div class="lab-layout">
      <aside class="panel controls">
        <div class="control"><label>Growth parameter r <output id="logROut"></output></label><input id="logR" type="range" min="0" max="4" step="0.001" value="3.72" /></div>
        <div class="control"><label>Initial x₀ <output id="logXOut"></output></label><input id="logX" type="range" min="0.001" max="0.999" step="0.001" value="0.2" /></div>
        <div class="metric-grid">
          <div class="metric"><span>Latest value</span><strong id="logLatest"></strong></div>
          <div class="metric"><span>Separation after 40 steps</span><strong id="logSensitivity"></strong></div>
        </div>
        <div class="button-row">
          <button class="button secondary small preset" data-r="2.8">Stable</button>
          <button class="button secondary small preset" data-r="3.2">Period-2</button>
          <button class="button secondary small preset" data-r="3.5699">Edge of chaos</button>
          <button class="button secondary small preset" data-r="3.9">Chaotic</button>
        </div>
        <div class="callout">Chaos does not mean absence of rules. It means deterministic rules can amplify tiny differences until long-term prediction becomes impractical.</div>
      </aside>
      <section class="visual-grid">
        <article class="panel visual-card"><h3>Time series</h3><canvas id="logSeries"></canvas></article>
        <article class="panel visual-card"><h3>Cobweb diagram</h3><canvas id="logCobweb"></canvas></article>
        <article class="panel visual-card full"><h3>Bifurcation diagram</h3><canvas id="logBifurcation"></canvas></article>
      </section>
    </div>
  `;

  const rInput = $("#logR"), xInput = $("#logX");
  function drawCobweb(r, x0) {
    const canvas = $("#logCobweb"), ctx = canvasContext(canvas, 720, 420);
    const pad = 45, scale = x => pad + x * (canvas.width - 2 * pad), sy = y => canvas.height - pad - y * (canvas.height - 2 * pad);
    ctx.strokeStyle = "#dce2e8"; ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) { const p = pad + i / 10 * (canvas.width - 2 * pad); ctx.beginPath(); ctx.moveTo(p, pad); ctx.lineTo(p, canvas.height - pad); ctx.stroke(); const q = pad + i / 10 * (canvas.height - 2 * pad); ctx.beginPath(); ctx.moveTo(pad, q); ctx.lineTo(canvas.width - pad, q); ctx.stroke(); }
    ctx.strokeStyle = "#65707b"; ctx.beginPath(); ctx.moveTo(scale(0), sy(0)); ctx.lineTo(scale(1), sy(1)); ctx.stroke();
    ctx.strokeStyle = "#3b5ccc"; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 300; i++) { const x = i / 300, y = r * x * (1 - x); if (i === 0) ctx.moveTo(scale(x), sy(y)); else ctx.lineTo(scale(x), sy(y)); }
    ctx.stroke();
    ctx.strokeStyle = "#d36b3d"; ctx.lineWidth = 1.2;
    let x = x0, y = 0; ctx.beginPath(); ctx.moveTo(scale(x), sy(0));
    for (let i = 0; i < 45; i++) { y = r * x * (1 - x); ctx.lineTo(scale(x), sy(y)); ctx.lineTo(scale(y), sy(y)); x = y; }
    ctx.stroke();
  }

  function drawBifurcation() {
    const canvas = $("#logBifurcation"), ctx = canvasContext(canvas, 900, 420);
    ctx.fillStyle = "rgba(28,57,115,.42)";
    const rMin = 2.5, rMax = 4;
    for (let px = 0; px < canvas.width; px++) {
      const r = rMin + px / canvas.width * (rMax - rMin);
      let x = 0.5;
      for (let i = 0; i < 500; i++) x = r * x * (1 - x);
      for (let i = 0; i < 90; i++) {
        x = r * x * (1 - x);
        const py = canvas.height - 1 - Math.floor(x * (canvas.height - 1));
        ctx.fillRect(px, py, 1, 1);
      }
    }
    ctx.fillStyle = "#394653"; ctx.font = "13px system-ui";
    ctx.fillText("r = 2.5", 8, canvas.height - 8); ctx.fillText("r = 4", canvas.width - 42, canvas.height - 8);
  }

  function update() {
    const r = +rInput.value, x0 = +xInput.value;
    $("#logROut").value = r.toFixed(3); $("#logXOut").value = x0.toFixed(3);
    const values = logisticSeries(r, x0, 100);
    const perturbed = logisticSeries(r, x0 + 1e-8, 41);
    $("#logLatest").textContent = fmt(values.at(-1), 6);
    $("#logSensitivity").textContent = fmt(Math.abs(values[40] - perturbed[40]), 8);
    drawPlot($("#logSeries"), [{ data: values.map((y, i) => [i, y]) }], { xMin: 0, xMax: 99, yMin: 0, yMax: 1, xLabel: "time", yLabel: "x" });
    drawCobweb(r, x0);
  }
  rInput.addEventListener("input", update); xInput.addEventListener("input", update);
  $$(".preset").forEach(button => button.addEventListener("click", () => { rInput.value = button.dataset.r; update(); }));
  drawBifurcation(); update();
}

function ecaNext(row, rule) {
  const next = new Uint8Array(row.length);
  for (let i = 0; i < row.length; i++) {
    const left = row[(i - 1 + row.length) % row.length];
    const center = row[i];
    const right = row[(i + 1) % row.length];
    const pattern = (left << 2) | (center << 1) | right;
    next[i] = (rule >> pattern) & 1;
  }
  return next;
}

function renderCellularAutomata(lab) {
  const app = $("#app");
  app.innerHTML = `
    ${labHeader(lab,
      "Every cell reads only itself and its two neighbours. Eight local cases define a rule, yet repeated application can produce fixed structures, nested patterns, apparent randomness, or long-lived interactions.",
      "new cell = one bit selected from the 8-bit rule number"
    )}
    <div class="lab-layout">
      <aside class="panel controls">
        <div class="control"><label>Rule <output id="ecaRuleOut"></output></label><input id="ecaRule" type="range" min="0" max="255" value="110" /></div>
        <div class="control"><label>Rows <output id="ecaRowsOut"></output></label><input id="ecaRows" type="range" min="40" max="240" value="160" /></div>
        <div class="button-row">
          <button class="button secondary small eca-preset" data-rule="30">Rule 30</button>
          <button class="button secondary small eca-preset" data-rule="90">Rule 90</button>
          <button class="button secondary small eca-preset" data-rule="110">Rule 110</button>
          <button id="ecaRandom" class="button small">Random seed</button>
        </div>
        <div class="metric-grid">
          <div class="metric"><span>Rule in binary</span><strong id="ecaBinary"></strong></div>
          <div class="metric"><span>Final density</span><strong id="ecaDensity"></strong></div>
        </div>
        <div class="callout">Rule 110 is computationally universal: a tiny local rule can, in principle, emulate arbitrary computation.</div>
      </aside>
      <section class="panel">
        <canvas id="ecaCanvas"></canvas>
      </section>
    </div>
  `;
  const ruleInput = $("#ecaRule"), rowsInput = $("#ecaRows");
  let randomSeed = false;
  function update() {
    const rule = +ruleInput.value, rows = +rowsInput.value, cols = 240;
    $("#ecaRuleOut").value = rule; $("#ecaRowsOut").value = rows;
    $("#ecaBinary").textContent = rule.toString(2).padStart(8, "0");
    const canvas = $("#ecaCanvas"), ctx = canvasContext(canvas, cols, rows);
    let row = new Uint8Array(cols);
    if (randomSeed) { for (let i = 0; i < cols; i++) row[i] = Math.random() < .5 ? 1 : 0; }
    else row[Math.floor(cols / 2)] = 1;
    ctx.fillStyle = "#17232f";
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) if (row[x]) ctx.fillRect(x, y, 1, 1);
      row = ecaNext(row, rule);
    }
    const density = row.reduce((a, b) => a + b, 0) / cols;
    $("#ecaDensity").textContent = `${fmt(density * 100, 2)}%`;
  }
  ruleInput.addEventListener("input", update); rowsInput.addEventListener("input", update);
  $$(".eca-preset").forEach(button => button.addEventListener("click", () => { ruleInput.value = button.dataset.rule; randomSeed = false; update(); }));
  $("#ecaRandom").addEventListener("click", () => { randomSeed = true; update(); });
  update();
}

function renderGameOfLife(lab) {
  const app = $("#app");
  app.innerHTML = `
    ${labHeader(lab,
      "Conway’s universe has no moving objects in its rules—only cells being born or surviving. Gliders, oscillators, and other apparent objects are patterns sustained by local updates.",
      "B3 / S23: birth with 3 neighbours; survive with 2 or 3"
    )}
    <div class="lab-layout">
      <aside class="panel controls">
        <div class="control"><label>Speed <output id="lifeSpeedOut"></output></label><input id="lifeSpeed" type="range" min="1" max="20" value="8" /></div>
        <div class="button-row">
          <button id="lifePlay" class="button">Play</button>
          <button id="lifeStep" class="button secondary">Step</button>
          <button id="lifeRandom" class="button secondary">Random</button>
          <button id="lifeClear" class="button secondary">Clear</button>
          <button id="lifeGlider" class="button secondary">Glider</button>
        </div>
        <div class="metric-grid">
          <div class="metric"><span>Generation</span><strong id="lifeGeneration"></strong></div>
          <div class="metric"><span>Living cells</span><strong id="lifePopulation"></strong></div>
        </div>
        <div class="callout">Click cells directly. The grid wraps at the boundaries, making the world topologically equivalent to a torus.</div>
      </aside>
      <section class="panel">
        <canvas id="lifeCanvas"></canvas>
      </section>
    </div>
  `;
  const cols = 72, rows = 46;
  let grid = Array.from({ length: rows }, () => new Uint8Array(cols));
  let generation = 0, playing = false, timer = null;
  const canvas = $("#lifeCanvas");
  canvas.width = 864; canvas.height = 552;

  function neighbours(x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      count += grid[(y + dy + rows) % rows][(x + dx + cols) % cols];
    }
    return count;
  }
  function step() {
    const next = Array.from({ length: rows }, () => new Uint8Array(cols));
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const n = neighbours(x, y);
      next[y][x] = grid[y][x] ? +(n === 2 || n === 3) : +(n === 3);
    }
    grid = next; generation++; draw();
  }
  function draw() {
    const ctx = canvasContext(canvas, 864, 552); const cw = canvas.width / cols, ch = canvas.height / rows;
    ctx.fillStyle = "#1a2733";
    let pop = 0;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (grid[y][x]) { ctx.fillRect(x * cw + .5, y * ch + .5, cw - 1, ch - 1); pop++; }
    ctx.strokeStyle = "#edf0f3"; ctx.lineWidth = .5;
    for (let x = 0; x <= cols; x++) { ctx.beginPath(); ctx.moveTo(x * cw, 0); ctx.lineTo(x * cw, canvas.height); ctx.stroke(); }
    for (let y = 0; y <= rows; y++) { ctx.beginPath(); ctx.moveTo(0, y * ch); ctx.lineTo(canvas.width, y * ch); ctx.stroke(); }
    $("#lifeGeneration").textContent = generation; $("#lifePopulation").textContent = pop;
  }
  function schedule() {
    clearInterval(timer);
    if (playing) timer = setInterval(step, 1000 / +$("#lifeSpeed").value);
  }
  canvas.addEventListener("click", event => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / rect.width * cols);
    const y = Math.floor((event.clientY - rect.top) / rect.height * rows);
    grid[y][x] = grid[y][x] ? 0 : 1; draw();
  });
  $("#lifePlay").addEventListener("click", () => { playing = !playing; $("#lifePlay").textContent = playing ? "Pause" : "Play"; schedule(); });
  $("#lifeStep").addEventListener("click", step);
  $("#lifeSpeed").addEventListener("input", () => { $("#lifeSpeedOut").value = $("#lifeSpeed").value; schedule(); });
  $("#lifeRandom").addEventListener("click", () => { grid = Array.from({ length: rows }, () => Uint8Array.from({ length: cols }, () => Math.random() < .25 ? 1 : 0)); generation = 0; draw(); });
  $("#lifeClear").addEventListener("click", () => { grid = Array.from({ length: rows }, () => new Uint8Array(cols)); generation = 0; draw(); });
  $("#lifeGlider").addEventListener("click", () => { grid = Array.from({ length: rows }, () => new Uint8Array(cols)); const x = 8, y = 8; [[1,0],[2,1],[0,2],[1,2],[2,2]].forEach(([dx,dy]) => grid[y+dy][x+dx]=1); generation = 0; draw(); });
  $("#lifeSpeedOut").value = $("#lifeSpeed").value;
  $("#lifeGlider").click();
  return () => clearInterval(timer);
}
