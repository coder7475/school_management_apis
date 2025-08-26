import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { type IResponse } from './types/response';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): IResponse<null> {
    return this.appService.getHello();
  }
}
