import { createMixedDecorator, createPropertyDecorator } from './helpers'
import { DECORATORS } from '../constants'
import { Type } from '@nestjs/common'

export interface AsyncChannelOptions {
  name: string
  description?: string
  bindings?: Record<string, any>
}

/**
 * Decorates a model property to be included in async api documentation
 * (If the property is not decorated, it will not be included)
 * @param metadata
 * @constructor
 */
export function AsyncChannel(optionsOrName: string | AsyncChannelOptions) {
  const metadata =
    typeof optionsOrName === 'string' ? { name: optionsOrName } : optionsOrName
  return createMixedDecorator(DECORATORS.CHANNEL, metadata)
}
