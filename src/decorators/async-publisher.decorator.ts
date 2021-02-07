import { Type } from '@nestjs/common'
import { createMethodDecorator } from './helpers'
import { DECORATORS } from '../constants'

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
export function AsyncPublisher(
  channelName: string,
  payload: Type | Type[],
  metadata?: AsyncConsumerMetadata,
): MethodDecorator {
  return createMethodDecorator(DECORATORS.PUBLISHER, {
    payload,
    channelName,
    metadata,
  })
}
