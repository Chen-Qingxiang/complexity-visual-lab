function randomGenome(n) { return Uint8Array.from({ length: n }, () => Math.random() < .5 ? 0 : 1); }
function genomeString(g) { return [...g].join(""); }
function tournament(population, fitness) {
  let best = Math.floor(Math.random() * population.length);
  for (let i = 0; i < 2; i++) { const candidate = Math.floor(Math.random() * population.length); if (fitness[candidate] > fitness[best]) best = candidate; }
  return population[best];
}

function renderGeneticAlgorithm(lab) {
  const app = $("#app");
  app.innerHTML = `
    ${labHeader(lab,
      "Evolutionary search succeeds or fails partly because of the landscape it explores. Smooth landscapes reward incremental progress; deceptive and rugged landscapes contain local optima and conflicting interactions.",
      "selection + crossover + mutation → population change"
    )}
    <div class="lab-layout">
      <aside class="panel controls">
        <div class="control"><label>Fitness landscape</label><select id="gaLandscape"><option value="onemax">OneMax</option><option value="trap">Deceptive trap</option><option value="nk">NK landscape (K=2)</option></select></div>
        <div class="control"><label>Genome length <output id="gaNOut"></output></label><input id="gaN" type="range" min="8" max="40" step="4" value="24" /></div>
        <div class="control"><label>Population <output id="gaPopOut"></output></label><input id="gaPop" type="range" min="20" max="200" step="10" value="80" /></div>
        <div class="control"><label>Generations <output id="gaGenOut"></output></label><input id="gaGen" type="range" min="10" max="200" step="10" value="80" /></div>
        <div class="control"><label>Mutation probability <output id="gaMutOut"></output></label><input id="gaMut" type="range" min="0" max="0.2" step="0.002" value="0.02" /></div>
        <button id="gaRun" class="button">Run evolution</button>
        <div class="metric-grid">
          <div class="metric"><span>Best fitness</span><strong id="gaBest"></strong></div>
          <div class="metric"><span>Final diversity</span><strong id="gaDiversity"></strong></div>
        </div>
        <div class="status" id="gaGenome"></div>
      </aside>
      <section class="visual-grid">
        <article class="panel visual-card full"><h3>Best and average fitness</h3><canvas id="gaChart"></canvas></article>
        <article class="panel visual-card full"><h3>Interpretation</h3><p id="gaExplanation" class="note"></p></article>
      </section>
    </div>
  `;
  const controls = ["gaN", "gaPop", "gaGen", "gaMut"];
  function labels() {
    $("#gaNOut").value = $("#gaN").value; $("#gaPopOut").value = $("#gaPop").value;
    $("#gaGenOut").value = $("#gaGen").value; $("#gaMutOut").value = (+$("#gaMut").value).toFixed(3);
  }
  controls.forEach(id => $("#" + id).addEventListener("input", labels)); labels();

  $("#gaRun").addEventListener("click", () => {
    const n = +$("#gaN").value, popSize = +$("#gaPop").value, generations = +$("#gaGen").value, mutation = +$("#gaMut").value;
    const landscape = $("#gaLandscape").value;
    const nkTables = Array.from({ length: n }, () => Array.from({ length: 8 }, Math.random));
    const fitnessFn = genome => {
      if (landscape === "onemax") return [...genome].reduce((a,b)=>a+b,0) / n;
      if (landscape === "trap") {
        let total = 0; const k = 4;
        for (let i = 0; i < n; i += k) { let ones = 0; for (let j = i; j < Math.min(i+k,n); j++) ones += genome[j]; const size = Math.min(k, n-i); total += ones === size ? size : size - 1 - ones; }
        return total / n;
      }
      let total = 0;
      for (let i = 0; i < n; i++) { const index = (genome[i] << 2) | (genome[(i+1)%n] << 1) | genome[(i+2)%n]; total += nkTables[i][index]; }
      return total / n;
    };
    let population = Array.from({ length: popSize }, () => randomGenome(n));
    const bestHistory = [], avgHistory = [];
    let globalBest = population[0], globalFitness = -Infinity;
    for (let generation = 0; generation < generations; generation++) {
      const fitness = population.map(fitnessFn);
      let bestIndex = 0; for (let i = 1; i < fitness.length; i++) if (fitness[i] > fitness[bestIndex]) bestIndex = i;
      if (fitness[bestIndex] > globalFitness) { globalFitness = fitness[bestIndex]; globalBest = population[bestIndex].slice(); }
      bestHistory.push([generation, fitness[bestIndex]]); avgHistory.push([generation, fitness.reduce((a,b)=>a+b,0)/fitness.length]);
      const next = [population[bestIndex].slice()];
      while (next.length < popSize) {
        const a = tournament(population, fitness), b = tournament(population, fitness), cut = 1 + Math.floor(Math.random() * (n - 1));
        const child = new Uint8Array(n);
        for (let i = 0; i < n; i++) { child[i] = i < cut ? a[i] : b[i]; if (Math.random() < mutation) child[i] ^= 1; }
        next.push(child);
      }
      population = next;
    }
    let pairDiff = 0, pairs = 0;
    for (let i = 0; i < Math.min(population.length, 30); i++) for (let j = i+1; j < Math.min(population.length,30); j++) { for (let k=0;k<n;k++) pairDiff += population[i][k] !== population[j][k]; pairs += n; }
    const diversity = pairs ? pairDiff / pairs : 0;
    $("#gaBest").textContent = fmt(globalFitness, 4); $("#gaDiversity").textContent = fmt(diversity, 4);
    $("#gaGenome").textContent = `Best genome: ${genomeString(globalBest)}`;
    drawPlot($("#gaChart"), [{ data: bestHistory }, { data: avgHistory }], { xMin: 0, xMax: generations-1, yMin: 0, yMax: 1, xLabel: "generation", yLabel: "fitness" });
    const explanation = {
      onemax: "OneMax is smooth: every correct bit independently improves fitness, so selection has a reliable gradient.",
      trap: "The trap landscape rewards all-zero blocks locally while reserving the true optimum for all-one blocks. Strong selection can converge prematurely.",
      nk: "NK interactions make a rugged landscape. Changing one bit can alter several contributions, producing many local optima.",
    };
    $("#gaExplanation").textContent = explanation[landscape];
  });
  $("#gaRun").click();
}

