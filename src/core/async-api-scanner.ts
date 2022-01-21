/* eslint-disable @typescript-eslint/ban-types */
import { INestApplication, Type } from '@nestjs/common'
import { MODULE_PATH } from '@nestjs/common/constants'
import { NestContainer } from '@nestjs/core/injector/container'
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper'
import { Module } from '@nestjs/core/injector/module'
import { extend, flatten, isEmpty, reduce } from 'lodash'
import { stripLastSlash } from '../utils/strip-last-slash'
import { AsyncApiExplorer } from './async-api-explorer'
import { AsyncApiScanningOptions } from '../interfaces/async-api-scanning-options.interface'
import { AsyncApiChannels } from '../interfaces/async-api-channels.interface'
import { AsyncApiSchemaObject } from '../interfaces/async-api-schema-object.interface'
import { AsyncApiTransformer } from './async-api-transformer'

/** @author https://github.com/nestjs/swagger/blob/master/lib/swagger-scanner.ts **/
export class AsyncApiScanner {
  private readonly transformer = new AsyncApiTransformer()
  /*private readonly schemaObjectFactory = new SchemaObjectFactory(
    new ModelPropertiesAccessor(),
    new SwaggerTypesMapper(),
  )*/
  private readonly explorer = new AsyncApiExplorer()

  public scanApplication(
    app: INestApplication,
    options: AsyncApiScanningOptions,
  ) {
    const {
      deepScanRoutes,
      include: includedModules = [],
      operationIdFactory,
    } = options

    const container: NestContainer = (app as any).container
    const modules: Module[] = this.getModules(
      container.getModules(),
      includedModules,
    )

    const globalPrefix = stripLastSlash(this.getGlobalPrefix(app))
    const denormalizedChannels = modules.map(
      ({ components, metatype, relatedModules }) => {
        let allComponents = new Map(components)

        if (deepScanRoutes) {
          // only load submodules routes if asked
          const isGlobal = (module: Type<any>) =>
            !container.isGlobalModule(module)

          Array.from(relatedModules.values())
            .filter(isGlobal as any)
            .map(({ components: relatedComponents }) => relatedComponents)
            .forEach((relatedComponents) => {
              allComponents = new Map([...allComponents, ...relatedComponents])
            })
        }
        const path = metatype
          ? Reflect.getMetadata(MODULE_PATH, metatype)
          : undefined

        return this.scanModuleComponents(
          allComponents as Map<string, InstanceWrapper>,
          path,
          globalPrefix,
          operationIdFactory,
        )
      },
    )

    const schemas = this.explorer.getSchemas()
    //this.addExtraModels(schemas, extraModels);
    const normalizedChannels = this.transformer.normalizeChannels(
      flatten(denormalizedChannels as any),
    )
    const components = {
      schemas: reduce(schemas, extend) as Record<string, AsyncApiSchemaObject>,
    }
    return {
      ...normalizedChannels,
      components: components,
    }

    /* return {
      channels: this.explorer.getChannels(),
      components: {
        messages: this.explorer.getMessages(),
      },
    }*/
  }

  public scanModuleComponents(
    components: Map<string, InstanceWrapper>,
    modulePath?: string,
    globalPrefix?: string,
    operationIdFactory?: (controllerKey: string, methodKey: string) => string,
  ): AsyncApiChannels {
    const denormalizedArray = [...components.values()].map((comp) =>
      this.explorer.exploreChannel(
        comp,
        modulePath,
        globalPrefix,
        operationIdFactory,
      ),
    )

    return flatten(denormalizedArray) as any
  }

  public getModules(
    modulesContainer: Map<string, Module>,
    include: Function[],
  ): Module[] {
    if (!include || isEmpty(include)) {
      return [...modulesContainer.values()]
    }
    return [...modulesContainer.values()].filter(({ metatype }) =>
      include.some((item) => item === metatype),
    )
  }

  private getGlobalPrefix(app: INestApplication): string {
    const internalConfigRef = (app as any).config
    return (internalConfigRef && internalConfigRef.getGlobalPrefix()) || ''
  }
}
