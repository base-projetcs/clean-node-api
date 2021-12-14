import { Decrypter, Encrypter, HashComparer, Hasher } from '@/data/protocols'
import faker from 'faker'

export class HasherSpy implements Hasher {
  digest = faker.datatype.uuid()
  plaintext: string

  async hash (plaintext: string): Promise<string> {
    this.plaintext = plaintext
    return await Promise.resolve(this.digest)
  }
}

export class DecrypterSpy implements Decrypter {
  plaintext = faker.internet.password()
  ciphertext: string

  async decrypt (ciphertext: string): Promise<string> {
    this.ciphertext = ciphertext
    return await Promise.resolve(this.plaintext)
  }
}

export class EncrypterSpy implements Encrypter {
  plaintext: string
  ciphertext= faker.datatype.uuid()

  async encrypt (plaintext: string): Promise<string> {
    this.plaintext = plaintext
    return this.ciphertext
  }
}

export class HashComparerSpy implements HashComparer {
  plaintext: string
  digest: string
  isValid: boolean = true

  async compare (plaintext: string, digest: string): Promise<boolean> {
    this.plaintext = plaintext
    this.digest = digest
    return await Promise.resolve(this.isValid)
  }
}
