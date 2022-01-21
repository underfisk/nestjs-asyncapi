import { AsyncApiScanner } from '../async-api-scanner'
import { Test } from '@nestjs/testing'
import { Controller, INestApplication, Injectable } from '@nestjs/common'
import { AsyncConsumer } from '../../decorators/async-consumer.decorator'
import { AsyncProperty } from '../../decorators/async-property.decorator'
import { ContractParser } from '../../services/contract-parser'
import { createContractBase } from '../../fixtures/contract-fixture'
import { AsyncChannel } from '../../decorators/async-channel.decorator'
import { ApiProperty } from '@nestjs/swagger'
import { AsyncPublisher } from '../../decorators/async-publisher.decorator'

describe('AsyncApiScanner', () => {
  let app: INestApplication
  let scanner: AsyncApiScanner

  beforeAll(async () => {
    class TestMessageDto {
      @ApiProperty({ type: String, description: 'Testing from async' })
      id: string
    }

    @Injectable()
    @AsyncChannel('test')
    class UserController {
      @AsyncConsumer({
        message: { name: 'hey', payload: { type: TestMessageDto } },
      })
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
      providers: [UserController],
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
    console.log(result)
    expect(result).toBeDefined()
  })
})
