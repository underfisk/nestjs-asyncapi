/* eslint-disable @typescript-eslint/ban-types */
import { isString } from '@nestjs/common/utils/shared.utils'

export function getSchemaPath(model: string | Function): string {
  const modelName = isString(model) ? model : model && model.name
  return `#/components/schemas/${modelName}`
}

export function refs(...models: Function[]) {
  return models.map((item) => ({
    $ref: getSchemaPath(item.name),
  }))
}
