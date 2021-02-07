import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { ApplicationModule } from './fastify-app/app.module'
import { ContractBuilder } from '../src/core/contract-builder'
import { AsyncApiModule } from '../src/async-api-module'

describe('Fastify Adapter', () => {
  let app: NestFastifyApplication
  let builder: ContractBuilder

  beforeEach(async () => {
    app = await NestFactory.create<NestFastifyApplication>(
      ApplicationModule,
      new FastifyAdapter(),
      { logger: false },
    )

    builder = new ContractBuilder()
      .setTitle('Users example at Swagger')
      .setDescription('The cats API description')
      .setVersion('1.0')
  })

  it('should produce a valid Async API 2.0.0 contract', async () => {
    const contract = AsyncApiModule.createContract(app, builder.build())
    const doc = JSON.stringify(contract, null, 2)
  })

  it('should setup the route', async () => {
    const contract = AsyncApiModule.createContract(app, builder.build())
    await app.init()
    await AsyncApiModule.setup('/asyncapi', app, builder.build())
    await expect(
      app.getHttpAdapter().getInstance().ready(),
    ).resolves.toBeDefined()
  })
})
