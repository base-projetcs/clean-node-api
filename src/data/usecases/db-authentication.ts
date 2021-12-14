import { Encrypter, HashComparer, LoadAccountByEmailRepository, UpdateAccessTokenRepository } from '@/data/protocols'
import { Authentication } from '@/domain/usecases'

export class DbAuthentication implements Authentication {
  constructor (
    private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository,
    private readonly hashComparer: HashComparer,
    private readonly tokenGenerator: Encrypter,
    private readonly updateAccessTokenRepository: UpdateAccessTokenRepository
  ) {}

  async auth (authentication: Authentication.Params): Promise<Authentication.Result> {
    const account = await this.loadAccountByEmailRepository.loadByEmail(authentication.email)
    if (account) {
      const isCorrectPassword = await this.hashComparer.compare(authentication.password, account.password)
      if (isCorrectPassword) {
        const accessToken = await this.tokenGenerator.encrypt(account.id)
        await this.updateAccessTokenRepository.updateAccessToken(account.id, accessToken)
        const { name } = account
        return { accessToken, name }
      }
    }

    return null
  }
}
