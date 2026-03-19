import { ROLES, TEAMS } from '../constants/roles.js'
import { checkWinCondition } from '../utils/winCondition.js'

export const initialState = {
  screen: 'setup', // setup | reveal | night | day | gameover
  turnNumber: 1,
  players: [],
  centerCards: [],
  leaderId: null,

  powers: {
    engineerFix: false,
    engineerCounterVirus: false,
  },

  night: {
    currentStepIndex: 0,
    steps: [],
    hackerVictimId: null,
    engineerSaveUsed: false,
    engineerKillId: null,
    analysteResult: null,
    stagiaireSpotted: false,
  },

  day: {
    eliminatedThisNight: [],
    votes: {},
    debateTimeLeft: 300,
    debateRunning: false,
    voteResolved: false,
    votedOutId: null,
  },

  pendingAgentRetaliation: false,
  agentPlayerId: null,

  log: [],
  winner: null,
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_PLAYERS': {
      return { ...state, players: action.players, centerCards: action.centerCards }
    }

    case 'SET_LEADER': {
      return { ...state, leaderId: action.playerId }
    }

    case 'START_GAME': {
      return { ...state, screen: 'night' }
    }

    case 'SET_NIGHT_STEPS': {
      return {
        ...state,
        night: { ...initialState.night, steps: action.steps },
      }
    }

    case 'NEXT_NIGHT_STEP': {
      const nextIndex = state.night.currentStepIndex + 1
      if (nextIndex >= state.night.steps.length) {
        return resolveNight(state)
      }
      return {
        ...state,
        night: { ...state.night, currentStepIndex: nextIndex },
      }
    }

    case 'HACKER_INFILTRE_SWAP': {
      if (!action.swap) return state
      const { playerId, centerIndex } = action
      const player = state.players.find(p => p.id === playerId)
      const newPlayers = state.players.map(p =>
        p.id === playerId ? { ...p, role: state.centerCards[centerIndex].role } : p
      )
      const newCenter = state.centerCards.map((c, i) =>
        i === centerIndex ? { role: player.role } : c
      )
      return {
        ...state,
        players: newPlayers,
        centerCards: newCenter,
        log: [...state.log, { turn: state.turnNumber, phase: 'night', action: 'infiltre_swap', playerId, newRole: state.centerCards[centerIndex].role }],
      }
    }

    case 'ADMIN_BIND': {
      const { player1Id, player2Id } = action
      const newPlayers = state.players.map(p => {
        if (p.id === player1Id) return { ...p, boundTo: player2Id }
        if (p.id === player2Id) return { ...p, boundTo: player1Id }
        return p
      })
      return {
        ...state,
        players: newPlayers,
        log: [...state.log, { turn: state.turnNumber, phase: 'night', action: 'admin_bind', player1Id, player2Id }],
      }
    }

    case 'ANALYSTE_SCAN': {
      const target = state.players.find(p => p.id === action.targetId)
      return {
        ...state,
        night: { ...state.night, analysteResult: { playerId: action.targetId, role: target.role } },
        log: [...state.log, { turn: state.turnNumber, phase: 'night', action: 'analyste_scan', targetId: action.targetId, role: target.role }],
      }
    }

    case 'HACKERS_CHOOSE_VICTIM': {
      return {
        ...state,
        night: { ...state.night, hackerVictimId: action.victimId, stagiaireSpotted: action.stagiaireSpotted || false },
        log: [...state.log, { turn: state.turnNumber, phase: 'night', action: 'hackers_choose', victimId: action.victimId }],
      }
    }

    case 'ENGINEER_ACTION': {
      const { actionType, targetId } = action
      if (actionType === 'fix') {
        return {
          ...state,
          night: { ...state.night, engineerSaveUsed: true },
          powers: { ...state.powers, engineerFix: true },
          log: [...state.log, { turn: state.turnNumber, phase: 'night', action: 'engineer_fix' }],
        }
      }
      if (actionType === 'countervirus') {
        return {
          ...state,
          night: { ...state.night, engineerKillId: targetId },
          powers: { ...state.powers, engineerCounterVirus: true },
          log: [...state.log, { turn: state.turnNumber, phase: 'night', action: 'engineer_countervirus', targetId }],
        }
      }
      return state
    }

    case 'START_DAY': {
      return {
        ...state,
        screen: 'day',
        day: {
          ...initialState.day,
          eliminatedThisNight: action.eliminated,
        },
      }
    }

    case 'SET_DEBATE_TIMER': {
      return { ...state, day: { ...state.day, debateTimeLeft: action.time } }
    }

    case 'TOGGLE_DEBATE_TIMER': {
      return { ...state, day: { ...state.day, debateRunning: !state.day.debateRunning } }
    }

    case 'CAST_VOTE': {
      return {
        ...state,
        day: { ...state.day, votes: { ...state.day.votes, [action.voterId]: action.targetId } },
      }
    }

    case 'RESOLVE_VOTE': {
      const { votes } = state.day
      const tally = {}
      for (const [voterId, targetId] of Object.entries(votes)) {
        const weight = Number(voterId) === state.leaderId ? 2 : 1
        tally[targetId] = (tally[targetId] || 0) + weight
      }

      let maxVotes = 0
      let votedOutId = null
      let tie = false
      for (const [id, count] of Object.entries(tally)) {
        if (count > maxVotes) {
          maxVotes = count
          votedOutId = Number(id)
          tie = false
        } else if (count === maxVotes) {
          tie = true
        }
      }

      // If tie, leader decides (already has double vote, so the GM should handle this)
      // For simplicity, we pick the one with most votes (leader's double breaks most ties)
      return {
        ...state,
        day: { ...state.day, voteResolved: true, votedOutId },
        log: [...state.log, { turn: state.turnNumber, phase: 'day', action: 'vote', votedOutId, tally }],
      }
    }

    case 'ELIMINATE_PLAYER': {
      const { playerId, reason } = action
      let newPlayers = state.players.map(p =>
        p.id === playerId ? { ...p, alive: false } : p
      )

      const eliminated = [playerId]
      const victim = state.players.find(p => p.id === playerId)

      // Check bound player
      if (victim.boundTo !== null) {
        const bound = newPlayers.find(p => p.id === victim.boundTo)
        if (bound && bound.alive) {
          newPlayers = newPlayers.map(p =>
            p.id === bound.id ? { ...p, alive: false } : p
          )
          eliminated.push(bound.id)
        }
      }

      // Check if agent was eliminated
      const isAgent = victim.role === 'agent'
      const boundWasAgent = victim.boundTo !== null &&
        state.players.find(p => p.id === victim.boundTo)?.role === 'agent'

      let pendingAgent = false
      let agentId = null
      if (isAgent) {
        pendingAgent = true
        agentId = playerId
      } else if (boundWasAgent) {
        const boundPlayer = state.players.find(p => p.id === victim.boundTo)
        if (boundPlayer.alive) {
          pendingAgent = true
          agentId = boundPlayer.id
        }
      }

      // Transfer leadership if leader was killed
      let leaderId = state.leaderId
      if (eliminated.includes(leaderId)) {
        leaderId = null // Will need manual transfer
      }

      const newState = {
        ...state,
        players: newPlayers,
        leaderId,
        pendingAgentRetaliation: pendingAgent,
        agentPlayerId: agentId,
        log: [...state.log, { turn: state.turnNumber, phase: state.screen, action: 'eliminate', playerId, reason, eliminated }],
      }

      if (!pendingAgent) {
        const winner = checkWinCondition(newPlayers)
        if (winner) {
          return { ...newState, winner, screen: 'gameover' }
        }
      }

      return newState
    }

    case 'AGENT_RETALIATION': {
      let newPlayers = state.players.map(p =>
        p.id === action.targetId ? { ...p, alive: false } : p
      )

      // Check bound player of agent's target
      const target = state.players.find(p => p.id === action.targetId)
      if (target.boundTo !== null) {
        const bound = newPlayers.find(p => p.id === target.boundTo)
        if (bound && bound.alive) {
          newPlayers = newPlayers.map(p =>
            p.id === bound.id ? { ...p, alive: false } : p
          )
        }
      }

      const newState = {
        ...state,
        players: newPlayers,
        pendingAgentRetaliation: false,
        agentPlayerId: null,
        log: [...state.log, { turn: state.turnNumber, action: 'agent_retaliation', targetId: action.targetId }],
      }

      const winner = checkWinCondition(newPlayers)
      if (winner) {
        return { ...newState, winner, screen: 'gameover' }
      }
      return newState
    }

    case 'TRANSFER_LEADERSHIP': {
      return { ...state, leaderId: action.playerId }
    }

    case 'START_NIGHT': {
      return {
        ...state,
        screen: 'night',
        turnNumber: state.turnNumber + 1,
      }
    }

    case 'GO_TO_REVEAL': {
      return { ...state, screen: 'reveal' }
    }

    case 'RESET_GAME': {
      return { ...initialState }
    }

    default:
      return state
  }
}

function resolveNight(state) {
  const eliminated = []
  let newPlayers = [...state.players]

  // Hacker victim
  let hackerVictimId = state.night.hackerVictimId

  // Stagiaire spotted => she dies instead
  if (state.night.stagiaireSpotted) {
    const stagiaire = newPlayers.find(p => p.role === 'stagiaire' && p.alive)
    if (stagiaire) {
      hackerVictimId = stagiaire.id
    }
  }

  // Engineer fix saves victim
  const saved = state.night.engineerSaveUsed && hackerVictimId !== null

  if (hackerVictimId !== null && !saved) {
    eliminated.push({ id: hackerVictimId, reason: 'hacked' })
  }

  // Engineer countervirus
  if (state.night.engineerKillId !== null) {
    eliminated.push({ id: state.night.engineerKillId, reason: 'countervirus' })
  }

  return {
    ...state,
    screen: 'day',
    day: {
      ...initialState.day,
      eliminatedThisNight: eliminated,
    },
  }
}
