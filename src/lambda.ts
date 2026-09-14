import 'reflect-metadata'
import { configure as serverlessExpress } from '@codegenie/serverless-express'
import { NestFactory } from '@nestjs/core'
import type { Handler } from 'aws-lambda'
import type { Express } from 'express'
import { AppModule } from './app.module.js'
import { configureApp } from './bootstrap.js'

let cachedHandler: Handler | undefined

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] })
  configureApp(app)
  await app.init()

  const expressApp = app.getHttpAdapter().getInstance() as Express
  return serverlessExpress({ app: expressApp }) as Handler
}

export const handler: Handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  cachedHandler ??= await bootstrap()
  return cachedHandler(event, context, () => undefined)
}
