import { AsyncApiContract } from '../interfaces/async-api-contract.interface'

/**
 * Creates the basic contract aka document for AsyncAPI
 */
export const createContractBase = (): AsyncApiContract => ({
  asyncapi: '2.0.0',
  defaultContentType: 'application/json',
  info: {
    title: '',
    version: '1.0.0',
    description: '',
  },
  channels: {},
  components: {},
})
