import { Validation } from '@/presentation/protocols'
import { ValidationSpy } from '@/tests/presentation/mocks'
import { ValidationComposite } from '@/validation/validators'

type SutTypes = {
  sut: ValidationComposite
  validationStubs: Validation[]
}

const makeSut = (): SutTypes => {
  const validationStubs = [
    new ValidationSpy(),
    new ValidationSpy()
  ]
  const sut = new ValidationComposite(validationStubs)
  return {
    sut,
    validationStubs
  }
}

describe('Validation Composite', () => {
  test('should return an error if any validation fails', () => {
    const { sut, validationStubs } = makeSut()
    jest.spyOn(validationStubs[0], 'validate').mockReturnValueOnce(new Error())
    const error = sut.validate({ field: 'any_value' })
    expect(error).toEqual(new Error())
  })

  test('should return the first error if more than one validation fails', () => {
    const { sut, validationStubs } = makeSut()
    jest.spyOn(validationStubs[0], 'validate').mockReturnValueOnce(new Error('First error'))
    jest.spyOn(validationStubs[1], 'validate').mockReturnValueOnce(new Error('Second error'))
    const error = sut.validate({ field: 'any_value' })
    expect(error).toEqual(new Error('First error'))
  })

  test('should not return if validation succeeds', () => {
    const { sut } = makeSut()
    const error = sut.validate({ field: 'any_value' })
    expect(error).toBeNull()
  })
})
