import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from './src/entities/user.entity';
import { UserSettings } from './src/entities/user-settings.entity';
import { MealRecord } from './src/entities/meal-record.entity';
import { Friendship } from './src/entities/friendship.entity';
import { MealShare } from './src/entities/meal-share.entity';
import { ShareTracking } from './src/entities/share-tracking.entity';
import { KakaoPlace } from './src/entities/kakao-place.entity';
import { LocationGroup } from './src/entities/location-group.entity';
import { UserLocation } from './src/entities/user-location.entity';
import { ExternalPlaceMapping } from './src/entities/external-place-mapping.entity';

// TypeORM CLI가 환경 변수를 올바르게 인식하도록 보장
if (
  !process.env.DB_HOST ||
  !process.env.DB_PORT ||
  !process.env.DB_USERNAME ||
  !process.env.DB_PASSWORD ||
  !process.env.DB_NAME
) {
  throw new Error(
    'Database configuration is incomplete. Please check your .env file.',
  );
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    User,
    UserSettings,
    MealRecord,
    Friendship,
    MealShare,
    ShareTracking,
    KakaoPlace,
    LocationGroup,
    UserLocation,
    ExternalPlaceMapping,
  ],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
