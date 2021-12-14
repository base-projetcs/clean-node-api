import { badRequest } from './bad-request'
import { serverError } from './server-error'
import { unauthorized } from './unauthorized'
import { notFound } from './not-found'
import { forbidden } from './forbidden'
import { apiKeyAuth } from '../schemas/api-key-auth'
export default {
  securitySchemes: {
    apiKeyAuth
  },
  badRequest,
  serverError,
  unauthorized,
  notFound,
  forbidden
}
