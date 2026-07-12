const labs = [
  {
    slug: "high-dimensions",
    number: "01",
    group: "Foundations",
    title: "The Shape of High Dimensions",
    short: "Build intuition for volume concentration, thin shells, cube–ball mismatch, and Monte Carlo failure.",
    source: "shape-of-high-dimensions",
    render: renderHighDimensions,
  },
  {
    slug: "information-entropy",
    number: "02",
    group: "Foundations",
    title: "Information & Entropy",
    short: "Explore surprise, Shannon entropy, probability distributions, and simple compressibility.",
    source: "information-entropy",
    render: renderEntropy,
  },
  {
    slug: "logistic-map",
    number: "03",
    group: "Dynamics & Chaos",
    title: "Logistic Map",
    short: "Watch stability, periodicity, bifurcation, and sensitive dependence emerge from one equation.",
    source: "logistic-map",
    render: renderLogistic,
  },
  {
    slug: "cellular-automata",
    number: "04",
    group: "Emergence",
    title: "Elementary Cellular Automata",
    short: "Turn an eight-bit rule table into regularity, randomness, and complex structures.",
    source: "cellular-automata",
    render: renderCellularAutomata,
  },
  {
    slug: "game-of-life",
    number: "05",
    group: "Emergence",
    title: "Conway’s Game of Life",
    short: "Edit a universe and observe how local birth and survival rules create persistent patterns.",
    source: "game-of-life",
    render: renderGameOfLife,
  },
  {
    slug: "genetic-algorithm",
    number: "06",
    group: "Evolution & Adaptation",
    title: "Genetic Algorithm Playground",
    short: "Compare smooth, deceptive, and rugged fitness landscapes using mutation and recombination.",
    source: "genetic-algorithm-playground",
    render: renderGeneticAlgorithm,
  },
  {
    slug: "robby",
    number: "07",
    group: "Evolution & Adaptation",
    title: "Robby the Robot",
    short: "Evolve a 243-entry policy for a local agent collecting cans in a grid world.",
    source: "robby-ga",
    render: renderRobby,
  },
  {
    slug: "network-science",
    number: "08",
    group: "Networks",
    title: "Network Science Lab",
    short: "Generate random, small-world, and preferential-attachment networks and compare their structure.",
    source: "network-science-lab",
    render: renderNetworks,
  },
  {
    slug: "scaling-laws",
    number: "09",
    group: "Scaling",
    title: "Scaling Laws",
    short: "See why power laws become straight lines on log–log axes and how exponents shape growth.",
    source: "scaling-laws",
    render: renderScaling,
  },
];

const groupOrder = ["Foundations", "Dynamics & Chaos", "Emergence", "Evolution & Adaptation", "Networks", "Scaling"];
let cleanupCurrent = null;

function buildNavigation() {
  const nav = $("#nav");
  nav.innerHTML = `<a class="nav-link" href="#/">Overview</a>` + groupOrder.map(group => {
    const links = labs.filter(lab => lab.group === group)
      .map(lab => `<a class="nav-link" data-route="${lab.slug}" href="#/${lab.slug}">${lab.title}</a>`).join("");
    return `<div class="nav-group">${group}</div>${links}`;
  }).join("");
}

function updateActiveNavigation(slug) {
  $$(".nav-link").forEach(link => link.classList.remove("active"));
  const active = slug ? $(`.nav-link[data-route="${slug}"]`) : $(".nav-link[href='#/']");
  active?.classList.add("active");
}

function renderHome() {
  const app = $("#app");
  app.innerHTML = `
    <section class="hero">
      <div class="hero-kicker">Interactive companion</div>
      <h1>Complexity becomes clearer when you can change the rules.</h1>
      <p>
        A unified visual notebook for experiments created while reading
        <em>Complexity: A Guided Tour</em>. Move sliders, run simulations, and connect ideas
        across information, chaos, emergence, evolution, networks, and scaling.
      </p>
      <div class="hero-actions">
        <a class="button" href="#/high-dimensions">Start the guided tour</a>
        <a class="button ghost" href="https://github.com/Chen-Qingxiang/complexity-visual-lab" target="_blank" rel="noreferrer">View repository ↗</a>
      </div>
    </section>

    <div class="section-title">
      <h2>Nine connected experiments</h2>
      <p>The sequence follows a conceptual path rather than the chronology in which the original tools were built.</p>
    </div>

    <section class="card-grid">
      ${labs.map(lab => `
        <article class="lab-card">
          <div class="eyebrow">${lab.group}</div>
          <h3>${lab.title}</h3>
          <p>${lab.short}</p>
          <div class="card-actions">
            <span class="number">${lab.number}</span>
            <a class="button small" href="#/${lab.slug}">Open lab</a>
          </div>
        </article>
      `).join("")}
    </section>

    <div class="section-title">
      <h2>How to use the lab</h2>
    </div>
    <section class="visual-grid">
      <article class="panel">
        <h3>1. Form an expectation</h3>
        <p>Before moving a control, guess what will happen. The mismatch between expectation and result is the useful part.</p>
      </article>
      <article class="panel">
        <h3>2. Change one thing</h3>
        <p>Vary one parameter at a time, especially near transitions: chaos thresholds, mutation rates, or network rewiring.</p>
      </article>
      <article class="panel">
        <h3>3. Connect the chapters</h3>
        <p>Look for recurring ideas: distributions, local interactions, feedback, search, robustness, and emergent order.</p>
      </article>
      <article class="panel">
        <h3>4. Return to the sources</h3>
        <p>Each module links to its original standalone repository, preserving the development history and fuller notes.</p>
      </article>
    </section>
  `;
}

function route() {
  if (cleanupCurrent) {
    cleanupCurrent();
    cleanupCurrent = null;
  }
  const slug = location.hash.replace(/^#\/?/, "").split("?")[0];
  const lab = labs.find(item => item.slug === slug);
  updateActiveNavigation(slug);
  window.scrollTo(0, 0);
  if (!lab) {
    renderHome();
  } else {
    cleanupCurrent = lab.render(lab) || null;
  }
  $(".sidebar")?.classList.remove("open");
}

buildNavigation();
window.addEventListener("hashchange", route);
$("#menuButton").addEventListener("click", () => $(".sidebar").classList.toggle("open"));
document.addEventListener("click", event => {
  if (window.innerWidth <= 760 && !event.target.closest(".sidebar") && !event.target.closest("#menuButton")) $(".sidebar").classList.remove("open");
});
route();
