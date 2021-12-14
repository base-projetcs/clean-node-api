import { DbAddAccount } from '@/data/usecases'
import { AddAccountRepositorySpy, CheckAccountByEmailRepositorySpy, HasherSpy } from '@/tests/data/mocks'
import { mockAddAccountParams } from '@/tests/domain/mocks'

type SutTypes = {
  sut: DbAddAccount
  hasherSpy: HasherSpy
  addAccountRepositorySpy: AddAccountRepositorySpy
  checkAccountByEmailRepositorySpy: CheckAccountByEmailRepositorySpy
}

const makeSut = (): SutTypes => {
  const checkAccountByEmailRepositorySpy = new CheckAccountByEmailRepositorySpy()
  const hasherSpy = new HasherSpy()
  const addAccountRepositorySpy = new AddAccountRepositorySpy()
  const sut = new DbAddAccount(hasherSpy, addAccountRepositorySpy, checkAccountByEmailRepositorySpy)

  return { sut, hasherSpy, addAccountRepositorySpy, checkAccountByEmailRepositorySpy }
}

describe('DbAddAccount Usecase', () => {
  test('Should call Hasher with correct password', async () => {
    const { hasherSpy, sut } = makeSut()
    const params = mockAddAccountParams()
    await sut.add(params)
    expect(hasherSpy.plaintext).toBe(params.password)
  })

  test('Should throw if Hasher throws', async () => {
    const { hasherSpy, sut } = makeSut()
    jest.spyOn(hasherSpy, 'hash').mockReturnValueOnce(Promise.reject(new Error()))
    const promise = sut.add(mockAddAccountParams())
    await expect(promise).rejects.toThrow()
  })

  test('Should call AddAccountRepository with correct values', async () => {
    const { addAccountRepositorySpy, hasherSpy, sut } = makeSut()
    const params = mockAddAccountParams()
    await sut.add(params)
    expect(addAccountRepositorySpy.params).toEqual({
      name: params.name,
      email: params.email,
      password: hasherSpy.digest
    })
  })

  test('Should throw if AddAccountRepository throws', async () => {
    const { addAccountRepositorySpy, sut } = makeSut()
    jest.spyOn(addAccountRepositorySpy, 'add').mockReturnValueOnce(Promise.reject(new Error()))
    const promise = sut.add(mockAddAccountParams())
    await expect(promise).rejects.toThrow()
  })

  test('Should call CheckAccountByEmailRepository with correct email', async () => {
    const { sut, checkAccountByEmailRepositorySpy } = makeSut()
    const params = mockAddAccountParams()
    await sut.add(params)
    expect(checkAccountByEmailRepositorySpy.email).toBe(params.email)
  })

  test('Should return false if CheckAccountByEmailRepository returns true', async () => {
    const { sut, checkAccountByEmailRepositorySpy } = makeSut()
    checkAccountByEmailRepositorySpy.result = true
    const isValid = await sut.add(mockAddAccountParams())
    await expect(isValid).toBe(false)
  })

  test('Should return false if AddAccountRepository returns false', async () => {
    const { sut, addAccountRepositorySpy } = makeSut()
    addAccountRepositorySpy.result = false
    const isValid = await sut.add(mockAddAccountParams())
    await expect(isValid).toEqual(false)
  })

  test('Should return true on success', async () => {
    const { sut } = makeSut()
    const isValid = await sut.add(mockAddAccountParams())
    await expect(isValid).toEqual(true)
  })
})