const ROBBY_ACTIONS = ["N", "S", "E", "W", "Stay", "Pick", "Random"];
function robbyWorld(size = 10, density = .5) {
  return Array.from({ length: size }, () => Uint8Array.from({ length: size }, () => Math.random() < density ? 1 : 0));
}
function robbyPercept(world, x, y) {
  const size = world.length;
  const value = (xx, yy) => (xx < 0 || yy < 0 || xx >= size || yy >= size) ? 2 : world[yy][xx];
  const values = [value(x,y), value(x,y-1), value(x,y+1), value(x-1,y), value(x+1,y)];
  return values.reduce((code, v) => code * 3 + v, 0);
}
function robbyStep(world, state, policy) {
  let action = policy[robbyPercept(world, state.x, state.y)];
  if (action === 6) action = Math.floor(Math.random() * 6);
  let nx = state.x, ny = state.y, reward = 0;
  if (action === 0) ny--; else if (action === 1) ny++; else if (action === 2) nx++; else if (action === 3) nx--;
  if (action <= 3) {
    if (nx < 0 || ny < 0 || nx >= world.length || ny >= world.length) reward = -5;
    else { state.x = nx; state.y = ny; }
  } else if (action === 5) {
    if (world[state.y][state.x]) { world[state.y][state.x] = 0; reward = 10; } else reward = -1;
  }
  state.score += reward; state.steps++; return action;
}
function evaluateRobby(policy, worlds = 4, steps = 100) {
  let score = 0;
  for (let w = 0; w < worlds; w++) {
    const world = robbyWorld(); const state = { x: 5, y: 5, score: 0, steps: 0 };
    for (let i = 0; i < steps; i++) robbyStep(world, state, policy);
    score += state.score;
  }
  return score / worlds;
}

