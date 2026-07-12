function graphER(n, p) {
  const edges=[]; for(let i=0;i<n;i++) for(let j=i+1;j<n;j++) if(Math.random()<p) edges.push([i,j]); return edges;
}
function graphWS(n, k, beta) {
  const set=new Set(); const key=(a,b)=>a<b?`${a}-${b}`:`${b}-${a}`;
  for(let i=0;i<n;i++) for(let d=1;d<=k/2;d++) set.add(key(i,(i+d)%n));
  [...set].forEach(edge=>{
    if(Math.random()<beta){ const [a,b]=edge.split("-").map(Number); set.delete(edge); let target; do target=Math.floor(Math.random()*n); while(target===a||set.has(key(a,target))); set.add(key(a,target)); }
  });
  return [...set].map(e=>e.split("-").map(Number));
}
function graphBA(n,m){
  const edges=[]; const degree=Array(n).fill(0);
  for(let i=0;i<m+1;i++)for(let j=i+1;j<m+1;j++){edges.push([i,j]);degree[i]++;degree[j]++;}
  for(let node=m+1;node<n;node++){
    const targets=new Set(); const total=degree.slice(0,node).reduce((a,b)=>a+b,0);
    while(targets.size<m){let r=Math.random()*total,sum=0;for(let i=0;i<node;i++){sum+=degree[i];if(r<=sum){targets.add(i);break;}}}
    targets.forEach(t=>{edges.push([node,t]);degree[node]++;degree[t]++;});
  }
  return edges;
}
function graphMetrics(n,edges){
  const adj=Array.from({length:n},()=>new Set()); edges.forEach(([a,b])=>{adj[a].add(b);adj[b].add(a);});
  const avgDegree=2*edges.length/n; let clustering=0, valid=0;
  adj.forEach(neigh=>{const arr=[...neigh];if(arr.length<2)return;let links=0;for(let i=0;i<arr.length;i++)for(let j=i+1;j<arr.length;j++)if(adj[arr[i]].has(arr[j]))links++;clustering+=links/(arr.length*(arr.length-1)/2);valid++;});
  return {adj,avgDegree,clustering:valid?clustering/valid:0};
}

function renderNetworks(lab){
  const app=$("#app");
  app.innerHTML=`
    ${labHeader(lab,
      "Different growth rules leave different structural signatures. Random graphs distribute links broadly, small-world rewiring preserves clustering while shortening paths, and preferential attachment creates hubs.",
      "structure = nodes + edges + a rule for connecting them"
    )}
    <div class="lab-layout">
      <aside class="panel controls">
        <div class="control"><label>Model</label><select id="netModel"><option value="er">Erdős–Rényi random</option><option value="ws">Watts–Strogatz small world</option><option value="ba">Barabási–Albert preferential attachment</option></select></div>
        <div class="control"><label>Nodes <output id="netNOut"></output></label><input id="netN" type="range" min="12" max="100" value="50" /></div>
        <div class="control"><label>Model parameter <output id="netParamOut"></output></label><input id="netParam" type="range" min="0.01" max="1" step="0.01" value="0.08" /></div>
        <button id="netGenerate" class="button">Generate network</button>
        <div class="metric-grid"><div class="metric"><span>Edges</span><strong id="netEdges"></strong></div><div class="metric"><span>Average degree</span><strong id="netDegree"></strong></div><div class="metric"><span>Clustering</span><strong id="netClustering"></strong></div><div class="metric"><span>Largest degree</span><strong id="netMaxDegree"></strong></div></div>
        <div class="callout">Change the model while holding node count roughly fixed. The visible topology is the accumulated result of a connection rule.</div>
      </aside>
      <section class="visual-grid">
        <article class="panel visual-card full"><h3>Network view</h3><canvas id="netCanvas"></canvas></article>
        <article class="panel visual-card full"><h3>Degree distribution</h3><canvas id="netHistogram"></canvas></article>
      </section>
    </div>`;
  function labels(){$("#netNOut").value=$("#netN").value;const model=$("#netModel").value,p=+$("#netParam").value;$("#netParamOut").value=model==="er"?`p=${p.toFixed(2)}`:model==="ws"?`β=${p.toFixed(2)}`:`m=${Math.max(1,Math.round(p*6))}`;}
  ["netN","netParam"].forEach(id=>$("#"+id).addEventListener("input",labels));$("#netModel").addEventListener("change",labels);labels();
  function generate(){
    const n=+$("#netN").value,model=$("#netModel").value,p=+$("#netParam").value;
    const edges=model==="er"?graphER(n,p):model==="ws"?graphWS(n,4,p):graphBA(n,Math.max(1,Math.round(p*6)));
    const {adj,avgDegree,clustering}=graphMetrics(n,edges);const degrees=adj.map(a=>a.size);
    $("#netEdges").textContent=edges.length;$("#netDegree").textContent=fmt(avgDegree,2);$("#netClustering").textContent=fmt(clustering,3);$("#netMaxDegree").textContent=Math.max(...degrees);
    const canvas=$("#netCanvas"),ctx=canvasContext(canvas,900,560),cx=450,cy=280,r=220;
    const positions=Array.from({length:n},(_,i)=>{const a=2*Math.PI*i/n-Math.PI/2;return[cx+r*Math.cos(a),cy+r*Math.sin(a)];});
    ctx.strokeStyle="rgba(73,91,108,.22)";ctx.lineWidth=1;edges.forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(...positions[a]);ctx.lineTo(...positions[b]);ctx.stroke();});
    const maxD=Math.max(...degrees,1);positions.forEach(([x,y],i)=>{ctx.fillStyle=`rgba(59,92,204,${.35+.65*degrees[i]/maxD})`;ctx.beginPath();ctx.arc(x,y,3+7*degrees[i]/maxD,0,Math.PI*2);ctx.fill();});
    const counts=new Map();degrees.forEach(d=>counts.set(d,(counts.get(d)||0)+1));const hist=[...counts].sort((a,b)=>a[0]-b[0]).map(([d,c])=>[d,c]);drawPlot($("#netHistogram"),[{data:hist,points:true}],{xMin:0,yMin:0,xLabel:"degree",yLabel:"node count",points:true});
  }
  $("#netGenerate").addEventListener("click",generate);generate();
}

