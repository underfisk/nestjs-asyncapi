import { AsyncApiChannels } from '../interfaces/async-api-channels.interface'
import { DenormalizedDoc } from '../interfaces/doc/denormalized-doc.interface'
import { AsyncApiChannel } from '../interfaces/async-api-channel.interface'

export class AsyncApiTransformer {
  public normalizeChannels(
    denormalizedDocs: DenormalizedDoc[],
  ): Record<'channels', AsyncApiChannels> {
    const flatChannels = denormalizedDocs.map((d: DenormalizedDoc) => {
      const key = d.root.name
      const value = {
        description: d.root.description,
        bindings: d.root.bindings,
        parameters: d.root.parameters,
        subscribe: d.operations.sub,
        publish: d.operations.pub,
      } as AsyncApiChannel
      return { key, value }
    })
    const channels = flatChannels.reduce((acc, it) => {
      acc[it.key] = it.value
      return acc
    }, {})

    return { channels: channels }
  }
}
