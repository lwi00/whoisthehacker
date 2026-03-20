import { ROLES } from '../constants/roles.js'

export default function GameStatus({ state }) {
  const { players, leaderId, powers, turnNumber } = state

  return (
    <div className="sidebar">
      <h3>Joueurs</h3>
      {players.map(player => {
        const role = ROLES[player.role]
        return (
          <div key={player.id} className={`sidebar-player ${player.alive ? '' : 'dead'}`}>
            <span className={`status-dot ${player.alive ? '' : 'dead'}`} />
            <span style={{ flex: 1 }}>{player.name}</span>
            <span className={`role-badge ${role?.team || 'green'}`} style={{ fontSize: '0.65rem' }}>
              {role?.name?.slice(0, 8)}
            </span>
            {player.id === leaderId && <span style={{ color: 'var(--blue)', fontSize: '0.7rem' }}>★</span>}
          </div>
        )
      })}

      <h3 style={{ marginTop: '1.25rem' }}>Pouvoirs</h3>
      <div style={{ fontSize: '0.8rem' }}>
        <div style={{ padding: '0.2rem 0' }}>
          Correctif : {powers.engineerFix ? <span style={{ color: 'var(--red)' }}>utilisé</span> : <span style={{ color: 'var(--green-primary)' }}>disponible</span>}
        </div>
        <div style={{ padding: '0.2rem 0' }}>
          Contre-virus : {powers.engineerCounterVirus ? <span style={{ color: 'var(--red)' }}>utilisé</span> : <span style={{ color: 'var(--green-primary)' }}>disponible</span>}
        </div>
      </div>

      <h3 style={{ marginTop: '1.25rem' }}>Liens</h3>
      <div style={{ fontSize: '0.8rem' }}>
        {players.filter(p => p.boundTo !== null).length > 0 ? (
          players.filter(p => p.boundTo !== null && p.id < p.boundTo).map(p => {
            const other = players.find(x => x.id === p.boundTo)
            return (
              <div key={p.id} style={{ padding: '0.2rem 0' }}>
                {p.name} ↔ {other?.name}
              </div>
            )
          })
        ) : (
          <div style={{ color: 'var(--text-dim)' }}>Aucun</div>
        )}
      </div>

      <h3 style={{ marginTop: '1.25rem' }}>Stats</h3>
      <div style={{ fontSize: '0.8rem' }}>
        <div>Tour : {turnNumber}</div>
        <div>Vivants : {players.filter(p => p.alive).length}/{players.length}</div>
        <div>Hackers vivants : {players.filter(p => p.alive && ROLES[p.role]?.team === 'red').length}</div>
      </div>
    </div>
  )
}
