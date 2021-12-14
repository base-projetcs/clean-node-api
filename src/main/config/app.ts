import setupMiddlewares from '@/main/config/middlewares'
import setupRoutes from '@/main/config/routes'
import setupSwagger from '@/main/config/swagger'
import { setupApolloServer } from '@/main/graphql/apollo'
import express, { Express } from 'express'

export const setupApp = async (): Promise<Express> => {
  const app = express()
  setupSwagger(app)
  setupMiddlewares(app)
  setupRoutes(app)
  const apollo = setupApolloServer()
  await apollo.start()
  apollo.applyMiddleware({ app })
  return app
}
