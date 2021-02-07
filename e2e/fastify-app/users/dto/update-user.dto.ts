import { AsyncMessage } from '../../../../src/decorators/async-message.decorator'
import { AsyncProperty } from '../../../../src/decorators/async-property.decorator'

@AsyncMessage({ description: 'Dto to update our user' })
export class UpdateUserDto {
  @AsyncProperty({ description: 'Unique identifier', type: String })
  id: string
}
