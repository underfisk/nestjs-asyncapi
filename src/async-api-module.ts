import { INestApplication } from '@nestjs/common'
import { AsyncApiContract } from './interfaces/async-api-contract.interface'
import { validatePath } from './utils/validate-path'
import { AsyncApiGenerator } from './services/async-api-generator'
import { AsyncApiTemplateOptions } from './interfaces/async-api-template-options.interface'
import { ContractParser } from './services/contract-parser'

export class AsyncApiModule {
  public static createContract(
    app: INestApplication,
    config: any,
    options?: any,
  ) {
    /** @todo Create its implementation **/
    /** @todo If there are no channel/messages in components we might need to provide a default to prevent AsyncAPI validation error **/
  }

  public static async setup(
    path: string,
    app: INestApplication,
    contact: AsyncApiContract,
    templateOptions?: AsyncApiTemplateOptions,
  ) {
    const httpAdapter = app.getHttpAdapter()
    if (httpAdapter?.getType() === 'fastify') {
      return this.setupFastify(path, httpAdapter, contact, templateOptions)
    }
    return this.setupExpress(path, app, contact, templateOptions)
  }

  private static async setupExpress(
    path: string,
    app: INestApplication,
    contract: AsyncApiContract,
    templateOptions?: AsyncApiTemplateOptions,
  ) {
    const httpAdapter = app.getHttpAdapter()
    const finalPath = validatePath(path)
    const generator = new AsyncApiGenerator(templateOptions)
    const html = await generator.generate(contract)
    const parser = new ContractParser()
    //httpAdapter.useStaticAssets(generator.getStaticAssetsPath())
    httpAdapter.get(finalPath, (req, res) =>
      //res.send(generator.getIndexHtmlPath()),
      res.send(html),
    )
    httpAdapter.get(finalPath + '-json', (req, res) => res.json(contract))
    httpAdapter.get(finalPath + '-yml', (req, res) =>
      res.json(parser.parse(contract)),
    )
  }

  private static async setupFastify(
    path: string,
    httpServer: any,
    contract: AsyncApiContract,
    templateOptions?: AsyncApiTemplateOptions,
  ) {
    // Workaround for older versions of the @nestjs/platform-fastify package
    // where "isParserRegistered" getter is not defined.
    const hasParserGetterDefined = (
      Object.getPrototypeOf(
        httpServer,
        // eslint-disable-next-line @typescript-eslint/ban-types
      ) as Object
    ).hasOwnProperty('isParserRegistered')
    if (hasParserGetterDefined && !httpServer.isParserRegistered) {
      httpServer.registerParserMiddleware()
    }

    const finalPath = validatePath(path)
    const generator = new AsyncApiGenerator(templateOptions)
    const html = await generator.generate(contract)
    const parser = new ContractParser()

    httpServer.get(finalPath, (req, res) => {
      // res.send(generator.getIndexHtmlPath())
      res.send(html)
    })
    httpServer.get(`${finalPath}-json`, (req, res) => {
      res.send(contract)
    })
    httpServer.get(`${finalPath}-yml`, (req, res) => {
      res.send(parser.parse(contract))
    })
  }
}
