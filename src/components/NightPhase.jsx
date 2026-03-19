import { useEffect, useState } from 'react'
import { ROLES } from '../constants/roles.js'
import { computeNightSteps } from '../utils/nightOrder.js'
import CardImage from './CardImage.jsx'

export default function NightPhase({ state, dispatch }) {
  const { players, night, turnNumber, centerCards, powers } = state
  const alivePlayers = players.filter(p => p.alive)

  useEffect(() => {
    const rolesInGame = [...new Set(players.map(p => p.role))]
    const hasAdmin = rolesInGame.includes('administrateur')
    const steps = computeNightSteps(rolesInGame, turnNumber, hasAdmin)
    dispatch({ type: 'SET_NIGHT_STEPS', steps })
  }, [turnNumber])

  const currentStep = night.steps[night.currentStepIndex]

  if (!currentStep) {
    return (
      <div className="app-content">
        <div className="phase-banner night">Nuit {turnNumber}</div>
        <p>Chargement des étapes...</p>
      </div>
    )
  }

  return (
    <div className="app-content">
      <div className="phase-banner night">Nuit {turnNumber} — Étape {night.currentStepIndex + 1}/{night.steps.length}</div>
      <NightStep
        step={currentStep}
        state={state}
        dispatch={dispatch}
        alivePlayers={alivePlayers}
      />
    </div>
  )
}

