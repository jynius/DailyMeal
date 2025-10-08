module.exports = {
  apps: [
    {
      name: 'dailymeal-backend',
      script: 'npm',
      args: 'run start:dev',  // ← TypeScript watch 모드
      cwd: './backend',
      env: {
        NODE_ENV: 'development',
        PORT: 8000
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
        NODE_ENV: 'development',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://localhost:8000',
        NEXT_PUBLIC_SITE_URL: 'http://localhost:3000'
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