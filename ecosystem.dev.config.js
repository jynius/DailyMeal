// ==============================================
// DailyMeal Development PM2 Configuration
// ==============================================
//
// 사용법:
//   pm2 start ecosystem.dev.config.js
//   pm2 logs
//   pm2 restart all
//
// 환경 변수는 .env.local 파일에서 자동 로드됩니다.
// ==============================================

const fs = require('fs')
const path = require('path')

// .env.local 파일 읽기
function loadEnvFile(filePath) {
  const envVars = {}
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8')
    content.split('\n').forEach((line) => {
      // 주석과 빈 줄 제외
      line = line.trim()
      if (!line || line.startsWith('#')) return

      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim()
      }
    })
  }
  return envVars
}

const frontendEnv = loadEnvFile(path.join(__dirname, 'frontend', '.env.local'))

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
        // .env.local 파일에서 자동 로드
        ...frontendEnv,
      },
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
