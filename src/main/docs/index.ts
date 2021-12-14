import paths from './paths'
import components from './components'
import schemas from './schemas'
import tags from './tags'
export default {
  openapi: '3.0.0',
  info: {
    title: 'API',
    version: '1.0.0'
  },
  license: {
    name: 'GPL-3.0',
    url: 'https://opensource.org/licenses/GPL-3.0'
  },
  servers: [
    {
      url: '/api',
      description: 'Servidor Principal'
    }
  ],
  tags,
  paths,
  schemas,
  components
}
