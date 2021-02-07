import { Controller } from '@nestjs/common'
import { AsyncConsumer } from '../../../src/decorators/async-consumer.decorator'
import { UpdateUserDto } from './dto/update-user.dto'
import { AsyncPublisher } from '../../../src/decorators/async-publisher.decorator'

@Controller()
export class UserController {
  @AsyncConsumer('users/update', UpdateUserDto)
  handleUserUpdate(dto: UpdateUserDto) {
    console.log(dto)
  }

  @AsyncConsumer('users/changed', undefined)
  @AsyncPublisher('users/reviewed', undefined)
  handleSomethingAndPublish() {
    console.log('test')
  }
}
