import { Module } from '@nestjs/common';
import { RealTimeGateway } from './realtime.gateway';
import { RealTimeService } from './realtime.service';

@Module({
  providers: [RealTimeGateway, RealTimeService],
  exports: [RealTimeGateway, RealTimeService],
})
export class RealTimeModule {}
