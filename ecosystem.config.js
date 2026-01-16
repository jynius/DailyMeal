module.exports = {
  apps: [
    {
      name: 'dailymeal-backend',
      script: 'dist/src/main.js',
      cwd: './backend',
      env_file: '.env', // .env 파일 자동 로드
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/data/logs/dailymeal/pm2-backend-error.log',
      out_file: '/data/logs/dailymeal/pm2-backend-out.log',
      log_file: '/data/logs/dailymeal/pm2-backend-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
    {
      // 🔥 프로덕션 프론트엔드: Standalone 빌드 실행
      name: 'dailymeal-frontend',
      script: 'server.js',  // Standalone 빌드가 생성한 서버
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
        HOSTNAME: '0.0.0.0',
        PORT: 3000,
        // ⚠️ NEXT_PUBLIC_* 환경 변수는 빌드 시점에 번들에 포함됨
        // npm run build 전에 frontend/.env.production 파일 설정 필수
        // 런타임에서는 변경 불가능 (재빌드 필요)
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/data/logs/dailymeal/pm2-frontend-error.log',
      out_file: '/data/logs/dailymeal/pm2-frontend-out.log',
      log_file: '/data/logs/dailymeal/pm2-frontend-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
}