function renderScaling(lab){
  const app=$("#app");
  app.innerHTML=`
    ${labHeader(lab,
      "A scaling law describes how one quantity changes with the size of another. The exponent determines whether the relationship is sublinear, linear, or superlinear.",
      "Y = Y₀ Mᵝ    ⇔    log Y = log Y₀ + β log M"
    )}
    <div class="lab-layout">
      <aside class="panel controls">
        <div class="control"><label>Exponent β <output id="scaleBetaOut"></output></label><input id="scaleBeta" type="range" min="0.2" max="1.6" step="0.01" value="0.75" /></div>
        <div class="control"><label>Maximum M <output id="scaleMaxOut"></output></label><input id="scaleMax" type="range" min="10" max="1000" step="10" value="200" /></div>
        <div class="button-row"><button class="button secondary small scale-preset" data-beta="0.667">2/3</button><button class="button secondary small scale-preset" data-beta="0.75">3/4</button><button class="button secondary small scale-preset" data-beta="1">Linear</button><button class="button secondary small scale-preset" data-beta="1.15">Urban 1.15</button></div>
        <div class="metric-grid"><div class="metric"><span>Doubling multiplier</span><strong id="scaleDouble"></strong></div><div class="metric"><span>Regime</span><strong id="scaleRegime"></strong></div></div>
        <div class="callout">On log–log axes, β is literally the slope. This turns multiplicative relationships into geometry.</div>
      </aside>
      <section class="visual-grid">
        <article class="panel visual-card"><h3>Linear axes</h3><canvas id="scaleLinear"></canvas></article>
        <article class="panel visual-card"><h3>Log–log axes</h3><canvas id="scaleLog"></canvas></article>
        <article class="panel visual-card full"><h3>Interpretation</h3><p id="scaleText" class="note"></p></article>
      </section>
    </div>`;
  const betaInput=$("#scaleBeta"),maxInput=$("#scaleMax");
  function update(){
    const beta=+betaInput.value,max=+maxInput.value;$("#scaleBetaOut").value=beta.toFixed(2);$("#scaleMaxOut").value=max;
    $("#scaleDouble").textContent=fmt(Math.pow(2,beta),3)+"×";const regime=beta<.98?"Sublinear":beta>1.02?"Superlinear":"Linear";$("#scaleRegime").textContent=regime;
    const data=Array.from({length:100},(_,i)=>{const m=1+(max-1)*i/99;return[m,Math.pow(m,beta)];});drawPlot($("#scaleLinear"),[{data}],{xMin:1,xMax:max,yMin:1,xLabel:"M",yLabel:"Y"});
    const logData=data.map(([m,y])=>[Math.log10(m),Math.log10(y)]);drawPlot($("#scaleLog"),[{data:logData}],{xMin:0,xLabel:"log₁₀ M",yLabel:"log₁₀ Y"});
    $("#scaleText").textContent=regime==="Sublinear"?"Y grows more slowly than M. Larger systems gain an economy of scale: doubling M multiplies Y by less than two.":regime==="Superlinear"?"Y grows faster than M. Doubling M more than doubles Y, a pattern often discussed for innovation, interaction, and some urban quantities.":"Y is proportional to M. Doubling the scale doubles the response.";
  }
  betaInput.addEventListener("input",update);maxInput.addEventListener("input",update);$$(".scale-preset").forEach(b=>b.addEventListener("click",()=>{betaInput.value=b.dataset.beta;update();}));update();
}
