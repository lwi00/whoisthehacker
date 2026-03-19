import { ROLES } from '../constants/roles.js'
import CardImage from './CardImage.jsx'

export default function RoleReveal({ state, dispatch }) {
  const { players, centerCards, leaderId } = state

  function handleElectLeader(playerId) {
    dispatch({ type: 'SET_LEADER', playerId })
  }

  function handleStartGame() {
    dispatch({ type: 'START_GAME' })
  }

  return (
    <div className="app-content">
      <h2 className="section-title">Attribution des Rôles (vue MJ uniquement)</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {players.map(player => {
          const role = ROLES[player.role]
          return (
            <div key={player.id} className="card" style={{ textAlign: 'center' }}>
              <CardImage roleKey={player.role} large />
              <div style={{ marginTop: '0.75rem', fontWeight: 'bold', fontSize: '1rem' }}>{player.name}</div>
              <div style={{ marginTop: '0.25rem' }}>
                <span className={`role-badge ${role?.team || 'green'}`}>{role?.name || player.role}</span>
              </div>
              <button
                className={`btn ${leaderId === player.id ? 'btn-primary' : ''}`}
                style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}
                onClick={() => handleElectLeader(player.id)}
              >
                {leaderId === player.id ? 'Responsable' : 'Élire Responsable'}
              </button>
            </div>
          )
        })}
      </div>

      <div className="card">
        <div className="card-title">Cartes du Centre (Hacker Infiltré)</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {centerCards.map((card, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <CardImage roleKey={card.role} />
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>{ROLES[card.role]?.name}</div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="btn btn-primary"
        style={{ marginTop: '1rem' }}
        onClick={handleStartGame}
        disabled={leaderId === null}
      >
        {leaderId === null ? 'Élisez un Responsable pour commencer' : 'Commencer la Partie — Nuit 1'}
      </button>
    </div>
  )
}
