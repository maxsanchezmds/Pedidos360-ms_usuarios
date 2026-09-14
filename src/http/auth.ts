import type { APIGatewayProxyEvent } from 'aws-lambda'

export interface AuthenticatedUser {
  userId: string
  groups: string[]
}

function groupsFromClaim(claim: unknown) {
  if (Array.isArray(claim)) {
    return claim.filter((group): group is string => typeof group === 'string')
  }

  if (typeof claim === 'string') {
    return claim.split(',').map((group) => group.trim()).filter(Boolean)
  }

  return []
}

export function authenticatedUser(event: APIGatewayProxyEvent): AuthenticatedUser | null {
  const claims = event.requestContext.authorizer?.claims
  const userId = claims?.sub

  if (typeof userId !== 'string' || !userId) return null

  return {
    userId,
    groups: groupsFromClaim(claims['cognito:groups']),
  }
}

