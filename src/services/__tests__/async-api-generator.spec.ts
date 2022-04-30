import { ContractBuilder } from '../../core/contract-builder'
import { AsyncApiGenerator } from '../async-api-generator'

describe('AsyncApiGenerator', () => {
  const generator = new AsyncApiGenerator()
  it('should generate the documentation files', async () => {
    const contract = new ContractBuilder()
      .setTitle('Jest app')
      .setDescription('Test app')
      .setVersion('1.0.0')
      .addUserPasswordSecurityScheme('DefaultUserPwd')
      .addOAuth2SecurityScheme('OAuth2', {
        implicit: {
          authorizationUrl: 'https://example.com/api/oauth/dialog',
          scopes: {
            'app:write': 'permission to modify',
            'app:read': 'read permission',
          },
        },
      })
      .addServer('production', {
        url: 'mqtt://localhost:123456',
        protocol: 'mqtt',
        description: 'Rabbitmq test',
        security: [
          { DefaultUserPwd: [] },
          { OAuth2: ['app:write', 'app:read'] },
        ],
      })
      .setLicense('MIT', 'https://mywebsite.com')
      .build()

    /** @todo Remove this and messages, will be replaced with reflection **/
    contract.channels = {
      signUp: {
        subscribe: {
          summary: 'Test',
          message: {
            $ref: '#/components/messages/signupMessage',
          },
        },
      },
    } as any

    contract['components'] = {
      ...contract['components'],
      messages: {
        signupMessage: {
          payload: {
            type: 'object',
            properties: {
              displayName: {
                type: 'string',
                description: 'The user name',
              },
            },
          },
        },
      },
    }

    const result = await generator.generate(contract)
    expect(result).toBeDefined()
  }, 999999)
})
