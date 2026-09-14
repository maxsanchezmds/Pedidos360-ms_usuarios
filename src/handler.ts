import type { APIGatewayProxyHandler } from 'aws-lambda'
import { createApp } from './app'
import { getUserProfileRepository } from './config/database'

export const handler: APIGatewayProxyHandler = async (event) => {
  const app = createApp(getUserProfileRepository())
  return app(event)
}

