function renderHighDimensions(lab) {
  const app = $("#app");
  app.innerHTML = `
    ${labHeader(lab,
      "High-dimensional geometry is not merely a larger version of 3D geometry. Volume migrates into thin shells, unit balls become tiny relative to cubes, and ordinary sampling intuition breaks down.",
      "Vₙ(r) = πⁿᐟ² rⁿ / Γ(n/2 + 1)"
    )}
    <div class="lab-layout">
      <aside class="panel controls">
        <div class="control">
          <label>Dimension n <output id="hdNOut"></output></label>
          <input id="hdN" type="range" min="1" max="100" value="12" />
        </div>
        <div class="control">
          <label>Inner radius r <output id="hdROut"></output></label>
          <input id="hdR" type="range" min="0.5" max="0.999" step="0.001" value="0.9" />
        </div>
        <div class="metric-grid">
          <div class="metric"><span>Unit-ball volume</span><strong id="hdVolume"></strong></div>
          <div class="metric"><span>Ball / cube</span><strong id="hdRatio"></strong></div>
          <div class="metric"><span>Volume inside r</span><strong id="hdInside"></strong></div>
          <div class="metric"><span>Typical cube distance</span><strong id="hdDistance"></strong></div>
        </div>
        <button id="hdSample" class="button" type="button">Run Monte Carlo sample</button>
        <div id="hdStatus" class="status">Sampling is limited to n ≤ 20 so the hit count remains interpretable.</div>
        <div class="callout">At dimension n, the fraction of a unit ball inside radius r is exactly rⁿ. The shell effect needs no simulation.</div>
      </aside>
      <section class="visual-grid">
        <article class="panel visual-card">
          <h3>log₁₀ volume of the unit ball</h3>
          <canvas id="hdVolumePlot"></canvas>
        </article>
        <article class="panel visual-card">
          <h3>log₁₀ probability: cube point lands in ball</h3>
          <canvas id="hdRatioPlot"></canvas>
        </article>
        <article class="panel visual-card full">
          <h3>Where does the volume live?</h3>
          <canvas id="hdShellPlot"></canvas>
        </article>
      </section>
    </div>
  `;

  const nInput = $("#hdN"), rInput = $("#hdR");
  function update() {
    const n = +nInput.value, r = +rInput.value;
    const logV = logBallVolume(n);
    const volume = Math.exp(logV);
    const ratio = Math.exp(logV - n * Math.log(2));
    const inside = Math.pow(r, n);
    $("#hdNOut").value = n;
    $("#hdROut").value = r.toFixed(3);
    $("#hdVolume").textContent = fmt(volume);
    $("#hdRatio").textContent = fmt(ratio);
    $("#hdInside").textContent = `${fmt(inside * 100, 3)}%`;
    $("#hdDistance").textContent = fmt(Math.sqrt(n / 3), 3);

    const volumeData = Array.from({ length: 100 }, (_, i) => [i + 1, logBallVolume(i + 1) / Math.LN10]);
    const ratioData = Array.from({ length: 100 }, (_, i) => [i + 1, (logBallVolume(i + 1) - (i + 1) * Math.log(2)) / Math.LN10]);
    drawPlot($("#hdVolumePlot"), [{ data: volumeData }], { xMin: 1, xMax: 100, yLabel: "log₁₀ V", xLabel: "dimension" });
    drawPlot($("#hdRatioPlot"), [{ data: ratioData }], { xMin: 1, xMax: 100, yLabel: "log₁₀ p", xLabel: "dimension" });

    const shellData = Array.from({ length: 101 }, (_, i) => {
      const rr = i / 100;
      return [rr, Math.pow(rr, n)];
    });
    drawPlot($("#hdShellPlot"), [{ data: shellData }], { xMin: 0, xMax: 1, yMin: 0, yMax: 1, xLabel: "radius", yLabel: "fraction inside" });
  }
  nInput.addEventListener("input", update);
  rInput.addEventListener("input", update);
  $("#hdSample").addEventListener("click", () => {
    const n = Math.min(20, +nInput.value);
    const samples = 20000;
    let hits = 0;
    for (let s = 0; s < samples; s++) {
      let norm2 = 0;
      for (let i = 0; i < n; i++) { const x = Math.random() * 2 - 1; norm2 += x * x; }
      if (norm2 <= 1) hits++;
    }
    const estimate = hits / samples;
    const exact = Math.exp(logBallVolume(n) - n * Math.log(2));
    $("#hdStatus").textContent = `n=${n}: ${hits}/${samples} hits. Estimate ${fmt(estimate)}, exact ${fmt(exact)}.`;
  });
  update();
}

