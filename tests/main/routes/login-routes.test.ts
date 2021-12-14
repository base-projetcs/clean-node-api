import { MongoHelper } from '@/infra/db'
import { setupApp } from '@/main/config/app'
import { hash } from 'bcrypt'
import { Express } from 'express'
import { Collection } from 'mongodb'
import request from 'supertest'

let app: Express
let accountCollection: Collection

describe('Login Routes', () => {
  beforeAll(async () => {
    app = await setupApp()
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    accountCollection = MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  describe('POST /signup', () => {
    test('Should return 200 on signup', async () => {
      await request(app)
        .post('/api/signup')
        .send({
          name: 'Ledes',
          email: 'ledes@gmail.com',
          password: '123',
          passwordConfirmation: '123'
        })
        .expect(200)
    })
  })

  describe('POST /login', () => {
    test('Should return 200 on login', async () => {
      const password = await hash('123', 12)
      await accountCollection.insertOne({
        name: 'Ledes',
        email: 'ledes@gmail.com',
        password
      })
      await request(app)
        .post('/api/login')
        .send({
          email: 'ledes@gmail.com',
          password: '123'
        })
        .expect(200)
    })

    test('Should return 401 on login', async () => {
      await request(app)
        .post('/api/login')
        .send({
          email: 'ledes@gmail.com',
          password: '123'
        })
        .expect(401)
    })
  })
})
