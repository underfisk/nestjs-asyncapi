import { ContractParser } from '../contract-parser'
import { ContractBuilder } from '../../core/contract-builder'

describe('ContractParser', () => {
  const parser = new ContractParser()
  it('should parse custom contract to yaml', () => {
    const contract = new ContractBuilder()
      .setTitle('Test Parse')
      .setDescription('test')
      .setVersion('1.0.0')
      .addServer('production', {
        protocol: 'nosql',
        url: 'mongodb://localhost:277777',
        description: 'Mongodb',
        protocolVersion: '2.0.0',
      })
      .build()
    expect(parser.parse(contract)).toBeDefined()
  })
})
