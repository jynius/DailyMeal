import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { LocationGroup } from '../entities/location-group.entity'
import { UserLocation } from '../entities/user-location.entity'
import { ExternalPlaceMapping, ExternalPlatform } from '../entities/external-place-mapping.entity'

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(LocationGroup)
    private locationGroupRepository: Repository<LocationGroup>,
    @InjectRepository(UserLocation)
    private userLocationRepository: Repository<UserLocation>,
    @InjectRepository(ExternalPlaceMapping)
    private externalPlaceMappingRepository: Repository<ExternalPlaceMapping>
  ) {}

  /**
   * 사용자의 모든 식당 목록 조회
   */
  async getUserLocations(userId: string): Promise<UserLocation[]> {
    return this.userLocationRepository.find({
      where: { userId },
      relations: ['locationGroup', 'locationGroup.externalMappings'],
      order: { createdAt: 'DESC' },
    })
  }

  /**
   * 특정 UserLocation 조회
   */
  async getUserLocation(userId: string, locationId: string): Promise<UserLocation> {
    const location = await this.userLocationRepository.findOne({
      where: { id: locationId, userId },
      relations: ['locationGroup', 'locationGroup.externalMappings'],
    })

    if (!location) {
      throw new NotFoundException('Location not found')
    }

    return location
  }

  /**
   * 새 식당 추가 또는 기존 식당 연결
   * - 외부 플랫폼 ID가 있으면 기존 LocationGroup 찾기
   * - 좌표가 있으면 근처 LocationGroup 찾기 (50m 이내)
   * - 없으면 새 LocationGroup 생성
   */
  async createUserLocation(params: {
    userId: string
    name: string
    address?: string
    latitude?: number
    longitude?: number
    externalPlatform?: ExternalPlatform
    externalId?: string
    externalName?: string
    externalData?: Record<string, unknown>
    notes?: string
  }): Promise<UserLocation> {
    const {
      userId,
      name,
      address,
      latitude,
      longitude,
      externalPlatform,
      externalId,
      externalName,
      externalData,
      notes,
    } = params

    let locationGroup: LocationGroup | null = null

    // 1. 외부 플랫폼 ID로 기존 LocationGroup 찾기
    if (externalPlatform && externalId) {
      const mapping = await this.externalPlaceMappingRepository.findOne({
        where: { platform: externalPlatform, externalId },
        relations: ['locationGroup'],
      })

      if (mapping) {
        locationGroup = mapping.locationGroup
      }
    }

    // 2. 좌표로 근처 LocationGroup 찾기 (50m 이내)
    if (!locationGroup && latitude && longitude) {
      const nearbyGroups = await this.findNearbyLocationGroups(latitude, longitude, 50)
      if (nearbyGroups.length > 0) {
        locationGroup = nearbyGroups[0]
      }
    }

    // 3. LocationGroup이 없으면 새로 생성
    if (!locationGroup) {
      locationGroup = this.locationGroupRepository.create({
        canonicalName: externalName || name,
        latitude: latitude || 0,
        longitude: longitude || 0,
        address,
      })
      await this.locationGroupRepository.save(locationGroup)

      // 외부 플랫폼 매핑도 생성
      if (externalPlatform && externalId && externalName) {
        const mapping = this.externalPlaceMappingRepository.create({
          locationGroupId: locationGroup.id,
          platform: externalPlatform,
          externalId,
          externalName,
          externalData,
        })
        await this.externalPlaceMappingRepository.save(mapping)
      }
    }

    // 4. 기존에 이 사용자가 같은 locationGroup에 대한 UserLocation이 있는지 확인
    const existingUserLocation = await this.userLocationRepository.findOne({
      where: { userId, locationGroupId: locationGroup.id },
    })

    if (existingUserLocation) {
      return existingUserLocation
    }

    // 5. UserLocation 생성
    const userLocation = this.userLocationRepository.create({
      userId,
      locationGroupId: locationGroup.id,
      name,
      address,
      latitude,
      longitude,
      isCustom: !externalPlatform,
      notes,
    })

    return this.userLocationRepository.save(userLocation)
  }

  /**
   * UserLocation 업데이트 (사용자 개인화 정보만)
   */
  async updateUserLocation(
    userId: string,
    locationId: string,
    updates: {
      name?: string
      notes?: string
    }
  ): Promise<UserLocation> {
    const location = await this.getUserLocation(userId, locationId)

    if (updates.name !== undefined) {
      location.name = updates.name
    }
    if (updates.notes !== undefined) {
      location.notes = updates.notes
    }

    return this.userLocationRepository.save(location)
  }

  /**
   * UserLocation 삭제
   */
  async deleteUserLocation(userId: string, locationId: string): Promise<void> {
    const location = await this.getUserLocation(userId, locationId)
    await this.userLocationRepository.remove(location)
  }

  /**
   * 근처 LocationGroup 찾기 (Haversine 공식)
   */
  async findNearbyLocationGroups(
    latitude: number,
    longitude: number,
    radiusInMeters: number = 50
  ): Promise<any[]> {
    const result = await this.locationGroupRepository.query(
      `
      SELECT id, "canonicalName", latitude, longitude, address, category,
        (6371000 * acos(
          cos(radians($1)) * cos(radians(latitude::float)) * 
          cos(radians(longitude::float) - radians($2)) + 
          sin(radians($1)) * sin(radians(latitude::float))
        )) AS distance
      FROM location_groups
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      ORDER BY distance
      LIMIT 10
      `,
      [latitude, longitude]
    )

    return (
      result as Array<{
        id: string
        canonicalName: string
        latitude: string
        longitude: string
        address: string
        category: string
        distance: number
      }>
    )
      .filter((row) => row.distance <= radiusInMeters)
      .map((row) => ({
        id: row.id,
        canonicalName: row.canonicalName,
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
        address: row.address,
        category: row.category,
      }))
  }

  /**
   * 친구들이 방문한 식당 추천
   * - 친구가 방문한 LocationGroup 중 내가 방문하지 않은 곳
   * - 각 LocationGroup에 방문한 친구 수 포함
   */
  async getFriendRecommendations(
    userId: string,
    friendIds: string[]
  ): Promise<
    Array<{
      locationGroup: LocationGroup
      friendCount: number
      friendNames: string[]
      myName?: string
    }>
  > {
    if (friendIds.length === 0) {
      return []
    }

    // 1. 내가 방문한 LocationGroup IDs
    const myLocations = await this.userLocationRepository.find({
      where: { userId },
      select: ['locationGroupId'],
    })
    const myLocationGroupIds = myLocations.map((loc) => loc.locationGroupId)

    // 2. 친구들이 방문한 LocationGroup (내가 방문하지 않은 곳)
    const friendLocations = await this.userLocationRepository
      .createQueryBuilder('ul')
      .leftJoinAndSelect('ul.locationGroup', 'lg')
      .leftJoinAndSelect('ul.user', 'user')
      .where('ul.userId IN (:...friendIds)', { friendIds })
      .andWhere('ul.locationGroupId NOT IN (:...myLocationGroupIds)', {
        myLocationGroupIds:
          myLocationGroupIds.length > 0
            ? myLocationGroupIds
            : ['00000000-0000-0000-0000-000000000000'],
      })
      .getMany()

    // 3. LocationGroup별로 그룹화
    const groupedByLocation = new Map<
      string,
      {
        locationGroup: LocationGroup
        friends: Array<{ id: string; name: string }>
      }
    >()

    for (const ul of friendLocations) {
      const groupId = ul.locationGroupId
      if (!groupedByLocation.has(groupId)) {
        groupedByLocation.set(groupId, {
          locationGroup: ul.locationGroup,
          friends: [],
        })
      }
      groupedByLocation.get(groupId)!.friends.push({
        id: ul.userId,
        name: ul.user?.name || 'Unknown',
      })
    }

    // 4. 결과 포맷팅 및 정렬 (친구 수 많은 순)
    const recommendations = Array.from(groupedByLocation.values())
      .map((item) => ({
        locationGroup: item.locationGroup,
        friendCount: item.friends.length,
        friendNames: item.friends.map((f) => f.name),
      }))
      .sort((a, b) => b.friendCount - a.friendCount)

    return recommendations
  }

  /**
   * 외부 플랫폼에서 식당 정보 조회
   */
  async getExternalPlaceMapping(
    platform: ExternalPlatform,
    externalId: string
  ): Promise<ExternalPlaceMapping | null> {
    return this.externalPlaceMappingRepository.findOne({
      where: { platform, externalId },
      relations: ['locationGroup'],
    })
  }

  /**
   * LocationGroup 조회 (ID)
   */
  async getLocationGroup(locationGroupId: string): Promise<LocationGroup> {
    const group = await this.locationGroupRepository.findOne({
      where: { id: locationGroupId },
      relations: ['userLocations', 'externalMappings'],
    })

    if (!group) {
      throw new NotFoundException('Location group not found')
    }

    return group
  }

  /**
   * 같은 LocationGroup을 방문한 사용자들 조회
   */
  async getUsersWhoVisited(locationGroupId: string): Promise<
    Array<{
      userId: string
      userName: string
      visitCount: number
    }>
  > {
    const userLocations = await this.userLocationRepository
      .createQueryBuilder('ul')
      .leftJoinAndSelect('ul.user', 'user')
      .leftJoin('ul.mealRecords', 'meal')
      .where('ul.locationGroupId = :locationGroupId', { locationGroupId })
      .select(['ul.userId', 'user.name', 'COUNT(meal.id) as visitCount'])
      .groupBy('ul.userId, user.name')
      .orderBy('visitCount', 'DESC')
      .getRawMany()

    return userLocations.map((row) => ({
      userId: row.ul_userId,
      userName: row.user_name,
      visitCount: parseInt(row.visitCount, 10),
    }))
  }
}