function binaryEntropy(p) {
  if (p <= 0 || p >= 1) return 0;
  return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
}

function renderEntropy(lab) {
  const app = $("#app");
  app.innerHTML = `
    ${labHeader(lab,
      "Information measures surprise. Entropy averages that surprise across a probability distribution, reaching its maximum when alternatives are equally likely.",
      "I(x) = −log₂ p(x)    ·    H(X) = −Σ pᵢ log₂ pᵢ"
    )}
    <div class="lab-layout">
      <aside class="panel controls">
        <div class="control">
          <label>Probability p <output id="entPOut"></output></label>
          <input id="entP" type="range" min="0.001" max="0.999" step="0.001" value="0.5" />
        </div>
        <div class="metric-grid">
          <div class="metric"><span>Information if event occurs</span><strong id="entInfo"></strong></div>
          <div class="metric"><span>Binary entropy</span><strong id="entH"></strong></div>
        </div>
        <div class="control">
          <label for="entText">Analyse a string</label>
          <input id="entText" type="text" value="ABRACADABRA" />
        </div>
        <div class="metric-grid">
          <div class="metric"><span>Alphabet size</span><strong id="entAlphabet"></strong></div>
          <div class="metric"><span>Empirical entropy</span><strong id="entStringH"></strong></div>
        </div>
        <div class="callout">A fair coin has maximum uncertainty before the toss. A nearly certain event carries little entropy on average, even though its rare opposite would be very surprising.</div>
      </aside>
      <section class="visual-grid">
        <article class="panel visual-card full">
          <h3>Binary entropy curve</h3>
          <canvas id="entCurve"></canvas>
        </article>
        <article class="panel visual-card full">
          <h3>Current probability distribution</h3>
          <canvas id="entBars"></canvas>
        </article>
      </section>
    </div>
  `;

  const pInput = $("#entP"), textInput = $("#entText");
  function update() {
    const p = +pInput.value;
    $("#entPOut").value = p.toFixed(3);
    $("#entInfo").textContent = `${fmt(-Math.log2(p), 3)} bits`;
    $("#entH").textContent = `${fmt(binaryEntropy(p), 4)} bits`;
    const curve = Array.from({ length: 199 }, (_, i) => { const x = (i + 1) / 200; return [x, binaryEntropy(x)]; });
    drawPlot($("#entCurve"), [{ data: curve }, { data: [[p, 0], [p, binaryEntropy(p)]], width: 1 }], { xMin: 0, xMax: 1, yMin: 0, yMax: 1, xLabel: "p", yLabel: "bits" });

    const canvas = $("#entBars"), ctx = canvasContext(canvas, 720, 300);
    const values = [p, 1 - p];
    values.forEach((v, i) => {
      const x = 190 + i * 260, h = v * 190;
      ctx.fillStyle = i === 0 ? "#3b5ccc" : "#d36b3d";
      ctx.fillRect(x, 240 - h, 120, h);
      ctx.fillStyle = "#394653"; ctx.font = "15px system-ui";
      ctx.fillText(i === 0 ? "event" : "not event", x + 22, 270);
      ctx.fillText(v.toFixed(3), x + 36, 225 - h);
    });

    const chars = [...textInput.value];
    const counts = new Map();
    chars.forEach(c => counts.set(c, (counts.get(c) || 0) + 1));
    let h = 0;
    if (chars.length) counts.forEach(count => { const q = count / chars.length; h -= q * Math.log2(q); });
    $("#entAlphabet").textContent = counts.size;
    $("#entStringH").textContent = `${fmt(h, 4)} bits/symbol`;
  }
  pInput.addEventListener("input", update);
  textInput.addEventListener("input", update);
  update();
}
