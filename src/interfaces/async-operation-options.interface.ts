/* eslint-disable @typescript-eslint/ban-types */
import { AsyncApiOperation } from './async-api-operation.interface'
import { Type } from '@nestjs/common'
import { AsyncApiExamples } from './async-api-examples.interface'
import { AsyncApiDiscriminator } from './async-api-discriminator.interface'

export interface AsyncApiOperationOptions
  extends Omit<AsyncApiOperation, 'message'> {
  message: {
    name: string
    payload: {
      type: Type<unknown> | Function | [Function] | string
      discriminator?: AsyncApiDiscriminator
      examples?: AsyncApiExamples
    }
  }
}
