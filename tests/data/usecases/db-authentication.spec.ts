import { DbAuthentication } from '@/data/usecases'
import { EncrypterSpy, HashComparerSpy, LoadAccountByEmailRepositorySpy, UpdateAccessTokenRepositorySpy } from '@/tests/data/mocks'
import { mockAuthenticationParams } from '@/tests/domain/mocks'

type SutTypes = {
  sut: DbAuthentication
  loadAccountByEmailRepositorySpy: LoadAccountByEmailRepositorySpy
  hashComparerSpy: HashComparerSpy
  tokenGeneratorSpy: EncrypterSpy
  updateAccessTokenRepositorySpy: UpdateAccessTokenRepositorySpy
}

const makeSut = (): SutTypes => {
  const loadAccountByEmailRepositorySpy = new LoadAccountByEmailRepositorySpy()
  const hashComparerSpy = new HashComparerSpy()
  const tokenGeneratorSpy = new EncrypterSpy()
  const updateAccessTokenRepositorySpy = new UpdateAccessTokenRepositorySpy()
  const sut = new DbAuthentication(
    loadAccountByEmailRepositorySpy,
    hashComparerSpy,
    tokenGeneratorSpy,
    updateAccessTokenRepositorySpy
  )
  return {
    sut,
    loadAccountByEmailRepositorySpy,
    hashComparerSpy,
    tokenGeneratorSpy,
    updateAccessTokenRepositorySpy
  }
}

describe('DbAuthentication UseCase', () => {
  test('Should call LoadAccountByEmailRepository with correct email', async () => {
    const { sut, loadAccountByEmailRepositorySpy } = makeSut()
    const params = mockAuthenticationParams()
    await sut.auth(params)
    expect(loadAccountByEmailRepositorySpy.email).toBe(params.email)
  })

  test('Should throw if LoadAccountByEmailRepository throws', async () => {
    const { sut, loadAccountByEmailRepositorySpy } = makeSut()
    jest.spyOn(loadAccountByEmailRepositorySpy, 'loadByEmail').mockReturnValueOnce(Promise.reject(new Error()))
    const promise = sut.auth(mockAuthenticationParams())
    await expect(promise).rejects.toThrow()
  })

  test('Should return null if LoadAccountByEmailRepository returns null', async () => {
    const { sut, loadAccountByEmailRepositorySpy } = makeSut()
    loadAccountByEmailRepositorySpy.result = null
    const authenticationModel = await sut.auth(mockAuthenticationParams())
    expect(authenticationModel).toBeNull()
  })

  test('Should call HashComparer with correct values', async () => {
    const { sut, hashComparerSpy, loadAccountByEmailRepositorySpy } = makeSut()
    const params = mockAuthenticationParams()
    await sut.auth(params)
    expect(hashComparerSpy.plaintext).toBe(params.password)
    expect(hashComparerSpy.digest).toBe(loadAccountByEmailRepositorySpy.result.password)
  })

  test('Should throw if HashComparer throws', async () => {
    const { sut, hashComparerSpy } = makeSut()
    jest.spyOn(hashComparerSpy, 'compare').mockReturnValueOnce(Promise.reject(new Error()))
    const promise = sut.auth(mockAuthenticationParams())
    await expect(promise).rejects.toThrow()
  })

  test('Should return null if HashComparer returns false', async () => {
    const { sut, hashComparerSpy } = makeSut()
    hashComparerSpy.isValid = false
    const authenticationModel = await sut.auth(mockAuthenticationParams())
    expect(authenticationModel).toBeNull()
  })

  test('Should call Encrypter with correct id', async () => {
    const { sut, tokenGeneratorSpy, loadAccountByEmailRepositorySpy } = makeSut()
    await sut.auth(mockAuthenticationParams())
    expect(tokenGeneratorSpy.plaintext).toBe(loadAccountByEmailRepositorySpy.result.id)
  })

  test('Should return any token on success', async () => {
    const { sut, tokenGeneratorSpy, loadAccountByEmailRepositorySpy } = makeSut()
    const authenticationModel = await sut.auth(mockAuthenticationParams())
    expect(authenticationModel.accessToken).toBe(tokenGeneratorSpy.ciphertext)
    expect(authenticationModel.name).toBe(loadAccountByEmailRepositorySpy.result.name)
  })

  test('Should call UpdateAccessTokenRepository with correct values', async () => {
    const { sut, updateAccessTokenRepositorySpy, loadAccountByEmailRepositorySpy, tokenGeneratorSpy } = makeSut()
    await sut.auth(mockAuthenticationParams())
    expect(updateAccessTokenRepositorySpy.id).toBe(loadAccountByEmailRepositorySpy.result.id)
    expect(updateAccessTokenRepositorySpy.token).toBe(tokenGeneratorSpy.ciphertext)
  })

  test('Should throw if UpdateAccessTokenRepository throws', async () => {
    const { sut, updateAccessTokenRepositorySpy } = makeSut()
    jest.spyOn(updateAccessTokenRepositorySpy, 'updateAccessToken').mockReturnValueOnce(Promise.reject(new Error()))
    const promise = sut.auth(mockAuthenticationParams())
    await expect(promise).rejects.toThrow()
  })
})
