import { Module } from '@nestjs/common';
import { ThrService } from './thr.service';
import { ThrController } from './thr.controller';
import { PrismaModule } from '../common/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ThrController],
  providers: [ThrService],
  exports: [ThrService],
})
export class ThrModule {}
