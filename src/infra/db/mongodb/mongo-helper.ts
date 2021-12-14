import { Collection, MongoClient } from 'mongodb'

export const MongoHelper = {

  client: null as unknown as MongoClient,

  async connect (uri: string): Promise<void> {
    this.client = await MongoClient.connect(uri)
  },

  async disconnect (): Promise<void> {
    await this.client.close()
  },

  getCollection (name: string): Collection {
    return this.client.db().collection(name)
  },

  map (data: any): any {
    const { _id, ...collectionWithoutId } = data
    return { ...collectionWithoutId, id: _id }
  },

  mapCollection (collection: any[]): any {
    return collection.map(data => MongoHelper.map(data))
  }

}
