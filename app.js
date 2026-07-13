const labs = [
  {
    path: "shape-of-high-dimensions/",
    number: "01",
    group: "Foundations",
    title: "The Shape of High Dimensions",
    short: "Build intuition for volume concentration, thin shells, cube-ball mismatch, and Monte Carlo failure.",
  },
  {
    path: "information-entropy/",
    number: "02",
    group: "Foundations",
    title: "Information & Entropy",
    short: "Explore surprise, Shannon entropy, probability distributions, and simple compressibility.",
  },
  {
    path: "logistic-map/",
    number: "03",
    group: "Dynamics & Chaos",
    title: "Logistic Map",
    short: "Watch stability, periodicity, bifurcation, and sensitive dependence emerge from one equation.",
  },
  {
    path: "cellular-automata/",
    number: "04",
    group: "Emergence",
    title: "Elementary Cellular Automata",
    short: "Turn an eight-bit rule table into regularity, randomness, and complex structures.",
  },
  {
    path: "game-of-life/",
    number: "05",
    group: "Emergence",
    title: "Conway’s Game of Life",
    short: "Edit a universe and observe how local birth and survival rules create persistent patterns.",
  },
  {
    path: "genetic-algorithm-playground/",
    number: "06",
    group: "Evolution & Adaptation",
    title: "Genetic Algorithm Playground",
    short: "Compare smooth, deceptive, and rugged fitness landscapes using mutation and recombination.",
  },
  {
    path: "robby-ga/",
    number: "07",
    group: "Evolution & Adaptation",
    title: "Robby the Robot",
    short: "Evolve a 243-entry policy for a local agent collecting cans in a grid world.",
  },
  {
    path: "network-science-lab/",
    number: "08",
    group: "Networks",
    title: "Network Science Lab",
    short: "Generate random, small-world, and preferential-attachment networks and compare their structure.",
  },
  {
    path: "scaling-laws/",
    number: "09",
    group: "Scaling",
    title: "Scaling Laws",
    short: "See why power laws become straight lines on log-log axes and how exponents shape growth.",
  },
];

const groupOrder = [
  "Foundations",
  "Dynamics & Chaos",
  "Emergence",
  "Evolution & Adaptation",
  "Networks",
  "Scaling",
];

const select = (selector) => document.querySelector(selector);

function buildNavigation() {
  const nav = select("#nav");
  nav.innerHTML = `
    <a class="nav-link active" href="#overview" aria-current="page">Overview</a>
    ${groupOrder.map((group) => {
      const links = labs
        .filter((lab) => lab.group === group)
        .map((lab) => `<a class="nav-link" href="./${lab.path}">${lab.title}</a>`)
        .join("");
      return `<div class="nav-group">${group}</div>${links}`;
    }).join("")}
  `;
}

function renderHome() {
  select("#app").innerHTML = `
    <section id="overview" class="hero">
      <div class="hero-kicker">Interactive companion</div>
      <h1>Nine experiments, kept in their original form.</h1>
      <p>
        A single shelf for the standalone pages created while reading
        <em>Complexity: A Guided Tour</em>. The overview connects the ideas; every experiment
        below remains the original page, with its own design, controls, and implementation.
      </p>
      <div class="hero-actions">
        <a class="button" href="./shape-of-high-dimensions/">Start the guided tour</a>
        <a class="button ghost" href="https://github.com/Chen-Qingxiang/complexity-visual-lab" target="_blank" rel="noreferrer">View repository ↗</a>
      </div>
    </section>

    <div class="section-title">
      <h2>Nine original experiments</h2>
      <p>The ordering provides a reading path without forcing the individual projects into one visual or technical mould.</p>
    </div>

    <section class="card-grid" aria-label="Complexity experiments">
      ${labs.map((lab) => `
        <article class="lab-card">
          <div class="eyebrow">${lab.group}</div>
          <h3>${lab.title}</h3>
          <p>${lab.short}</p>
          <div class="card-actions">
            <span class="number">${lab.number}</span>
            <a class="button small" href="./${lab.path}" aria-label="Open ${lab.title}">Open original page</a>
          </div>
        </article>
      `).join("")}
    </section>

    <div class="section-title">
      <h2>How this collection works</h2>
    </div>
    <section class="visual-grid">
      <article class="panel">
        <h3>One index, independent pages</h3>
        <p>This page supplies the map. Each experiment lives in its own folder and runs independently, just as the standalone project did.</p>
      </article>
      <article class="panel">
        <h3>Original design preserved</h3>
        <p>The experiments keep their existing layouts, visual languages, explanations, controls, and simulation code.</p>
      </article>
      <article class="panel">
        <h3>A conceptual reading path</h3>
        <p>The sequence connects foundations, dynamics, emergence, adaptation, networks, and scaling without rewriting the tools.</p>
      </article>
      <article class="panel">
        <h3>Easy to separate again</h3>
        <p>Because the pages have no shared runtime, an experiment can still be maintained, copied, or opened on its own.</p>
      </article>
    </section>
  `;
}

buildNavigation();
renderHome();

select("#menuButton").addEventListener("click", () => select(".sidebar").classList.toggle("open"));

document.addEventListener("click", (event) => {
  if (
    window.innerWidth <= 760
    && !event.target.closest(".sidebar")
    && !event.target.closest("#menuButton")
  ) {
    select(".sidebar").classList.remove("open");
  }
});
