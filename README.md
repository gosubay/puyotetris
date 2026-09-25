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

## Puyo drills

Choose **PUYO → Drills**. Puyo starts untimed; Tetris retains its own fall-speed setting.

- Sandwich: fire a prepared two-chain, complete missing caps, build a 2–1–1 three-chain, and build a 1–1–2 three-chain.
- GTR: fire a prepared transition, then build it from AA → BB, AB → AB, and AB → AC openings. Letters describe shared colours, not literal colour names.
- **Learn** shows a placement guide and step explanation. **Recall** hides both until a hint is requested with H.
- **New colours** recolours the same exercise; **Mirror the board** reverses its direction. Restart keeps the current variation.
- Incorrect placements retry the same pair without changing the board or queue. Intermediate moves follow the taught formation; equivalent placements that reach the same board are accepted. These are sequence-recall drills, not unrestricted puzzle solving.
- Completion requires the intended chain to actually fire. The final trigger accepts any legal placement producing the required chain length. Replay shows each clearing group and the board after gravity. Undo can restore the pre-trigger board; re-firing after undo does not add another completion.
- Completion and hint-free completion counts are saved in this browser when local storage is available. A hint-free count means no placement hint was used; retries and undo are still allowed.

These are deliberately short, fixed teaching sequences, not all random openings or the full GTR/Rising L chart. Tails, Rising L, and live move recommendations are outside this first drill set. The sequences are authored for this trainer and checked through simulation. Formation references: [Shiningbolt's Sandwich guide](https://puyo-camp.jp/posts/116414) and [Chueq's GTR guide](https://www.chueq.com/puyo/learn/gtr/).

## Verify

Run `node --test tests/*.test.js` (Node.js 18+). The Puyo tests check all 24 colour permutations in both directions for every drill, premature clears, gravity, chain order, and equivalent placements. Existing Tetris route and rotation tests run in the same suite.
