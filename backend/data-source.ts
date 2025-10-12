import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

// .env 파일 로드
config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'dailymeal',
  entities: [__dirname + '/src/entities/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/src/db/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
