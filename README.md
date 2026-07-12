# Complexity Visual Lab

**Complexity Visual Lab** is a unified interactive web notebook for experiments created while reading Melanie Mitchell's *Complexity: A Guided Tour*.

Live site (after GitHub Pages is enabled):

<https://chen-qingxiang.github.io/complexity-visual-lab/>

## Included labs

1. The Shape of High Dimensions
2. Information & Entropy
3. Logistic Map
4. Elementary Cellular Automata
5. Conway's Game of Life
6. Genetic Algorithm Playground
7. Robby the Robot
8. Network Science Lab
9. Scaling Laws

The application groups the labs into a conceptual path: foundations, dynamics and chaos, emergence, evolution and adaptation, networks, and scaling.

## Design

- One responsive single-page application
- Plain HTML, CSS, JavaScript, and Canvas
- No package installation or build step
- No external libraries or CDNs
- Works offline after the files are downloaded
- Deployable directly to GitHub Pages

## Run locally

From the repository root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Deployment

The workflow in `.github/workflows/deploy-pages.yml` deploys the repository root with the official GitHub Pages actions whenever `main` is updated.

In the repository settings, open **Pages** and set **Source** to **GitHub Actions**.

## Original standalone projects

This repository consolidates and extends the following earlier experiments while preserving their development histories:

- [shape-of-high-dimensions](https://github.com/Chen-Qingxiang/shape-of-high-dimensions)
- [information-entropy](https://github.com/Chen-Qingxiang/information-entropy)
- [logistic-map](https://github.com/Chen-Qingxiang/logistic-map)
- [cellular-automata](https://github.com/Chen-Qingxiang/cellular-automata)
- [game-of-life](https://github.com/Chen-Qingxiang/game-of-life)
- [genetic-algorithm-playground](https://github.com/Chen-Qingxiang/genetic-algorithm-playground)
- [robby-ga](https://github.com/Chen-Qingxiang/robby-ga)
- [network-science-lab](https://github.com/Chen-Qingxiang/network-science-lab)
- [scaling-laws](https://github.com/Chen-Qingxiang/scaling-laws)

## Scope

This is a personal learning and visualization project, not an authoritative implementation of every model. The emphasis is on intuition, experimentation, and connections between ideas.
