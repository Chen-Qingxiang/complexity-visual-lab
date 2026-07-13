# Complexity Visual Lab

**Complexity Visual Lab** is a single index for the interactive experiments created while reading Melanie Mitchell's *Complexity: A Guided Tour*.

Live site (after GitHub Pages is enabled):

<https://chen-qingxiang.github.io/complexity-visual-lab/>

## Architecture

The root page is only a catalogue and reading path. Each lab is a direct copy of its finished standalone page and keeps its original visual design, content, controls, and implementation. The labs do not share an application runtime and are not rewritten as components of the catalogue.

```text
complexity-visual-lab/
├── index.html                       # catalogue only
├── app.js
├── styles.css
├── shape-of-high-dimensions/        # independent original page
├── information-entropy/
├── logistic-map/
├── cellular-automata/
├── game-of-life/
├── genetic-algorithm-playground/
├── robby-ga/
├── network-science-lab/
└── scaling-laws/
```

Opening a card navigates to the corresponding standalone page inside this repository. No iframe or compatibility wrapper sits between the visitor and the original tool.

## Included labs

| Reading order | Lab | Standalone source snapshot |
| --- | --- | --- |
| 1 | [The Shape of High Dimensions](https://github.com/Chen-Qingxiang/shape-of-high-dimensions) | `b8464af` |
| 2 | [Information & Entropy](https://github.com/Chen-Qingxiang/information-entropy) | `e52bb35` |
| 3 | [Logistic Map](https://github.com/Chen-Qingxiang/logistic-map) | `251f290` |
| 4 | [Elementary Cellular Automata](https://github.com/Chen-Qingxiang/cellular-automata) | `bdb4344` |
| 5 | [Conway's Game of Life](https://github.com/Chen-Qingxiang/game-of-life) | `86271fa` |
| 6 | [Genetic Algorithm Playground](https://github.com/Chen-Qingxiang/genetic-algorithm-playground) | `6e7093e` |
| 7 | [Robby the Robot](https://github.com/Chen-Qingxiang/robby-ga) | `d2268f1` |
| 8 | [Network Science Lab](https://github.com/Chen-Qingxiang/network-science-lab) | `3c1125a` |
| 9 | [Scaling Laws](https://github.com/Chen-Qingxiang/scaling-laws) | `548f1ef` |

These are the last finished snapshots before the standalone repositories were changed to redirect to a consolidated site. The migrated files come from the already verified consolidation snapshot (`2f77ddb`). It is byte-for-byte identical to the standalone snapshots for application code and markup, apart from two small responsive overflow fixes, displayed deployment paths, project-local README files, and relative asset URLs required by this repository's GitHub Pages path. The high-dimensional React page is included as its production bundle so the repository remains directly deployable as a static site.

## Run locally

No package installation or root build step is required:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

The JavaScript test suites that belonged to the larger standalone projects are preserved inside their respective directories.

## Deployment

The workflow in `.github/workflows/deploy-pages.yml` deploys the repository root with the official GitHub Pages actions whenever `main` is updated.

In the repository settings, open **Pages** and set **Source** to **GitHub Actions**.

## Scope

This is a personal learning and visualization project, not an authoritative implementation of every model. The emphasis is on intuition, experimentation, and preserving the work already invested in the standalone pages.
