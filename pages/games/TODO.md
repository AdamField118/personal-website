# Games — TODO

The Games section is registry-driven: each game is an entry in `/games.json`
and (when built) a page under `/pages/games/`. To add a game, drop its page in
this directory and flip its `games.json` entry from `"status": "soon"` to
`"status": "live"` with an `href` (and ideally an `image`).

## Live
- [x] **Magic 8-Ball** — `pages/games/magic-8-ball.html`

## Planned
- [ ] **Wordle** — five-letter word guessing, six tries, per-day word.
- [ ] **Strands** — themed word search on a letter grid.
- [ ] **Connections** — group sixteen words into four sets.
- [ ] **Tango** — sun/moon logic grid.
- [ ] **Sudoku** — 9×9 with generator + difficulty levels.
- [ ] **Crossword** — hand-authored puzzles + a small clue/grid format.
- [ ] **Tank Game** — two-player artillery duel (canvas).

## Notes
- Each game entry in `games.json`: `{ title, description, image, href, status }`.
- `status: "soon"` renders a disabled "Coming soon" card (no `href`/`image` needed).
- Self-contained games (inline CSS/JS like the 8-Ball) keep their own full-screen
  page with a `.game-back` link to `/pages/games.html`.