function renderRobby(lab) {
  const app = $("#app");
  app.innerHTML = `
    ${labHeader(lab,
      "Robby sees only five nearby cells. A policy maps 3⁵ = 243 possible percepts to actions. Genetic search therefore evolves a complete reactive strategy rather than a planned route.",
      "policy: 243 perceptual states → 7 possible actions"
    )}
    <div class="lab-layout">
      <aside class="panel controls">
        <div class="control"><label>Population <output id="robPopOut"></output></label><input id="robPop" type="range" min="16" max="60" step="4" value="28" /></div>
        <div class="control"><label>Generations <output id="robGenOut"></output></label><input id="robGen" type="range" min="5" max="50" step="5" value="25" /></div>
        <div class="control"><label>Mutation <output id="robMutOut"></output></label><input id="robMut" type="range" min="0.001" max="0.05" step="0.001" value="0.01" /></div>
        <div class="button-row"><button id="robTrain" class="button">Train policy</button><button id="robReset" class="button secondary">New world</button><button id="robStep" class="button secondary">Demo step</button></div>
        <div class="metric-grid">
          <div class="metric"><span>Best training score</span><strong id="robBest">—</strong></div>
          <div class="metric"><span>Demo score</span><strong id="robDemo">0</strong></div>
        </div>
        <div id="robStatus" class="status">Train a policy, then step through a fresh world.</div>
      </aside>
      <section class="visual-grid">
        <article class="panel visual-card"><h3>Grid world</h3><canvas id="robWorld"></canvas></article>
        <article class="panel visual-card"><h3>Training curve</h3><canvas id="robChart"></canvas></article>
        <article class="panel visual-card full"><h3>Why 243 states?</h3><p class="note">Current, north, south, west, and east can each be empty, contain a can, or be a wall: 3 × 3 × 3 × 3 × 3 = 243. The genotype stores one action for every case.</p></article>
      </section>
    </div>
  `;
  const labels = () => { $("#robPopOut").value = $("#robPop").value; $("#robGenOut").value = $("#robGen").value; $("#robMutOut").value = (+$("#robMut").value).toFixed(3); };
  ["robPop","robGen","robMut"].forEach(id => $("#"+id).addEventListener("input", labels)); labels();
  let bestPolicy = Uint8Array.from({ length: 243 }, () => Math.floor(Math.random()*7));
  let world, state, lastAction = null;
  function resetWorld() { world = robbyWorld(); state = { x: 5, y: 5, score: 0, steps: 0 }; lastAction = null; drawWorld(); }
  function drawWorld() {
    const canvas = $("#robWorld"), ctx = canvasContext(canvas, 500, 500); const cell = 50;
    for (let y=0;y<10;y++) for(let x=0;x<10;x++) {
      ctx.fillStyle = world[y][x] ? "#f4c95d" : "#f6f8fa"; ctx.fillRect(x*cell,y*cell,cell,cell);
      ctx.strokeStyle="#dce2e8"; ctx.strokeRect(x*cell,y*cell,cell,cell);
      if (world[y][x]) { ctx.fillStyle="#735c15"; ctx.beginPath(); ctx.arc(x*cell+25,y*cell+25,10,0,Math.PI*2); ctx.fill(); }
    }
    ctx.fillStyle="#3b5ccc"; ctx.beginPath(); ctx.arc(state.x*cell+25,state.y*cell+25,17,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#fff"; ctx.font="bold 13px system-ui"; ctx.fillText("R",state.x*cell+20,state.y*cell+30);
    $("#robDemo").textContent = state.score;
  }
  $("#robReset").addEventListener("click", resetWorld);
  $("#robStep").addEventListener("click", () => { lastAction = robbyStep(world,state,bestPolicy); drawWorld(); $("#robStatus").textContent = `Step ${state.steps}: ${ROBBY_ACTIONS[lastAction]}, score ${state.score}.`; });
  $("#robTrain").addEventListener("click", async () => {
    const button = $("#robTrain"); button.disabled = true;
    const popSize=+$("#robPop").value, generations=+$("#robGen").value, mutation=+$("#robMut").value;
    let population=Array.from({length:popSize},()=>Uint8Array.from({length:243},()=>Math.floor(Math.random()*7)));
    const history=[]; let globalScore=-Infinity;
    for(let g=0;g<generations;g++){
      const fitness=population.map(p=>evaluateRobby(p));
      let bi=0; for(let i=1;i<fitness.length;i++) if(fitness[i]>fitness[bi]) bi=i;
      if(fitness[bi]>globalScore){globalScore=fitness[bi];bestPolicy=population[bi].slice();}
      history.push([g,fitness[bi]]); $("#robStatus").textContent=`Training generation ${g+1}/${generations}… best ${fmt(globalScore,2)}`;
      const next=[population[bi].slice()];
      while(next.length<popSize){
        const a=tournament(population,fitness),b=tournament(population,fitness),child=new Uint8Array(243);
        for(let i=0;i<243;i++){child[i]=Math.random()<.5?a[i]:b[i];if(Math.random()<mutation)child[i]=Math.floor(Math.random()*7);} next.push(child);
      }
      population=next; if(g%2===0) await sleepFrame();
    }
    $("#robBest").textContent=fmt(globalScore,2); drawPlot($("#robChart"),[{data:history}],{xMin:0,xMax:generations-1,xLabel:"generation",yLabel:"score"});
    $("#robStatus").textContent="Training complete. Use Demo step to inspect the evolved policy."; button.disabled=false; resetWorld();
  });
  resetWorld();
}
