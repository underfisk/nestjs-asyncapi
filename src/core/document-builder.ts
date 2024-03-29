import { Logger } from '@nestjs/common'
import { createContractBase } from '../fixtures/contract-fixture'
import { AsyncApiContract } from '../interfaces/async-api-contract.interface'
import { SecurityScheme } from '../interfaces/security-scheme.interface'
import { AsyncApiSecurityType } from '../enums/async-api-security-type.enum'
import { ApiServerOptions } from '../interfaces/api-server-options.interface'
import { AsyncApiOAuth2Flow } from '../interfaces/async-api-oauth2-flow.interface'
import { SecuritySchemeIn } from '../types/security-scheme-in.type'
import validator from 'validator'

/**
 * DocumentBuilder helps to create a new "contract/document" between nestjs applications and AsyncAPI
 * @see https://www.asyncapi.com/docs/getting-started/asyncapi-documents
 */
export class DocumentBuilder {
  private readonly logger = new Logger(DocumentBuilder.name)
  private readonly contract = createContractBase()

  public setTitle(title: string): DocumentBuilder {
    this.contract.info.title = title
    return this
  }

  public setId(id: string): DocumentBuilder {
    this.contract.id = id
    return this
  }

  public setDescription(description: string): DocumentBuilder {
    this.contract.info.description = description
    return this
  }

  public setVersion(version: string): DocumentBuilder {
    this.contract.info.version = version
    return this
  }

  public setTermsOfService(url: string): DocumentBuilder {
    if (!validator.isURL(url)) {
      throw new Error(`${url} is not a valid URL`)
    }
    this.contract.info.termsOfService = url
    return this
  }
  public setLicense(name: string, url: string): DocumentBuilder {
    if (!validator.isURL(url)) {
      throw new Error(`${url} is not a valid URL`)
    }
    this.contract.info.license = { name, url }
    return this
  }

  public setDefaultContentType(contentType: string): DocumentBuilder {
    this.contract.defaultContentType = contentType
    return this
  }

  public setContact(name: string, email: string, url: string): DocumentBuilder {
    if (!validator.isURL(url)) {
      throw new Error(`${url} is not a valid URL`)
    }
    if (!validator.isEmail(email)) {
      throw new Error(`${url} is not a valid email`)
    }
    this.contract.info.contact = { name, email, url }
    return this
  }

  /**
   * Binds a new server into our servers dictionary. If the name is specified twice
   * it will override the pre-existing one
   * @see https://www.asyncapi.com/docs/getting-started/servers
   * @param nameOrEnvironment
   * @param options
   */
  public addServer(
    nameOrEnvironment: string,
    options: ApiServerOptions,
  ): DocumentBuilder {
    if (!this.contract.servers) {
      this.contract.servers = {}
    }

    this.contract.servers[nameOrEnvironment] = options
    return this
  }

  public addSecurityScheme(
    name: string,
    scheme: SecurityScheme,
  ): DocumentBuilder {
    if (!this.contract.components.securitySchemes) {
      this.contract.components.securitySchemes = {}
    }

    this.contract.components.securitySchemes[name] = scheme
    return this
  }

  public addUserPasswordSecurityScheme(
    name = 'userPassword',
    description = '',
  ): DocumentBuilder {
    return this.addSecurityScheme(name, {
      type: AsyncApiSecurityType.UserPassword,
      description,
    })
  }

  public addApiKeySecurityScheme(
    name: string,
    $in: SecuritySchemeIn,
    description = '',
  ): DocumentBuilder {
    return this.addSecurityScheme(name, {
      type: AsyncApiSecurityType.ApiKey,
      in: $in,
      description,
    })
  }

  public addX509SecurityScheme(
    name: string,
    description = '',
  ): DocumentBuilder {
    return this.addSecurityScheme(name, {
      type: AsyncApiSecurityType.X509,
      description,
    })
  }

  public addSymmetricEncryptionSecurityScheme(
    name: string,
    description = '',
  ): DocumentBuilder {
    return this.addSecurityScheme(name, {
      type: AsyncApiSecurityType.SymmetricEncryption,
      description,
    })
  }

  /**
   * Add a Bearer or Basic http security, this is a shorthand but scheme is kept as a magic string
   * due to the fact Async API supports it that way and the developer might want to customize it
   * @param name
   * @param scheme
   * @param description
   */
  public addHTTPSecurityScheme(
    name: string,
    scheme: string,
    description = '',
  ): DocumentBuilder {
    return this.addSecurityScheme(name, {
      type: AsyncApiSecurityType.Http,
      scheme,
      description,
    })
  }

  public addHTTPApiKeySecurityScheme(
    name: string,
    $in: SecuritySchemeIn,
    keyName: string,
    description = '',
  ): DocumentBuilder {
    return this.addSecurityScheme(name, {
      type: AsyncApiSecurityType.HttpApiKey,
      name: keyName,
      description,
    })
  }

  public addJWTBearerSecurityScheme(
    name: string,
    description = '',
  ): DocumentBuilder {
    return this.addSecurityScheme(name, {
      type: AsyncApiSecurityType.Http,
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description,
    })
  }

  public addOAuth2SecurityScheme(
    name: string,
    flows: AsyncApiOAuth2Flow,
    description = '',
  ): DocumentBuilder {
    return this.addSecurityScheme(name, {
      type: AsyncApiSecurityType.OAuth2,
      flows,
      description,
    })
  }

  public build(): AsyncApiContract {
    return this.contract
  }
}
