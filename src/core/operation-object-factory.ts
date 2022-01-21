/* eslint-disable @typescript-eslint/ban-types */
import { omit } from 'lodash'
import { AsyncApiOperation } from '../interfaces/async-api-operation.interface'
import { getSchemaPath } from '../utils/getSchemaPath.util'
import { AsyncApiOperationOptions } from '../interfaces/async-operation-options.interface'
import { SchemaObjectFactory } from '@nestjs/swagger/dist/services/schema-object-factory'
import { SwaggerTypesMapper } from '@nestjs/swagger/dist/services/swagger-types-mapper'
import { ModelPropertiesAccessor } from '@nestjs/swagger/dist/services/model-properties-accessor'
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

export class OperationObjectFactory {
  private readonly modelPropertiesAccessor = new ModelPropertiesAccessor()
  private readonly swaggerTypesMapper = new SwaggerTypesMapper()
  private readonly schemaObjectFactory = new SchemaObjectFactory(
    this.modelPropertiesAccessor,
    this.swaggerTypesMapper,
  )

  create(
    operation: AsyncApiOperationOptions,
    produces: string[],
    schemas: Record<string, SchemaObject>,
  ): AsyncApiOperation {
    const { message } = operation as AsyncApiOperationOptions
    const messagePayloadType = message.payload.type as Function
    const name = this.schemaObjectFactory.exploreModelSchema(
      messagePayloadType,
      schemas,
    )
    const discriminator = operation.message.payload.discriminator
    if (operation.message.payload.discriminator) {
      const schema = schemas[name]
      if (schema) {
        schema.discriminator = discriminator
      }
    }

    return this.toRefObject(operation, name, produces)
  }

  private toRefObject(
    operation: AsyncApiOperationOptions,
    name: string,
    produces: string[],
  ): AsyncApiOperation {
    const asyncOperationObject = omit(operation, 'examples')

    return {
      ...asyncOperationObject,
      message: {
        name: operation.message.name,
        payload: {
          $ref: getSchemaPath(name),
          examples: operation.message.payload.examples,
        },
      },
    }
  }
}
