import { TEAMS, ROLES } from '../constants/roles.js'

export function checkWinCondition(players) {
  const alive = players.filter(p => p.alive)
  const aliveHackers = alive.filter(p => ROLES[p.role]?.team === TEAMS.RED)
  const aliveNonHackers = alive.filter(p => ROLES[p.role]?.team !== TEAMS.RED)

  if (aliveHackers.length === 0) {
    return 'employees'
  }

  if (aliveHackers.length >= aliveNonHackers.length) {
    return 'hackers'
  }

  return null
}
