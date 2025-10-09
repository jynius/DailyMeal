require('dotenv').config({ path: './backend/.env' });
require('dotenv').config({ path: './frontend/.env.local' });

module.exports = {
  apps: [
    {
      name: 'dailymeal-backend',
      script: 'npm',
      args: 'run start:dev',  // ← TypeScript watch 모드
      cwd: './backend',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: process.env.PORT || 8000,
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_USERNAME: process.env.DB_USERNAME,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_NAME: process.env.DB_NAME,
        JWT_SECRET: process.env.JWT_SECRET,
        ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
        FRONTEND_URL: process.env.FRONTEND_URL,
        API_BASE_URL: process.env.API_BASE_URL,
        UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
        UPLOAD_MAX_FILE_SIZE: process.env.UPLOAD_MAX_FILE_SIZE || '5242880',
        UPLOAD_MAX_FILES: process.env.UPLOAD_MAX_FILES || '5'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: true,
      ignore_watch: ['node_modules', 'logs', 'uploads', 'dist'],
      watch_options: {
        followSymlinks: false
      },
      max_memory_restart: '1G',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '3s'
    },
    {
      name: 'dailymeal-frontend',
      script: 'npm',
      args: 'run dev',  // ← Next.js dev 모드 (Hot Reload)
      cwd: './frontend',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        NEXT_PUBLIC_KAKAO_MAP_API_KEY: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/pm2-frontend-error.log',
      out_file: './logs/pm2-frontend-out.log',
      log_file: './logs/pm2-frontend-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '3s'
    }
  ]
};