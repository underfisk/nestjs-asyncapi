import { Type } from '@nestjs/common'
import { createMethodDecorator } from './helpers'
import { DECORATORS } from '../constants'
import { MessageSchemaObjectHost } from './async-message.decorator'
import { AsyncApiOperation } from '../interfaces/async-api-operation.interface'
import { AsyncApiReferenceObject } from '../interfaces/async-api-reference-object.interface'
import { AsyncApiSchemaObject } from '../interfaces/async-api-schema-object.interface'

export interface MessageOneOf {
  oneOf: (AsyncApiSchemaObject | AsyncApiReferenceObject)[]
}

export class AsyncConsumerMetadata extends AsyncApiOperation<
  MessageOneOf | Type
> {}

export type AsyncConsumerOptions =
  | AsyncConsumerMetadata
  | MessageSchemaObjectHost

/**
 *
 * @param name
 * @see https://www.asyncapi.com/docs/specifications/2.0.0#definitionsConsumer
 * @constructor
 */
export function AsyncConsumer(
  channelName: string,
  options: AsyncConsumerOptions,
): MethodDecorator {
  return createMethodDecorator(DECORATORS.CONSUMER, {
    options,
    channelName,
  })
}
