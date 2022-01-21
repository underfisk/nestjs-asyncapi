import { AsyncApiExternalDocs } from './async-api-external-docs.interface'
import { AsyncApiTags } from './async-api-tags.interface'
import { AsyncApiBindings } from './async-api-bindings.interface'
import { AsyncApiExamples } from './async-api-examples.interface'
import { AsyncApiReferenceObject } from './async-api-reference-object.interface'
import { AsyncApiDiscriminator } from './async-api-discriminator.interface'

export interface XmlObject {
  name?: string
  namespace?: string
  prefix?: string
  attribute?: boolean
  wrapped?: boolean
}

export interface SchemaObject {
  nullable?: boolean
  discriminator?: AsyncApiDiscriminator
  readOnly?: boolean
  writeOnly?: boolean
  xml?: XmlObject
  externalDocs?: AsyncApiExternalDocs
  example?: any
  examples?: any[]
  deprecated?: boolean
  type?: string
  allOf?: (SchemaObject | AsyncApiReferenceObject)[]
  oneOf?: (SchemaObject | AsyncApiReferenceObject)[]
  anyOf?: (SchemaObject | AsyncApiReferenceObject)[]
  not?: SchemaObject | AsyncApiReferenceObject
  items?: SchemaObject | AsyncApiReferenceObject
  properties?: Record<string, SchemaObject | AsyncApiReferenceObject>
  additionalProperties?: SchemaObject | AsyncApiReferenceObject | boolean
  description?: string
  format?: string
  default?: any
  title?: string
  multipleOf?: number
  maximum?: number
  exclusiveMaximum?: boolean
  minimum?: number
  exclusiveMinimum?: boolean
  maxLength?: number
  minLength?: number
  pattern?: string
  maxItems?: number
  minItems?: number
  uniqueItems?: boolean
  maxProperties?: number
  minProperties?: number
  required?: string[]
  enum?: any[]
}

export interface AsyncCorrelationObject {
  description?: string
  location: string
}

export interface AsyncTagObject {
  name: string
  description?: string
  externalDocs?: AsyncApiExternalDocs
}

export interface AsyncApiMessageTraitObject {
  headers?: SchemaObject
  correlationId?: AsyncCorrelationObject
  /** @see https://www.asyncapi.com/docs/specifications/2.0.0#messageObjectSchemaFormatTable **/
  schemaFormat?: string
  /** @see https://www.asyncapi.com/docs/specifications/2.0.0#defaultContentTypeString **/
  contentType?: string
  name?: string
  title?: string
  summary?: string
  description?: string
  tags?: AsyncTagObject[]
  externalDocs?: AsyncApiExternalDocs
  bindings?: Record<string, any>
  examples?: AsyncApiExamples
}

export interface AsyncApiMessage extends AsyncApiMessageTraitObject {
  payload?: any
  traits?: AsyncApiMessageTraitObject
}
