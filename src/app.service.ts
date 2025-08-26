import { Injectable } from '@nestjs/common';
import { IResponse } from './types/response';

@Injectable()
export class AppService {
  getHello(): IResponse<null> {
    return {
      success: true,
      message: 'Mini School Management  backend is running!',
      data: null,
    };
  }
}
