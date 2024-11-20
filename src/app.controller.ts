import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return { message: 'Welcome to the Foreign Exchange Query Language Parser API!' };
  }
}
