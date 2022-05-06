import { DocumentBuilder } from '../document-builder'
import { createContractBase } from '../../fixtures/contract-fixture'
import { AsyncApiContract } from '../../interfaces/async-api-contract.interface'

describe('ContractBuilder', () => {
  it('should be defined', () => {
    const builder = new DocumentBuilder()
    expect(builder).toBeInstanceOf(DocumentBuilder)
    expect(builder.build()).toBeDefined()
  })

  it('should throw error when attempting to add invalid URL', () => {
    try {
      new DocumentBuilder().setTermsOfService('test invalid')
    } catch (e) {
      expect(e).toBeDefined()
    }
  })

  it('should create a valid contract', () => {
    const contract = new DocumentBuilder()
      .setTitle('test')
      .setVersion('1.0.0')
      .build()
    const baseFixture = createContractBase()
    expect(contract).toEqual({
      ...baseFixture,
      info: {
        ...baseFixture.info,
        title: 'test',
        version: '1.0.0',
      },
    } as AsyncApiContract)
  })
})
