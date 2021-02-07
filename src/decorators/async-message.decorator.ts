import { AsyncApiMessageMetadata } from '../interfaces/async-api-message-metadata.interface'
import { createClassDecorator } from './helpers'
import { DECORATORS } from '../constants'
import { PickType } from '@nestjs/mapped-types'
import { AsyncApiSchemaObject } from '../interfaces/async-api-schema-object.interface'

export class MessageSchemaObjectHost extends PickType(AsyncApiMessageMetadata, [
  'summary',
  'title',
  'name',
  'description',
  'contentType',
  'schemaFormat',
  'correlationId',
]) {
  schema: AsyncApiSchemaObject
}

export type AsyncMessageOptions =
  | AsyncApiMessageMetadata
  | MessageSchemaObjectHost

/**
 * Decorates a class indicating that it is a message payload and all its fields are properties out of it
 * If you pass a SchemaObject rather then a message it will ignore the fields and use directly your schema configuration
 * @see https://www.asyncapi.com/docs/specifications/2.0.0#definitionsMessage
 * @constructor
 * @param options
 */
export function AsyncMessage(
  options?: AsyncMessageOptions,
  additionalProperties = true,
): ClassDecorator {
  return createClassDecorator(DECORATORS.MESSAGE, [
    { ...options, additionalProperties },
  ])
}
