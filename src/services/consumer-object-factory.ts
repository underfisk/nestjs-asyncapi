import { AsyncApiOperation } from '../interfaces/async-api-operation.interface'
import { AsyncApiOperationOptions } from '../interfaces/async-operation-options.interface'

export class ConsumerObjectFactory {
  create(
    options: AsyncApiOperationOptions,
    operationId: string,
  ): AsyncApiOperation {
    /** @todo Handle first if the metadata is a SchemaObject or a message type **/
    const metadata = {
      description: options?.description || '',
    }
    //console.log({ metadata, options, operationId })
    //If we have more than 1 type than we have a schema
    return {
      ...metadata,
      operationId,
      message: {
        description: 'Dump',
        summary: 'Testing',
        // $ref: '#/components/messages/TEST',
      },
    }
  }
}
