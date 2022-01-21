import jsyaml from 'js-yaml'
import { AsyncApiContract } from '../interfaces/async-api-contract.interface'

export class ContractParser {
  // TODO: Maybe use asyncapi-parser?
  parse(contract: AsyncApiContract) {
    return jsyaml.safeDump(contract)
  }
}