function NightStep({ step, state, dispatch, alivePlayers }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [selectedPlayer2, setSelectedPlayer2] = useState(null)
  const [selectedCenter, setSelectedCenter] = useState(null)
  const [stagiaireSpotted, setStagiaireSpotted] = useState(false)
  const [engineerAction, setEngineerAction] = useState(null) // 'fix' | 'countervirus' | 'pass'
  const [engineerTarget, setEngineerTarget] = useState(null)

  function handleConfirm() {
    switch (step.key) {
      case 'hackerInfiltre': {
        const infiltre = state.players.find(p => p.role === 'hackerInfiltre' && p.alive)
        if (infiltre && selectedCenter !== null) {
          dispatch({ type: 'HACKER_INFILTRE_SWAP', swap: true, playerId: infiltre.id, centerIndex: selectedCenter })
        }
        break
      }
      case 'administrateur': {
        if (selectedPlayer !== null && selectedPlayer2 !== null) {
          dispatch({ type: 'ADMIN_BIND', player1Id: selectedPlayer, player2Id: selectedPlayer2 })
        }
        break
      }
      case 'analyste': {
        if (selectedPlayer !== null) {
          dispatch({ type: 'ANALYSTE_SCAN', targetId: selectedPlayer })
        }
        break
      }
      case 'hackers': {
        if (selectedPlayer !== null) {
          dispatch({ type: 'HACKERS_CHOOSE_VICTIM', victimId: selectedPlayer, stagiaireSpotted })
        }
        break
      }
      case 'ingenieur': {
        if (engineerAction === 'fix') {
          dispatch({ type: 'ENGINEER_ACTION', actionType: 'fix' })
        } else if (engineerAction === 'countervirus' && engineerTarget !== null) {
          dispatch({ type: 'ENGINEER_ACTION', actionType: 'countervirus', targetId: engineerTarget })
        }
        break
      }
    }
    dispatch({ type: 'NEXT_NIGHT_STEP' })
  }

  function handleSkip() {
    dispatch({ type: 'NEXT_NIGHT_STEP' })
  }

  const roleForImage = step.key === 'hackers' ? 'hacker' :
    step.key === 'utilisateursLies' ? 'administrateur' : step.key

  return (
    <div className="card">
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        <CardImage roleKey={roleForImage} large />
        <div style={{ flex: 1 }}>
          <h3 style={{ color: 'var(--blue)', marginBottom: '0.5rem' }}>{step.name}</h3>
          <p style={{ color: 'var(--text-dim)', marginBottom: '1rem' }}>{step.instruction}</p>

          {/* Hacker Infiltré: show center cards */}
          {step.key === 'hackerInfiltre' && (
            <div>
              <p style={{ marginBottom: '0.5rem' }}>Cartes du centre :</p>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                {state.centerCards.map((card, i) => (
                  <div
                    key={i}
                    className={`player-btn ${selectedCenter === i ? 'selected' : ''}`}
                    onClick={() => setSelectedCenter(i)}
                    style={{ padding: '0.75rem' }}
                  >
                    <CardImage roleKey={card.role} />
                    <div style={{ marginTop: '0.25rem', fontSize: '0.8rem' }}>{ROLES[card.role]?.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin: select two players */}
          {step.key === 'administrateur' && (
            <div>
              <p style={{ marginBottom: '0.5rem' }}>Choisir deux joueurs à lier :</p>
              <div className="player-grid">
                {alivePlayers.map(p => (
                  <div
                    key={p.id}
                    className={`player-btn ${selectedPlayer === p.id || selectedPlayer2 === p.id ? 'selected' : ''}`}
                    onClick={() => {
                      if (selectedPlayer === p.id) { setSelectedPlayer(null); return }
                      if (selectedPlayer2 === p.id) { setSelectedPlayer2(null); return }
                      if (selectedPlayer === null) setSelectedPlayer(p.id)
                      else if (selectedPlayer2 === null) setSelectedPlayer2(p.id)
                    }}
                  >
                    {p.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Utilisateurs Liés: info only */}
          {step.key === 'utilisateursLies' && (
            <div>
              {state.players.filter(p => p.boundTo !== null).length > 0 ? (
                <div>
                  <p>Joueurs liés :</p>
                  {state.players.filter(p => p.boundTo !== null).map(p => (
                    <span key={p.id} style={{ color: 'var(--green-primary)', marginRight: '1rem' }}>
                      {p.name} ↔ {state.players.find(x => x.id === p.boundTo)?.name}
                    </span>
                  )).filter((_, i) => i % 2 === 0)}
                </div>
              ) : (
                <p>Aucun joueur lié.</p>
              )}
            </div>
          )}

          {/* Analyste: select one player */}
          {step.key === 'analyste' && (
            <div>
              <p style={{ marginBottom: '0.5rem' }}>Choisir un joueur à scanner :</p>
              <div className="player-grid">
                {alivePlayers.map(p => (
                  <div
                    key={p.id}
                    className={`player-btn ${selectedPlayer === p.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPlayer(p.id)}
                  >
                    {p.name}
                  </div>
                ))}
              </div>
              {state.night.analysteResult && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', border: '1px solid var(--blue)', borderRadius: '4px' }}>
                  Résultat : <strong style={{ color: 'var(--blue)' }}>{state.players.find(p => p.id === state.night.analysteResult.playerId)?.name}</strong> est <strong>{ROLES[state.night.analysteResult.role]?.name}</strong>
                </div>
              )}
            </div>
          )}

          {/* Hackers: select victim */}
          {step.key === 'hackers' && (
            <div>
              <p style={{ marginBottom: '0.5rem' }}>
                Hackers en jeu : {state.players.filter(p => ROLES[p.role]?.team === 'red' && p.alive).map(p => p.name).join(', ')}
              </p>
              <p style={{ marginBottom: '0.5rem' }}>Choisir la victime :</p>
              <div className="player-grid">
                {alivePlayers.filter(p => ROLES[p.role]?.team !== 'red').map(p => (
                  <div
                    key={p.id}
                    className={`player-btn ${selectedPlayer === p.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPlayer(p.id)}
                  >
                    {p.name}
                  </div>
                ))}
              </div>
              {state.players.some(p => p.role === 'stagiaire' && p.alive) && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={stagiaireSpotted} onChange={e => setStagiaireSpotted(e.target.checked)} />
                  La Stagiaire IT a été repérée
                </label>
              )}
            </div>
          )}

          {/* Ingénieure: fix / countervirus / pass */}
          {step.key === 'ingenieur' && (
            <div>
              {state.night.hackerVictimId !== null && (
                <p style={{ marginBottom: '0.75rem' }}>
                  Victime des Hackers cette nuit : <strong style={{ color: 'var(--red)' }}>
                    {state.players.find(p => p.id === state.night.hackerVictimId)?.name}
                  </strong>
                </p>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <button
                  className={`btn ${engineerAction === 'fix' ? 'btn-primary' : ''}`}
                  onClick={() => setEngineerAction('fix')}
                  disabled={state.powers.engineerFix}
                >
                  {state.powers.engineerFix ? 'Correctif (déjà utilisé)' : 'Correctif (sauver)'}
                </button>
                <button
                  className={`btn ${engineerAction === 'countervirus' ? 'btn-danger' : ''}`}
                  onClick={() => setEngineerAction('countervirus')}
                  disabled={state.powers.engineerCounterVirus}
                >
                  {state.powers.engineerCounterVirus ? 'Contre-virus (déjà utilisé)' : 'Contre-virus (éliminer)'}
                </button>
                <button
                  className={`btn ${engineerAction === 'pass' ? 'btn-blue' : ''}`}
                  onClick={() => setEngineerAction('pass')}
                >
                  Passer
                </button>
              </div>
              {engineerAction === 'countervirus' && (
                <div>
                  <p style={{ marginBottom: '0.5rem' }}>Choisir la cible du Contre-virus :</p>
                  <div className="player-grid">
                    {alivePlayers.map(p => (
                      <div
                        key={p.id}
                        className={`player-btn ${engineerTarget === p.id ? 'selected' : ''}`}
                        onClick={() => setEngineerTarget(p.id)}
                      >
                        {p.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
        <button className="btn" onClick={handleSkip}>Passer</button>
        <button className="btn btn-primary" onClick={handleConfirm}>Confirmer</button>
      </div>
    </div>
  )
}
