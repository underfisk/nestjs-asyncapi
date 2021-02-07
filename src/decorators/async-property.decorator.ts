import { createPropertyDecorator } from './helpers'
import { DECORATORS } from '../constants'
import { Type } from '@nestjs/common'

interface AsyncPropertyMetadata {
  description?: string
  type: Type
  format?: string
  required?: string[]
}

/**
 * Decorates a model property to be included in async api documentation
 * (If the property is not decorated, it will not be included)
 * @param metadata
 * @constructor
 */
export function AsyncProperty(
  metadata: AsyncPropertyMetadata,
): PropertyDecorator {
  return createPropertyDecorator(DECORATORS.API_MODEL_PROPERTIES, metadata)
}
