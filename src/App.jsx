import { useReducer } from 'react'
import { gameReducer, initialState } from './state/gameReducer.js'
import SetupScreen from './components/SetupScreen.jsx'
import RoleReveal from './components/RoleReveal.jsx'
import NightPhase from './components/NightPhase.jsx'
import DayPhase from './components/DayPhase.jsx'
import GameStatus from './components/GameStatus.jsx'
import GameOverScreen from './components/GameOverScreen.jsx'

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  const showSidebar = state.screen !== 'setup' && state.screen !== 'reveal'

  return (
    <div className="app">
      <header className="app-header">
        <h1>Who's The Hacker</h1>
        {state.screen !== 'setup' && (
          <span className="turn-info">
            {state.screen === 'gameover' ? 'Partie terminée' :
              `Tour ${state.turnNumber} — ${state.screen === 'night' ? 'Nuit' : state.screen === 'day' ? 'Jour' : 'Préparation'}`}
          </span>
        )}
      </header>

      <div className="app-main">
        {state.screen === 'setup' && <SetupScreen dispatch={dispatch} />}
        {state.screen === 'reveal' && <RoleReveal state={state} dispatch={dispatch} />}
        {state.screen === 'night' && <NightPhase state={state} dispatch={dispatch} />}
        {state.screen === 'day' && <DayPhase state={state} dispatch={dispatch} />}
        {state.screen === 'gameover' && <GameOverScreen state={state} />}

        {showSidebar && <GameStatus state={state} />}
      </div>
    </div>
  )
}
