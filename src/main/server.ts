import 'module-alias/register'

import { MongoHelper } from '@/infra/db'

import env from './config/env'

MongoHelper.connect(env.mongoUrl)
  .then(async () => {
    const { setupApp } = (await import('./config/app'))
    const app = await setupApp()
    app.listen(env.port, () => { console.log(`listening on port ${env.port}`) })
  })
  .catch(console.error)
