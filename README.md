# Who's The Hacker?

A web-based Game Master interface for a cybersecurity-themed social deduction card game, inspired by the classic Werewolf/Mafia format. Players take on roles within a fictional company network — hackers try to infiltrate while employees work to identify and eliminate the threats.

## Tech Stack

- **React** 19 with Vite 8
- **JavaScript** (ES Modules)
- Pure client-side — no backend required

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm

## Installation

```bash
git clone https://github.com/lwi00/whoisthehacker.git
cd whoisthehacker
npm install
```

## Running the App

### Development

```bash
npm run dev
```

Opens a local dev server at `http://localhost:5173` with hot reload.

### Production Build

```bash
npm run build
npm run preview
```

`build` generates a `dist/` folder. `preview` serves the production build locally.

## How to Play

The app acts as a **Game Master (GM) tool** — one person controls the interface on a shared screen or device while 7+ players participate in person.

### Game Flow

1. **Setup** — Enter player names and configure which roles are in the game.
2. **Role Reveal** — Each player secretly views their assigned role. A leader (Responsable) is elected.
3. **Night Phase** — The GM guides each role through their night action in order (hacker infiltre, admin reseau, analyste, hackers, ingenieure systeme).
4. **Day Phase** — Deaths are announced, players debate (5-minute timer), then vote to eliminate a suspect. The leader's vote counts double.
5. Repeat Night/Day until a win condition is met.

### Win Conditions

- **Employees win** when all hackers are eliminated.
- **Hackers win** when they equal or outnumber the remaining employees.

### Roles

| Role | Team | Ability |
|------|------|---------|
| Hacker | Red | Eliminates one player each night |
| Hacker Infiltre | Red | Turn 1: can swap identity with a center card |
| Analyste de Donnees | Blue | Scans one player each night to learn their role |
| Ingenieure Systeme | Blue | One-use save (Correctif) and one-use kill (Contre-virus) |
| Agent de Cybersecurite | Blue | If eliminated, immediately retaliates and kills another player |
| Employe | Green | No special power — votes and deduces |
| Stagiaire IT | Green | Can peek at hackers during their night action (risky) |
| Administrateur Reseau | Green | Turn 1: links two players — if one dies, the other dies too |
| Responsable | Green | Elected leader whose vote counts as 2 |

For the full rules in French, see [RULES.md](./RULES.md).

## Project Structure

```
src/
  components/       # React UI components (SetupScreen, NightPhase, DayPhase, etc.)
  constants/roles.js  # Role definitions and night step configuration
  state/gameReducer.js  # Central state machine for all game logic
  utils/            # Distribution, night ordering, win condition helpers
  App.jsx           # Root component
  App.css           # Dark cybersecurity-themed styling
public/cartes/      # Card artwork (PNG)
cards/              # Source data for card designs (CSV/XLSX)
```

## Testing

No test suite is configured yet. Contributions welcome.

## Contributing

See [Contributing guidelines](./Contributing%20guidelines) for instructions (in French).

## License

MIT — see [LICENSE.md](./LICENSE.md). Based on the original Werewolf game by Dimitry Davidoff.
