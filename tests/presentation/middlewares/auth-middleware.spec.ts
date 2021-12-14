import { AccessDeniedError } from '@/presentation/errors'
import { forbidden, ok, serverError } from '@/presentation/helper'
import { AuthMiddleware } from '@/presentation/middlewares'
import { HttpResponse } from '@/presentation/protocols'
import { LoadAccountByTokenSpy } from '@/tests/presentation/mocks'
import faker from 'faker'

type SutTypes = {
  sut: AuthMiddleware
  loadAccountByTokenSpy: LoadAccountByTokenSpy
}

const makeSut = (role?: string): SutTypes => {
  const loadAccountByTokenSpy = new LoadAccountByTokenSpy()
  const sut = new AuthMiddleware(loadAccountByTokenSpy, role)
  return {
    sut,
    loadAccountByTokenSpy
  }
}

const mockRequest = (): AuthMiddleware.Request => ({
  accessToken: faker.internet.password()
})

describe('AuthMiddleware', () => {
  test('Should return 403 if no x-access-token exists in headers', async () => {
    const { sut } = makeSut()
    const httpResponse: HttpResponse = await sut.handle({})
    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
  })

  test('Should call LoadAccountByToken with correct values', async () => {
    const role = 'any_role'
    const { sut, loadAccountByTokenSpy } = makeSut(role)
    const request = mockRequest()
    await sut.handle(request)
    expect(loadAccountByTokenSpy.accessToken).toBe(request.accessToken)
    expect(loadAccountByTokenSpy.role).toBe(role)
  })

  test('Should return 403 if LoadAccountByToken returns null', async () => {
    const { sut, loadAccountByTokenSpy } = makeSut()
    loadAccountByTokenSpy.result = null
    const request = mockRequest()
    const httpResponse: HttpResponse = await sut.handle(request)
    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
  })

  test('Should return 200 if LoadAccountByToken returns an account', async () => {
    const { sut, loadAccountByTokenSpy } = makeSut()
    const request = mockRequest()
    const httpResponse: HttpResponse = await sut.handle(request)
    expect(httpResponse).toEqual(ok({ accountId: loadAccountByTokenSpy.result.id }))
  })

  test('Should return 500 if LoadAccountByToken throws', async () => {
    const { sut, loadAccountByTokenSpy } = makeSut()
    jest.spyOn(loadAccountByTokenSpy, 'load').mockReturnValueOnce(Promise.reject(new Error()))
    const request = mockRequest()
    const httpResponse: HttpResponse = await sut.handle(request)
    expect(httpResponse).toEqual(serverError(new Error()))
  })
})
