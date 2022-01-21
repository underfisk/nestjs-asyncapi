import { isArray, isUndefined, negate, pickBy } from 'lodash'
import { DECORATORS, METADATA_FACTORY_NAME } from '../constants'
/**
 * @see https://github.com/nestjs/swagger/blob/master/lib/decorators/helpers.ts
 */

export function createMixedDecorator<T = any>(
  metakey: string,
  metadata: T,
): MethodDecorator & ClassDecorator {
  return (
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: object,
    key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>,
  ): any => {
    if (descriptor) {
      Reflect.defineMetadata(metakey, metadata, descriptor.value)
      return descriptor
    }
    Reflect.defineMetadata(metakey, metadata, target)
    return target
  }
}

export function createMethodDecorator<T = any>(
  metakey: string,
  metadata: T,
): MethodDecorator {
  return (
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: object,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    Reflect.defineMetadata(metakey, metadata, descriptor.value)
    return descriptor
  }
}

export function createClassDecorator<T extends Array<any> = any>(
  metakey: string,
  metadata: T = [] as T,
): ClassDecorator {
  return (target) => {
    const prevValue = Reflect.getMetadata(metakey, target) || []
    Reflect.defineMetadata(metakey, [...prevValue, ...metadata], target)
    return target
  }
}

export function createPropertyDecorator<T extends Record<string, any> = any>(
  metakey: string,
  metadata: T,
  overrideExisting = true,
): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    const properties =
      Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES_ARRAY, target) || []

    const key = `:${propertyKey}`
    if (!properties.includes(key)) {
      Reflect.defineMetadata(
        DECORATORS.API_MODEL_PROPERTIES_ARRAY,
        [...properties, `:${propertyKey}`],
        target,
      )
    }
    const existingMetadata = Reflect.getMetadata(metakey, target, propertyKey)
    if (existingMetadata) {
      const newMetadata = pickBy(metadata, negate(isUndefined))
      const metadataToSave = overrideExisting
        ? {
            ...existingMetadata,
            ...newMetadata,
          }
        : {
            ...newMetadata,
            ...existingMetadata,
          }

      Reflect.defineMetadata(metakey, metadataToSave, target, propertyKey)
    } else {
      const type =
        target?.constructor?.[METADATA_FACTORY_NAME]?.()[propertyKey]?.type ??
        Reflect.getMetadata('design:type', target, propertyKey)

      Reflect.defineMetadata(
        metakey,
        {
          type,
          ...pickBy(metadata, negate(isUndefined)),
        },
        target,
        propertyKey,
      )
    }
  }
}
