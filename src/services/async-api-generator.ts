import Generator from '@asyncapi/generator'
import path from 'path'
import { promises as fs } from 'fs'
import { AsyncApiContract } from '../interfaces/async-api-contract.interface'
import { ContractParser } from './contract-parser'
import { AsyncApiTemplateOptions } from '../interfaces/async-api-template-options.interface'
import { Logger } from '@nestjs/common'
import os from 'os'

/**
 * Private interface just to give static typing due '@asyncapi/generator' due to the fact they do not support yet Typescript
 * @see https://github.com/asyncapi/generator/blob/master/docs/api.md
 */
interface IGenerator {
  templateName: string
  targetDir: string
  entrypoint?: string
  noOverwriteGlobs: string[]
  disabledHooks: { [key: string]: string | boolean | string[] }
  output: 'string' | 'fs'
  forceWrite: boolean
  debug: boolean
  install: boolean
  // eslint-disable-next-line @typescript-eslint/ban-types
  templateConfig: object
  // eslint-disable-next-line @typescript-eslint/ban-types
  hooks: object
  templateParams: AsyncApiTemplateOptions
  generate: (document: any) => Promise<void>
  generateFromURL: (url: string) => Promise<void>
  generateFromFile: (path: string) => Promise<void>
  generateFromString: (yaml: string, args?: any) => Promise<string>
}

type HTMLBuildResult = string
/**
 * Provides a generate method to download/install all necessary dependencies of async-api
 * and generate .asyncapi folder
 */
export class AsyncApiGenerator {
  private readonly logger = new Logger(AsyncApiGenerator.name)
  private readonly parser = new ContractParser()
  private readonly baseUrl = path.resolve(process.cwd())
  private readonly targetFolder = '.asyncapi'
  /*  private readonly targetDirectory = path.resolve(
    path.join(this.baseUrl, this.targetFolder),
  )*/
  private readonly generator: IGenerator

  constructor(readonly templateOptions?: AsyncApiTemplateOptions) {
    /*  this.generator = new Generator(
      '@asyncapi/html-template',
      this.targetDirectory,
      this.templateOptions,
    )*/
    this.generator = new Generator('@asyncapi/html-template', os.tmpdir(), {
      forceWrite: true,
      entrypoint: 'index.html',
      output: 'string',
      templateParams: {
        singleFile: true,
        ...templateOptions,
      },
    })
  }

  /**
   * Generates the documentation files/static assets under .asyncapi folder
   * If this method throws any validation error related to async-api, just place the generated YAML
   * in async-api playground and see the details
   *
   * @param contract
   */
  public async generate(contract: AsyncApiContract): Promise<HTMLBuildResult> {
    this.logger.log('Parsing AsyncAPI YAML from AsyncApiContract')
    const yaml = this.parser.parse(contract)
    this.logger.log('Generating yaml template to files')
    return await this.generator.generateFromString(yaml, {
      resolve: {
        file: false,
      },
    })
  }

  /* public getIndexHtmlPath() {
    return `${this.targetDirectory}/index.html`
  }*/

  /*  public getStaticAssetsPath() {
    return this.targetDirectory
  }*/
}
