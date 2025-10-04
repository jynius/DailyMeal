module.exports = {
  apps: [
    {
      name: 'dailymeal-backend',
      script: 'dist/main.js',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        PORT: 8000
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
      // 🔥 Hybrid 렌더링: Next.js 서버 (SSR + Static)
      name: 'dailymeal-frontend-hybrid',
      script: 'npm',
      args: 'run start:hybrid',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: '/api',
        NEXT_PUBLIC_SITE_URL: 'http://your-domain.com'
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