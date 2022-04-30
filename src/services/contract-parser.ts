import jsyaml from 'js-yaml'
import { AsyncApiContract } from '../interfaces/async-api-contract.interface'

export class ContractParser {
  parse(contract: AsyncApiContract) {
    return jsyaml.dump(contract)
  }
}
