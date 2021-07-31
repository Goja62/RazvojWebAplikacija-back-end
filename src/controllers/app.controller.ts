/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { AdministratorService } from '../services/administrator/administrator.service';

@Controller()
export class AppController {
  constructor(private administratorService: AdministratorService) {}
  
}
