import { Controller,Post, UseGuards, Request } from '@nestjs/common';
import { AnalystService } from './analyst.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('analyst')
@UseGuards(JwtAuthGuard)
export class AnalystController {
  constructor(private readonly analystService: AnalystService) {}

  

  @Post()
  getAnalyst(@Request() req: any) {
    const role = req.user.role;
    if (role == 'admin') {
      return this.analystService.getAnalyst();
    }
  }

 
}
