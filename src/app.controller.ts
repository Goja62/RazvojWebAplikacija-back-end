import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Hello Gojo';
  }

  @Get('jaca')
  getJaca(): string {
    return 'Zdravo Jaco';
  }
}
