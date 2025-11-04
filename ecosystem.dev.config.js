// ==============================================
// DailyMeal Development PM2 Configuration
// ==============================================
//
// 사용법:
//   pm2 start ecosystem.dev.config.js
//   pm2 logs
//   pm2 restart all
//
// 환경 변수는 각 앱의 .env 파일에서 자동 로드됩니다.
// ==============================================
module.exports = {
  apps: [
    {
      name: 'dailymeal-backend',
      script: 'npm',
      args: 'run start:dev', // TypeScript watch 모드
      cwd: './backend',
      env: {
        NODE_ENV: 'development',
        PORT: 8000,
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false, // nest start --watch가 이미 파일 감지
      max_memory_restart: '1G',
      error_file: '../logs/pm2-backend-error.log',
      out_file: '../logs/pm2-backend-out.log',
      log_file: '../logs/pm2-backend-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '3s',
    },
    {
      name: 'dailymeal-frontend',
      script: 'npm',
      args: 'run dev', // Next.js dev 모드 (Hot Reload)
      cwd: './frontend',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_file: './.env.local', // .env.local 파일 자동 로드
      instances: 1,
      exec_mode: 'fork',
      watch: false, // Next.js가 이미 Hot Reload 처리
      max_memory_restart: '1G',
      error_file: '../logs/pm2-frontend-error.log',
      out_file: '../logs/pm2-frontend-out.log',
      log_file: '../logs/pm2-frontend-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '3s',
    },
  ],
}
