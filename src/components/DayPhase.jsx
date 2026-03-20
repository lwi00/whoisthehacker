import { useState, useEffect, useRef } from 'react'
import { ROLES } from '../constants/roles.js'
import CardImage from './CardImage.jsx'

export default function DayPhase({ state, dispatch }) {
  const { players, day, turnNumber, leaderId, pendingAgentRetaliation, agentPlayerId } = state
  const alivePlayers = players.filter(p => p.alive)
  const [phase, setPhase] = useState('announcement') // announcement | debate | vote | result
  const [processedEliminations, setProcessedEliminations] = useState(false)

  // Process night eliminations
  useEffect(() => {
    if (!processedEliminations && day.eliminatedThisNight.length > 0) {
      setProcessedEliminations(true)
    }
  }, [])

  function handleProcessEliminations() {
    for (const elim of day.eliminatedThisNight) {
      dispatch({ type: 'ELIMINATE_PLAYER', playerId: elim.id, reason: elim.reason })
    }
    setPhase('debate')
  }

  function handleNoEliminations() {
    setPhase('debate')
  }

  // Agent retaliation
  if (pendingAgentRetaliation) {
    return (
      <AgentRetaliation
        state={state}
        dispatch={dispatch}
        agentPlayerId={agentPlayerId}
      />
    )
  }

  // Check for leadership transfer
  if (leaderId !== null && !players.find(p => p.id === leaderId)?.alive && !state.winner) {
    return (
      <LeadershipTransfer state={state} dispatch={dispatch} />
    )
  }

  return (
    <div className="app-content">
      <div className="phase-banner day">Jour {turnNumber}</div>

      {phase === 'announcement' && (
        <div className="card">
          <div className="card-title">Rapport d'Incident</div>
          {day.eliminatedThisNight.length > 0 ? (
            <div>
              <p style={{ marginBottom: '1rem' }}>Joueurs éliminés cette nuit :</p>
              {day.eliminatedThisNight.map(elim => {
                const player = players.find(p => p.id === elim.id)
                return (
                  <div key={elim.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <CardImage roleKey={player.role} />
                    <div>
                      <div style={{ fontWeight: 'bold', color: 'var(--red)' }}>{player.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        {elim.reason === 'hacked' ? 'Piraté par les Hackers' : 'Éliminé par le Contre-virus'}
                      </div>
                      <span className={`role-badge ${ROLES[player.role]?.team}`}>{ROLES[player.role]?.name}</span>
                    </div>
                  </div>
                )
              })}
              <button className="btn btn-primary" onClick={handleProcessEliminations} style={{ marginTop: '1rem' }}>
                Confirmer les éliminations
              </button>
            </div>
          ) : (
            <div>
              <p>Personne n'a été éliminé cette nuit.</p>
              <button className="btn btn-primary" onClick={handleNoEliminations} style={{ marginTop: '1rem' }}>
                Passer au débat
              </button>
            </div>
          )}
        </div>
      )}

      {phase === 'debate' && (
        <div>
          <DebateTimer />
          <button className="btn btn-primary" onClick={() => setPhase('vote')} style={{ marginTop: '1rem' }}>
            Passer au vote
          </button>
        </div>
      )}

      {phase === 'vote' && (
        <VoteTracker
          state={state}
          dispatch={dispatch}
          onComplete={() => setPhase('result')}
        />
      )}

      {phase === 'result' && (
        <VoteResult state={state} dispatch={dispatch} />
      )}
    </div>
  )
}

function DebateTimer() {
  const [timeLeft, setTimeLeft] = useState(300)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setRunning(false)
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="card">
      <div className="card-title">Débat</div>
      <div className={`timer ${timeLeft < 60 ? 'warning' : ''}`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={() => setRunning(!running)}>
          {running ? 'Pause' : 'Démarrer'}
        </button>
        <button className="btn" onClick={() => { setRunning(false); setTimeLeft(300) }}>
          Réinitialiser
        </button>
      </div>
    </div>
  )
}

function VoteTracker({ state, dispatch, onComplete }) {
  const { players, day, leaderId } = state
  const alivePlayers = players.filter(p => p.alive)
  const [currentVoter, setCurrentVoter] = useState(0)

  const aliveVoters = alivePlayers.map(p => p.id)
  const voterId = aliveVoters[currentVoter]
  const voter = players.find(p => p.id === voterId)
  const allVoted = Object.keys(day.votes).length === alivePlayers.length

  function handleVote(targetId) {
    dispatch({ type: 'CAST_VOTE', voterId, targetId })
    if (currentVoter + 1 < alivePlayers.length) {
      setCurrentVoter(currentVoter + 1)
    }
  }

  function handleResolve() {
    dispatch({ type: 'RESOLVE_VOTE' })
    onComplete()
  }

  return (
    <div className="card">
      <div className="card-title">Vote</div>

      {!allVoted && voter && (
        <div>
          <p style={{ marginBottom: '0.75rem' }}>
            <strong style={{ color: 'var(--green-primary)' }}>{voter.name}</strong> vote
            {voterId === leaderId && <span style={{ color: 'var(--blue)' }}> (Responsable — vote double)</span>}
            {' '}({currentVoter + 1}/{alivePlayers.length})
          </p>
          <div className="player-grid">
            {alivePlayers.filter(p => p.id !== voterId).map(p => (
              <div
                key={p.id}
                className="player-btn"
                onClick={() => handleVote(p.id)}
              >
                {p.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {allVoted && (
        <div>
          <p style={{ marginBottom: '0.75rem' }}>Tous les votes sont enregistrés.</p>
          <div style={{ marginBottom: '1rem' }}>
            {Object.entries(day.votes).map(([vid, tid]) => {
              const v = players.find(p => p.id === Number(vid))
              const t = players.find(p => p.id === Number(tid))
              return (
                <div key={vid} style={{ fontSize: '0.85rem', padding: '0.2rem 0' }}>
                  {v?.name} → {t?.name} {Number(vid) === leaderId && '(×2)'}
                </div>
              )
            })}
          </div>
          <button className="btn btn-danger" onClick={handleResolve}>
            Résoudre le vote
          </button>
        </div>
      )}
    </div>
  )
}

function VoteResult({ state, dispatch }) {
  const { day, players } = state

  if (!day.voteResolved || day.votedOutId === null) {
    return (
      <div className="card">
        <p>Aucune majorité. Le Responsable tranche.</p>
        <button className="btn btn-primary" onClick={() => dispatch({ type: 'START_NIGHT' })} style={{ marginTop: '1rem' }}>
          Passer à la nuit
        </button>
      </div>
    )
  }

  const votedOut = players.find(p => p.id === day.votedOutId)
  const isAlive = votedOut?.alive

  function handleEliminate() {
    dispatch({ type: 'ELIMINATE_PLAYER', playerId: day.votedOutId, reason: 'voted' })
  }

  return (
    <div className="card">
      <div className="card-title">Résultat du Vote</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
        <CardImage roleKey={votedOut.role} large />
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--red)' }}>{votedOut.name}</div>
          <div style={{ marginTop: '0.25rem' }}>
            <span className={`role-badge ${ROLES[votedOut.role]?.team}`}>{ROLES[votedOut.role]?.name}</span>
          </div>
        </div>
      </div>
      {isAlive ? (
        <button className="btn btn-danger" onClick={handleEliminate}>
          Confirmer l'élimination
        </button>
      ) : (
        <button className="btn btn-primary" onClick={() => dispatch({ type: 'START_NIGHT' })}>
          Passer à la nuit suivante
        </button>
      )}
    </div>
  )
}

function AgentRetaliation({ state, dispatch, agentPlayerId }) {
  const [target, setTarget] = useState(null)
  const agent = state.players.find(p => p.id === agentPlayerId)
  const alivePlayers = state.players.filter(p => p.alive && p.id !== agentPlayerId)

  function handleRetaliate() {
    if (target !== null) {
      dispatch({ type: 'AGENT_RETALIATION', targetId: target })
    }
  }

  return (
    <div className="app-content">
      <div className="card">
        <div className="card-title" style={{ color: 'var(--red)' }}>Agent de Cybersécurité — Rétorsion</div>
        <p style={{ marginBottom: '1rem' }}>
          <strong>{agent?.name}</strong> (Agent de Cybersécurité) a été éliminé. Il choisit un joueur à neutraliser.
        </p>
        <div className="player-grid">
          {alivePlayers.map(p => (
            <div
              key={p.id}
              className={`player-btn ${target === p.id ? 'selected' : ''}`}
              onClick={() => setTarget(p.id)}
            >
              {p.name}
            </div>
          ))}
        </div>
        <button className="btn btn-danger" onClick={handleRetaliate} disabled={target === null} style={{ marginTop: '1rem' }}>
          Confirmer la neutralisation
        </button>
      </div>
    </div>
  )
}

function LeadershipTransfer({ state, dispatch }) {
  const [target, setTarget] = useState(null)
  const alivePlayers = state.players.filter(p => p.alive)

  return (
    <div className="app-content">
      <div className="card">
        <div className="card-title">Succession du Responsable</div>
        <p style={{ marginBottom: '1rem' }}>Le Responsable a été éliminé. Il désigne son successeur.</p>
        <div className="player-grid">
          {alivePlayers.map(p => (
            <div
              key={p.id}
              className={`player-btn ${target === p.id ? 'selected' : ''}`}
              onClick={() => setTarget(p.id)}
            >
              {p.name}
            </div>
          ))}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => dispatch({ type: 'TRANSFER_LEADERSHIP', playerId: target })}
          disabled={target === null}
          style={{ marginTop: '1rem' }}
        >
          Confirmer le successeur
        </button>
      </div>
    </div>
  )
}
