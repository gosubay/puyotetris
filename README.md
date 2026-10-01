# Stack Lab

A browser-based, single-player trainer for Tetris openers and Puyo chain foundations.

## Run locally

Serve the `dist` directory with any static web server, then open it in a browser.

## GitHub Pages

The included workflow publishes `dist` whenever the `main` branch is updated. In the repository settings, set **Pages → Source** to **GitHub Actions**.

## Controls

- Arrow Left / Right: move
- Arrow Down: soft drop
- Arrow Up: hard drop
- A / S: rotate counter-clockwise / clockwise
- W: hold (Tetris)
- H: show hint
- Backspace: undo
- Enter: pause

Controls can be changed inside the app.

## Puyo Free Play

Every pair waits indefinitely. Move left/right and rotate, then use the configured hard-drop key (default Arrow Up) to commit one pair. Active-piece gravity, lock timers and soft drop are disabled here. Settled Puyos still fall and chains resolve after a drop. The staging strip shows both Puyos, their column and orientation; it does not change the board's existing hidden-row or spawn coordinates.

Undo restores the state before the most recent drop, including the planning position, board, best chain, preview queue and seeded generator. A blocked spawn stops play without replacing occupied cells; use Undo or Restart to continue.

Restart repeats the current seed. New sequence chooses a different seed. Apply accepts decimal or hexadecimal (`0x1234`) seeds from 0 to 65535 and starts the sequence from the beginning. The stream is the documented **20th Anniversary** four-color randomizer (four selected colors from RGBYP), with a 128-pair repeating pool. Its first two pairs contain at most three colors. See [the versioned specification](docs/puyo-randomizer-v1.md) for exact arithmetic, independent vectors and provenance. Exact PPT2 generator/physics equivalence is not claimed.

The right panel contains fixed references for 3-1 Stairs, 2-2 Stairs, GTR base, 1-1-2 Sandwich, 2-1-1 Sandwich and 3-0-1 Sandwich. Expand a name to see the diagram, symbolic roles, ignition explanation and source link. These references never affect the live queue or board. GTR is a transition foundation requiring an extension, rather than a complete chain. On narrow screens the panel appears below the board.

Gameplay keys do not act while a field, button, reference summary or settings dialog has keyboard focus. Click or tab to the board to resume keyboard play. Held hard drop commits only once; horizontal key repeat remains available. Tetris and guided lessons retain their timing/speed controls.

## Validation

Run `node tests/srs.test.js`, `node tests/opener-plans.test.js`, and `node tests/puyo.test.js`.
With Playwright installed, run `node tests/browser-puyo.test.js`. Optionally set `PUYO_BROWSER` to a Chrome/Chromium executable and `PUYO_SCREENSHOT` to a screenshot path. The browser test serves local static files itself, injects its inspection hooks only into its test page, and verifies five simulated minutes of idle, input repeat/focus, undo/re-drop, pool rollover, top-out, seed actions, references, key rebinding, mode switching and 320–1440px layouts. Zoom is checked through the equivalent reduced CSS viewport. It does not deploy.
