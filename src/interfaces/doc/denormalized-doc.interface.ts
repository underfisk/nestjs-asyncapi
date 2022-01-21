import { AsyncApiContract } from '../async-api-contract.interface'
import { AsyncApiOperation } from '../async-api-operation.interface'
import { AsyncApiChannel } from '../async-api-channel.interface'

export interface DenormalizedDoc extends Partial<AsyncApiContract> {
  root?: { name: string } & AsyncApiChannel
  operations?: { pub: AsyncApiOperation; sub: AsyncApiOperation }
}
