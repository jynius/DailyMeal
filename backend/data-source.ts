import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from './src/entities/user.entity';
import { UserSettings } from './src/entities/user-settings.entity';
import { MealRecord } from './src/entities/meal-record.entity';
import { Friendship } from './src/entities/friendship.entity';
import { MealShare } from './src/entities/meal-share.entity';
import { ShareTracking } from './src/entities/share-tracking.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
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
  ],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
