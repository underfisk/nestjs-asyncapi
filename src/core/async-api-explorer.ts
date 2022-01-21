/* eslint-disable @typescript-eslint/ban-types */
import { Controller } from '@nestjs/common/interfaces'
import { isNil } from '@nestjs/common/utils/shared.utils'
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper'
import { MetadataScanner } from '@nestjs/core/metadata-scanner'
import { DECORATORS } from '../constants'
import { ConsumerObjectFactory } from '../services/consumer-object-factory'
import { AsyncApiSchemaObject } from '../interfaces/async-api-schema-object.interface'
import { AsyncApiChannels } from '../interfaces/async-api-channels.interface'
import { AsyncApiMessage } from '../interfaces/async-api-message-metadata.interface'
import { Logger, Type } from '@nestjs/common'
import { AsyncApiChannel } from '../interfaces/async-api-channel.interface'
import { DenormalizedDocResolvers } from '../interfaces/doc/denormalized-doc-resolvers.interface'
import { DenormalizedDoc } from '../interfaces/doc/denormalized-doc.interface'
import { exploreAsyncApiOperationMetadata } from './exploreAsyncApiOperationMetadata'

export class AsyncApiExplorer {
  private readonly logger = new Logger(AsyncApiExplorer.name)
  private readonly metadataScanner = new MetadataScanner()
  private readonly schemas: Record<string, AsyncApiSchemaObject> = {}
  private messages: Record<string, AsyncApiMessage> = {}
  private readonly consumerObjectFactory = new ConsumerObjectFactory()
  private operationIdFactory = (controllerKey: string, methodKey: string) =>
    controllerKey ? `${controllerKey}_${methodKey}` : methodKey

  private readonly schemaRefsStack: string[] = []

  private channels: Record<string, AsyncApiChannel> = {}

  /* private createDefaultMessageComponent(): AsyncApiMessage {
    return {
      description:
        'Default message, please ensure you add a message component in your producer/consumer decorator',
      summary: 'Created automatically',
      name: 'Default message',
      correlationId: '__EMPTY__',
    }
  }*/

  private createDefaultChannelComponent(): AsyncApiChannel {
    return {
      description:
        'Default channel, please ensure you have at least one AsyncConsumer or AsyncPublisher registered',
      subscribe: {
        summary: 'Default Sub',
        description: '',
        message: {
          summary: 'Empty message',
          description: '',
        },
      },
    }
  }

  private setChannels(channels: Record<string, AsyncApiChannel>) {
    this.channels = channels
  }

  private setMessages(messages: Record<string, AsyncApiMessage>) {
    this.messages = messages
  }

  getSchemas() {
    return this.schemas
  }

  getChannels() {
    return this.channels
  }

  getMessages() {
    return this.messages
  }

  public exploreChannel(
    wrapper: InstanceWrapper<Controller>,
    modulePath?: string,
    globalPrefix?: string,
    operationIdFactory?: (controllerKey: string, methodKey: string) => string,
  ) {
    if (operationIdFactory) {
      this.operationIdFactory = operationIdFactory
    }
    const { instance, metatype } = wrapper

    if (
      !instance ||
      !metatype ||
      !Reflect.getMetadataKeys(metatype).find((x) => x === DECORATORS.CHANNEL)
    ) {
      return []
    }

    const prototype = Object.getPrototypeOf(instance)

    console.log({
      instance,
      metatype,
      prototype,
    })
    const documentResolvers: DenormalizedDocResolvers = {
      root: [exploreAsyncApiOperationMetadata],
      security: [],
      tags: [],
      operations: [exploreAsyncApiOperationMetadata],
    }
    return this.generateDenormalizedDocument(
      metatype as Type<unknown>,
      prototype,
      instance,
      documentResolvers,
      modulePath,
      globalPrefix,
    )

    /* const scanResult = this.metadataScanner.scanFromPrototype<any, any>(
      instance,
      prototype,
      (name) => {
        const handler = prototype[name]
        console.log('Handler name -> ' + name)
        console.log('Typeof the handler -> ' + typeof handler)
        const consumerMetadata = Reflect.getMetadata(
          DECORATORS.CONSUMER,
          handler,
        )
        const publisherMetadata = Reflect.getMetadata(
          DECORATORS.PUBLISHER,
          handler,
        )

        console.log({
          consumerMetadata,
          publisherMetadata,
        })

        if (isNil(consumerMetadata) && isNil(publisherMetadata)) {
          return
        }

        const channelComponent = this.createChannelComponent(
          consumerMetadata,
          publisherMetadata,
          this.getOperationId(instance, handler),
        )

        const messages = this.createMessagesFromMetadata(
          consumerMetadata,
          publisherMetadata,
        )
        return { channelComponent, messageComponent: messages }
      },
    )
    const channels = scanResult.reduce((p, e) => {
      return {
        ...p,
        ...e.channelComponent,
      }
    }, {} as AsyncApiChannels)

    const messages = scanResult.reduce((p, e) => {
      return {
        ...p,
        ...e.messageComponent,
      }
    }, {} as any)
    //Ensure we have at least 1 message
    if (Object.keys(messages).length === 0) {
      this.logger.warn(
        'No messages component detected, please ensure you load a message or AsyncAPI throws error',
      )
      this.setMessages({ DEFAULT: this.createDefaultMessageComponent() })
    } else {
      this.setMessages(messages)
    }

    //Ensure we have at least 1 channel
    if (Object.keys(channels).length === 0) {
      this.setChannels({ DEFAULT: this.createDefaultChannelComponent() })
    } else {
      this.setChannels(channels)
    }

    return prototype*/
  }

