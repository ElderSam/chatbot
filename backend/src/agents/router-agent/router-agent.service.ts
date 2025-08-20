import { Injectable } from '@nestjs/common';

@Injectable()
export class RouterAgentService {

  async route(message: string) {
    let result: any;
    let agent = 'unknown';

    result = 'Not implemented yet';

    return { agent, result };
  }
}
