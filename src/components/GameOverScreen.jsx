import { ROLES } from '../constants/roles.js'
import CardImage from './CardImage.jsx'

export default function GameOverScreen({ state }) {
  const { winner, players } = state

  return (
    <div className="app-content" style={{ textAlign: 'center' }}>
      <div style={{
        padding: '2rem',
        margin: '2rem 0',
        border: `2px solid ${winner === 'employees' ? 'var(--green-primary)' : 'var(--red)'}`,
        borderRadius: '8px',
        background: winner === 'employees' ? 'var(--green-dim)' : 'var(--red-dim)',
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          color: winner === 'employees' ? 'var(--green-primary)' : 'var(--red)',
          marginBottom: '0.5rem',
        }}>
          {winner === 'employees' ? 'Les Employés ont gagné !' : 'Les Hackers ont pris le contrôle !'}
        </h2>
        <p style={{ color: 'var(--text-dim)' }}>
          {winner === 'employees'
            ? 'Tous les hackers ont été éliminés du réseau.'
            : 'Les hackers sont devenus majoritaires dans le réseau.'}
        </p>
      </div>

      <h3 className="section-title">Récapitulatif des Identités</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
        {players.map(player => {
          const role = ROLES[player.role]
          return (
            <div key={player.id} className="card" style={{ textAlign: 'center', opacity: player.alive ? 1 : 0.5 }}>
              <CardImage roleKey={player.role} />
              <div style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>{player.name}</div>
              <span className={`role-badge ${role?.team}`}>{role?.name}</span>
              {!player.alive && <div style={{ fontSize: '0.75rem', color: 'var(--red)', marginTop: '0.25rem' }}>Éliminé</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
