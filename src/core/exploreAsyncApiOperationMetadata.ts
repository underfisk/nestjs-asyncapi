/* eslint-disable @typescript-eslint/ban-types */
import { Type } from '@nestjs/common'
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'
import { OperationObjectFactory } from './operation-object-factory'
import { AsyncApiOperationOptions } from '../interfaces/async-operation-options.interface'
import { DECORATORS } from '../constants'

const operationObjectFactory = new OperationObjectFactory()

export const exploreAsyncApiOperationMetadata = (
  schemas: Record<string, SchemaObject>,
  _schemaRefsStack: [],
  instance: object,
  prototype: Type<unknown>,
  method: object,
) => {
  console.log(method)
  /**
   * @todo we might need to validate first if he has or not
   * @todo We need to add default pub or sub otherwise async api throws an error
   */
  const subMetadata: AsyncApiOperationOptions = exploreAsyncapiSubMetadata(
    instance,
    prototype,
    method,
  )

  const pubMetadata: AsyncApiOperationOptions = exploreAsyncapiPubMetadata(
    instance,
    prototype,
    method,
  )

  let pubObject = {}
  if (pubMetadata) {
    pubObject = {
      pub: {
        ...pubMetadata,
        ...operationObjectFactory.create(
          pubMetadata,
          ['application/json'],
          schemas,
        ),
      },
    }
  }

  let subObject = {}
  if (subMetadata) {
    subObject = {
      sub: {
        ...subMetadata,
        ...operationObjectFactory.create(
          subMetadata,
          ['application/json'],
          schemas,
        ),
      },
    }
  }

  const result = { ...pubObject, ...subObject }
  return result
}

export const exploreAsyncapiPubMetadata = (
  _instance: object,
  _prototype: Type<unknown>,
  method: object,
) => {
  const result = Reflect.getMetadata(DECORATORS.PUB, method)
  return result
}
export const exploreAsyncapiSubMetadata = (
  _instance: object,
  _prototype: Type<unknown>,
  method: object,
) => {
  const result = Reflect.getMetadata(DECORATORS.SUB, method)
  return result
}
