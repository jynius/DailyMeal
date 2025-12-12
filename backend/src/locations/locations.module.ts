import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LocationsService } from './locations.service'
import { LocationsController } from './locations.controller'
import { LocationGroup } from '../entities/location-group.entity'
import { UserLocation } from '../entities/user-location.entity'
import { ExternalPlaceMapping } from '../entities/external-place-mapping.entity'

@Module({
  imports: [TypeOrmModule.forFeature([LocationGroup, UserLocation, ExternalPlaceMapping])],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
