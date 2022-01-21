import { Type } from '@nestjs/common'
import { createMethodDecorator, createMixedDecorator } from './helpers'
import { DECORATORS } from '../constants'
import { AsyncApiOperationOptions } from '../interfaces/async-operation-options.interface'

export class AsyncBaseMessage {
  description?: string
  /** @default true **/
  additionalProperties?: boolean
}

export class AsyncConsumerMetadata extends AsyncBaseMessage {}

/**
 *
 * @param name
 * @see https://www.asyncapi.com/docs/specifications/2.0.0#definitionsConsumer
 * @constructor
 */
/*
export function AsyncPublisher(
  payload: Type | Type[],
  metadata?: AsyncConsumerMetadata,
): MethodDecorator {
  return createMethodDecorator(DECORATORS.PUBLISHER, {
    payload,
    metadata,
  })
}
*/

export function AsyncPublisher(
  options: AsyncApiOperationOptions,
): MethodDecorator {
  return createMixedDecorator(DECORATORS.PUB, options)
}
