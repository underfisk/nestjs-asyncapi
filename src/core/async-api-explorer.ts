/* eslint-disable @typescript-eslint/ban-types */
import { Controller } from '@nestjs/common/interfaces'
import { isNil } from '@nestjs/common/utils/shared.utils'
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper'
import { MetadataScanner } from '@nestjs/core/metadata-scanner'
import { DECORATORS } from '../constants'
import { ConsumerObjectFactory } from '../services/consumer-object-factory'
import { AsyncApiSchemaObject } from '../interfaces/async-api-schema-object.interface'
import { AsyncApiChannels } from '../interfaces/async-api-channels.interface'
import { AsyncApiMessageMetadata } from '../interfaces/async-api-message-metadata.interface'
import { Logger } from '@nestjs/common'
import { AsyncApiChannel } from '../interfaces/async-api-channel.interface'

export class AsyncApiExplorer {
  // private readonly mimetypeContentWrapper = new MimetypeContentWrapper()
  private readonly logger = new Logger(AsyncApiExplorer.name)
  private readonly metadataScanner = new MetadataScanner()
  private readonly schemas: AsyncApiSchemaObject[] = []
  private messages: Record<string, AsyncApiMessageMetadata> = {}
  private readonly consumerObjectFactory = new ConsumerObjectFactory()
  private operationIdFactory = (controllerKey: string, methodKey: string) =>
    controllerKey ? `${controllerKey}_${methodKey}` : methodKey

  // constructor(private readonly schemaObjectFactory: SchemaObjectFactory) {}
  private channels: Record<string, AsyncApiChannel> = {}

  private createDefaultMessageComponent(): AsyncApiMessageMetadata {
    return {
      description:
        'Default message, please ensure you add a message component in your producer/consumer decorator',
      summary: 'Created automatically',
      name: 'Default message',
      correlationId: '__EMPTY__',
    }
  }

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

  private setMessages(messages: Record<string, AsyncApiMessageMetadata>) {
    this.messages = messages
  }

  getChannels() {
    return this.channels
  }

  getMessages() {
    return this.messages
  }

  public exploreController(
    wrapper: InstanceWrapper<Controller>,
    modulePath?: string,
    globalPrefix?: string,
    operationIdFactory?: (controllerKey: string, methodKey: string) => string,
  ): AsyncApiChannels {
    if (operationIdFactory) {
      this.operationIdFactory = operationIdFactory
    }
    const { instance, metatype } = wrapper
    const prototype = Object.getPrototypeOf(instance)

    const scanResult = this.metadataScanner.scanFromPrototype<any, any>(
      instance,
      prototype,
      (name) => {
        const handler = prototype[name]
        const consumerMetadata = Reflect.getMetadata(
          DECORATORS.CONSUMER,
          handler,
        )
        const publisherMetadata = Reflect.getMetadata(
          DECORATORS.PUBLISHER,
          handler,
        )

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

    return prototype
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
}
