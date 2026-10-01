# Stack Lab

A browser-based, single-player trainer for Tetris openers and Puyo chain foundations.

## Run locally

Serve the `dist` directory with any static web server, then open it in a browser.

## GitHub Pages

The included workflow publishes `dist` whenever the `main` branch is updated. In the repository settings, set **Pages → Source** to **GitHub Actions**.

## Controls

- Arrow Left / Right: move
- Arrow Down: soft drop (hard drop in Puyo Freeze)
- Arrow Up: hard drop
- A / S: rotate counter-clockwise / clockwise
- W: hold (Tetris)
- H: show hint
- Backspace: undo
- Enter: pause

Controls can be changed inside the app.

## Puyo Free Play and Freeze

**Free Play** automatically falls at the app's regular 1× rate (200 ms per row) and locks after the existing 500 ms grounded delay. Arrow Down soft drops, including when held; Arrow Up hard drops. This fixed rate applies even after an Untimed or slowed lesson, without changing the stored lesson/Tetris speed setting. Its board shows the usual 12 rows.

**Freeze** gives unlimited thinking time: no automatic falling or timed locking. Move and rotate, then press either Arrow Down or Arrow Up to hard drop once. Holding either key or drop button does not place later pairs. The board shows all 13 stored rows, including a shaded spawn row, so both members of the waiting pair are visible at their actual positions. Board physics and spawn coordinates are unchanged.

Both modes have on-screen movement, rotation, Down and Up controls with the same behavior as the configured keyboard actions. In both modes, settled Puyos fall and chains resolve after placement. Guided lessons retain their existing timing and soft-drop behavior.

Undo restores the state before the most recent placement, including position, mode, board, best chain, preview queue and seeded generator. Undoing an automatic lock in Free Play gives the restored pair a fresh lock delay. A blocked spawn stops play without replacing occupied cells; use Undo or Restart to continue.

Restart and switching Puyo mode repeat the current seed. New sequence chooses a different seed. Apply accepts decimal or hexadecimal (`0x1234`) seeds from 0 to 65535 and starts the sequence from the beginning. Both modes use the documented **20th Anniversary** four-color randomizer (four selected colors from RGBYP), with a 128-pair repeating pool. Its first two pairs contain at most three colors. See [the versioned specification](docs/puyo-randomizer-v1.md) for exact arithmetic, independent vectors and provenance. Exact PPT2 generator/physics equivalence is not claimed.

The right panel contains fixed references for 3-1 Stairs, 2-2 Stairs, GTR base, 1-1-2 Sandwich, 2-1-1 Sandwich and 3-0-1 Sandwich. Expand a name to see the diagram, symbolic roles, ignition explanation and source link. These references never affect the live queue or board. GTR is a transition foundation requiring an extension, rather than a complete chain. On narrow screens the panel appears below the board.

Gameplay keys do not act while a field, button, reference summary or settings dialog has keyboard focus. Click or tab to the board to resume keyboard play. Held hard drop commits only once; horizontal key repeat remains available. Tetris and guided lessons retain their timing/speed controls.

## Validation

Run `node tests/srs.test.js`, `node tests/opener-plans.test.js`, and `node tests/puyo.test.js`.
With Playwright installed, run `node tests/browser-puyo.test.js`. Optionally set `PUYO_BROWSER` to a Chrome/Chromium executable and `PUYO_SCREENSHOT` to a screenshot path containing `desktop` (the mobile capture substitutes `mobile`). The browser test serves local static files itself and injects inspection hooks only into its test page. It checks Free Play's real animation scheduler at 1×, normal locking and Undo, five simulated minutes of Freeze idle, keyboard and on-screen drop/repeat behavior, focus guards, full-cycle stream equality across modes and seeds, rollover, top-out, references, rebinding, pause and mode/game transitions, 12/13-row rendering, and 320–1440px layouts. Zoom is checked through the equivalent reduced CSS viewport. It does not deploy.
