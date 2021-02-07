import { AsyncApiScanner } from '../async-api-scanner'
import { Test } from '@nestjs/testing'
import { Controller, INestApplication } from '@nestjs/common'
import { AsyncConsumer } from '../../decorators/async-consumer.decorator'
import { AsyncMessage } from '../../decorators/async-message.decorator'
import { AsyncProperty } from '../../decorators/async-property.decorator'
import { AsyncPublisher } from '../../decorators/async-publisher.decorator'
import * as util from 'util'
import { ContractParser } from '../../services/contract-parser'
import { createContractBase } from '../../fixtures/contract-fixture'

describe('AsyncApiScanner', () => {
  let app: INestApplication
  let scanner: AsyncApiScanner

  beforeAll(async () => {
    @AsyncMessage({})
    class TestMessageDto {
      @AsyncProperty({ type: String })
      id: string
    }

    @Controller()
    class UserController {
      @AsyncConsumer('test', { message: TestMessageDto })
      handleConsume() {
        return true
      }

      /* @AsyncPublisher('userWillPublish', null)
      @AsyncConsumer('userSigned', { message: TestMessageDto })
      consumeAndPublish() {
        return 'test'
      }*/
      methodThatHasNoDecorators() {}
    }
    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
    }).compile()
    app = moduleRef.createNestApplication()
    await app.init()
    scanner = new AsyncApiScanner()
  })

  it('should be defined', () => {
    expect(app).toBeDefined()
    expect(scanner).toBeDefined()
  })

  it('should find handleConsume consumer', () => {
    const result = scanner.scanApplication(app, {})
    //console.log(util.inspect(result, null, 99, true))
    // console.log(result)
    const parser = new ContractParser()
    let contract = createContractBase()
    contract = {
      ...contract,
      components: result.components,
      channels: result.channels,
    }
    //console.log(parser.parse(contract))
    expect(result).toBeDefined()
  })
})
