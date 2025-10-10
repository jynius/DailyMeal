module.exports = {
  apps: [
    {
      name: 'dailymeal-backend',
      script: 'dist/main.js',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_USERNAME: 'postgres',
        DB_PASSWORD: 'your_production_password_here',
        DB_NAME: 'dailymeal',
        JWT_SECRET: 'your_production_jwt_secret_change_this',
        ENCRYPTION_KEY: 'dailymeal-secret-key-32-chars!',
        FRONTEND_URL: 'https://ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com',
        API_BASE_URL: 'https://ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com/api',
        UPLOAD_DIR: './uploads',
        UPLOAD_MAX_FILE_SIZE: '5242880',
        UPLOAD_MAX_FILES: '5'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      // 🔥 프로덕션 프론트엔드: 빌드된 Next.js 서버
      name: 'dailymeal-frontend',
      script: 'npm',
      args: 'run start',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: '/api',
        NEXT_PUBLIC_SITE_URL: 'https://ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com',
        NEXT_PUBLIC_KAKAO_API_KEY : '197d152438e3a21af616caac12a6db11'
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
      min_uptime: '10s'
    }
  ]
};