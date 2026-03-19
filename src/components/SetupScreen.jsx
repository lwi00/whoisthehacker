import { useState } from 'react'
import { ROLES } from '../constants/roles.js'
import { distributeRoles } from '../utils/distribution.js'
import CardImage from './CardImage.jsx'

const CONFIGURABLE_ROLES = [
  { key: 'hacker', min: 2, max: 4, default: 2 },
  { key: 'hackerInfiltre', min: 0, max: 1, default: 0 },
  { key: 'analyste', min: 0, max: 1, default: 1 },
  { key: 'ingenieur', min: 0, max: 1, default: 1 },
  { key: 'agent', min: 0, max: 1, default: 0 },
  { key: 'administrateur', min: 0, max: 1, default: 0 },
  { key: 'stagiaire', min: 0, max: 1, default: 0 },
  { key: 'employe', min: 0, max: 10, default: 3 },
]

export default function SetupScreen({ dispatch }) {
  const [playerCount, setPlayerCount] = useState(7)
  const [names, setNames] = useState(Array(7).fill(''))
  const [roleCounts, setRoleCounts] = useState(
    Object.fromEntries(CONFIGURABLE_ROLES.map(r => [r.key, r.default]))
  )
  const [error, setError] = useState('')

  const totalRoles = Object.values(roleCounts).reduce((a, b) => a + b, 0)
  const needed = playerCount + 2 // players + 2 center cards

  function handlePlayerCountChange(count) {
    const n = Math.max(7, Math.min(20, count))
    setPlayerCount(n)
    setNames(prev => {
      const next = [...prev]
      while (next.length < n) next.push('')
      return next.slice(0, n)
    })
  }

  function handleNameChange(index, value) {
    setNames(prev => prev.map((n, i) => i === index ? value : n))
  }

  function handleRoleCount(key, delta) {
    const config = CONFIGURABLE_ROLES.find(r => r.key === key)
    setRoleCounts(prev => ({
      ...prev,
      [key]: Math.max(config.min, Math.min(config.max, prev[key] + delta)),
    }))
  }

  function handleDistribute() {
    // Validate names
    const filledNames = names.map((n, i) => n.trim() || `Joueur ${i + 1}`)

    if (totalRoles !== needed) {
      setError(`Il faut exactement ${needed} rôles (${playerCount} joueurs + 2 cartes centre). Actuellement : ${totalRoles}`)
      return
    }

    if (roleCounts.hacker < 2) {
      setError('Il faut au moins 2 Hackers.')
      return
    }

    // Build role list
    const roleList = []
    for (const [key, count] of Object.entries(roleCounts)) {
      for (let i = 0; i < count; i++) {
        roleList.push(key)
      }
    }

    const { players, centerCards } = distributeRoles(filledNames, roleList)
    dispatch({ type: 'SET_PLAYERS', players, centerCards })
    dispatch({ type: 'GO_TO_REVEAL' })
    setError('')
  }

  return (
    <div className="app-content">
      <h2 className="section-title">Configuration de la Partie</h2>

      <div className="card">
        <div className="card-title">Joueurs</div>
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label>Nombre de joueurs :</label>
          <button className="btn" onClick={() => handlePlayerCountChange(playerCount - 1)}>-</button>
          <span style={{ color: 'var(--green-primary)', fontSize: '1.2rem', minWidth: '2rem', textAlign: 'center' }}>{playerCount}</span>
          <button className="btn" onClick={() => handlePlayerCountChange(playerCount + 1)}>+</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
          {names.map((name, i) => (
            <input
              key={i}
              type="text"
              placeholder={`Joueur ${i + 1}`}
              value={name}
              onChange={e => handleNameChange(i, e.target.value)}
              style={{ width: '100%' }}
            />
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          Rôles — {totalRoles} / {needed} requis
          {totalRoles !== needed && (
            <span style={{ color: 'var(--red)', marginLeft: '0.5rem', fontSize: '0.8rem' }}>
              ({totalRoles < needed ? `manque ${needed - totalRoles}` : `${totalRoles - needed} en trop`})
            </span>
          )}
        </div>

        {CONFIGURABLE_ROLES.map(config => {
          const role = ROLES[config.key]
          return (
            <div key={config.key} className="role-checkbox">
              <CardImage roleKey={config.key} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>{role.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{role.description}</div>
              </div>
              <span className={`role-badge ${role.team}`}>{role.team === 'red' ? 'Menace' : role.team === 'blue' ? 'Sécurité' : 'Support'}</span>
              <div className="role-count">
                <button onClick={() => handleRoleCount(config.key, -1)} disabled={roleCounts[config.key] <= config.min}>-</button>
                <span style={{ minWidth: '1.5rem', textAlign: 'center' }}>{roleCounts[config.key]}</span>
                <button onClick={() => handleRoleCount(config.key, 1)} disabled={roleCounts[config.key] >= config.max}>+</button>
              </div>
            </div>
          )
        })}
      </div>

      {error && <div style={{ color: 'var(--red)', marginBottom: '1rem', padding: '0.75rem', border: '1px solid var(--red)', borderRadius: '4px' }}>{error}</div>}

      <button className="btn btn-primary" onClick={handleDistribute} disabled={totalRoles !== needed}>
        Distribuer les Rôles
      </button>
    </div>
  )
}
