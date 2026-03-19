import { NIGHT_STEPS } from '../constants/roles.js'

export function computeNightSteps(rolesInGame, turnNumber, hasAdmin) {
  return NIGHT_STEPS.filter(step => {
    // Skip turn-1-only steps after turn 1
    if (step.turnOneOnly && turnNumber > 1) return false

    // Skip "utilisateursLies" if no admin in the game
    if (step.requiresAdmin && !hasAdmin) return false

    // Skip role-specific steps if that role isn't in the game
    if (step.key === 'hackerInfiltre' && !rolesInGame.includes('hackerInfiltre')) return false
    if (step.key === 'administrateur' && !rolesInGame.includes('administrateur')) return false
    if (step.key === 'analyste' && !rolesInGame.includes('analyste')) return false
    if (step.key === 'ingenieur' && !rolesInGame.includes('ingenieur')) return false
    // Hackers are always in the game
    if (step.key === 'hackers' && !rolesInGame.includes('hacker')) return false

    return true
  }).sort((a, b) => a.order - b.order)
}
