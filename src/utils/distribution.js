export function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function distributeRoles(playerNames, selectedRoles) {
  // selectedRoles is an array of role keys, length = playerNames.length + 2
  const shuffled = shuffleArray(selectedRoles)
  const playerRoles = shuffled.slice(0, playerNames.length)
  const centerCards = shuffled.slice(playerNames.length)

  const players = playerNames.map((name, i) => ({
    id: i,
    name,
    role: playerRoles[i],
    alive: true,
    boundTo: null,
  }))

  return { players, centerCards: centerCards.map(role => ({ role })) }
}