  private getOperationId(instance: object, method: Function): string {
    return this.operationIdFactory(
      instance.constructor?.name || '',
      method.name,
    )
  }

  private createChannelComponent(
    consumerMetadata: any,
    publisherMetadata: any,
    operationId: string,
  ) {
    const component = {}
    if (consumerMetadata) {
      /**
       * @todo We need somehow to also register the message component if its not registered yet
       * If type is undefined/null or anything not supported we show create a custom object to say that
       * **/
      component[consumerMetadata.channelName] = {
        ...(component[consumerMetadata.channelName] || {}),
        subscribe: this.consumerObjectFactory.create(
          consumerMetadata.options,
          operationId + '-consumer',
        ),
      }
    }

    if (publisherMetadata) {
      component[consumerMetadata.channelName] = {
        ...(component[consumerMetadata.channelName] || {}),
        /** @todo Publisher object factory **/
        publish: this.consumerObjectFactory.create(
          consumerMetadata.options,
          operationId + '-publisher',
        ),
      }
    }

    return component
  }

  private createMessagePayload() {
    return {
      type: 'object',
      properties: {
        yourProperties: 'etcetc',
      },
    }
  }

  private isMessageOneOf(type: any) {
    return !isNil(type.oneOf)
  }

  private isMessageSchemaRef(type: any) {
    return !isNil(type.schema)
  }

  private isMessageClass(type: any) {
    const metadata = Reflect.getMetadata(DECORATORS.MESSAGE, type)
    return !isNil(metadata)
  }

  private createMessagesFromMetadata(
    consumerMetadata: any,
    publisherMetadata: any,
  ) {
    const messageComponent = {
      /*  ['TEST']: {
        description: 'Test',
        payload: {
          type: 'object',
          properties: {
            displayName: {
              type: 'string',
              description: 'your name',
            },
          },
        },
      },*/
    }
    if (consumerMetadata?.options?.message) {
      const { options } = consumerMetadata
      console.log({
        consumerMetadata,
        message: options.message,
        proto: Object.getPrototypeOf(options.message),
        isOneOf: this.isMessageOneOf(options.message),
        isMessageClass: this.isMessageClass(options.message),
        isRef: this.isMessageSchemaRef(options.message),
      })

      if (this.isMessageClass(options.message)) {
        const messageMetadata = Reflect.getMetadata(
          DECORATORS.MESSAGE,
          options.message,
        )

        //let prototype = Object.getPrototypeOf(options.message)
        /*     const fields: any[] = []
        do {
          const childFields =
            Reflect.getOwnMetadata(
              DECORATORS.API_MODEL_PROPERTIES,
              prototype,
            ) ?? []

          //fields.push(...childFields)
        } while (
          (prototype = Reflect.getPrototypeOf(prototype)) &&
          prototype !== Object.prototype &&
          prototype
        )*/

        /** @todo If there are no properties at all we have to insert one manually **/
        /** @todo Additional properties option will come from message class **/
      } else if (this.isMessageClass(options.message)) {
      } else if (this.isMessageOneOf(options.message)) {
      } else {
        this.logger.warn(
          'Provided message is not a valid type: ' +
            options.message +
            '. Expected schema reference, AsyncMessage class or oneOf schema reference',
        )
      }
    }

    return messageComponent
  }

  private generateDenormalizedDocument(
    metatype: Type<unknown>,
    prototype: Type<unknown>,
    instance: object,
    documentResolvers: DenormalizedDocResolvers,
    _modulePath?: string,
    _globalPrefix?: string,
  ): DenormalizedDoc[] {
    const denormalizedChannels = this.metadataScanner.scanFromPrototype<
      any,
      DenormalizedDoc
    >(instance, prototype, (name) => {
      const targetCallback = prototype[name]
      const methodMetadata = documentResolvers.root.reduce((_metadata, fn) => {
        const channelMetadata = fn(metatype)
        return {
          root: Object.assign(channelMetadata, { name: channelMetadata.name }),
          operations: documentResolvers.operations.reduce((_metadata, opFn) => {
            return opFn(
              this.schemas,
              this.schemaRefsStack,
              instance,
              prototype,
              targetCallback,
            )
          }, {}),
        }
      }, {})
      return methodMetadata
    })

    return denormalizedChannels
  }
}
