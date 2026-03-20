import { ROLES } from '../constants/roles.js'

export default function CardImage({ roleKey, large, className = '' }) {
  const role = ROLES[roleKey]
  if (!role || !role.image) return null

  return (
    <img
      className={`card-image ${large ? 'large' : ''} ${className}`}
      src={`/cartes/${role.image}`}
      alt={role.name}
    />
  )
}
