import { Type } from '@nestjs/common'
import { createMethodDecorator, createMixedDecorator } from './helpers'
import { DECORATORS } from '../constants'
import { AsyncApiOperation } from '../interfaces/async-api-operation.interface'
import { AsyncApiReferenceObject } from '../interfaces/async-api-reference-object.interface'
import { AsyncApiSchemaObject } from '../interfaces/async-api-schema-object.interface'
import { AsyncApiOperationOptions } from '../interfaces/async-operation-options.interface'

export interface MessageOneOf {
  oneOf: (AsyncApiSchemaObject | AsyncApiReferenceObject)[]
}

/**
 *
 * @see https://www.asyncapi.com/docs/specifications/2.0.0#definitionsConsumer
 * @constructor
 * @param options
 */
export function AsyncConsumer(
  options: AsyncApiOperationOptions,
): MethodDecorator {
  return createMixedDecorator(DECORATORS.SUB, options)
}
