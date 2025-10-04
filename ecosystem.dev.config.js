module.exports = {
  apps: [
    {
      name: 'dailymeal-backend-dev',
      script: 'npm',
      args: 'run start:dev',
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
      error_file: './logs/pm2-dev-error.log',
      out_file: './logs/pm2-dev-out.log',
      log_file: './logs/pm2-dev-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '3s'
    },
    {
      name: 'dailymeal-frontend-dev',
      script: 'npm',
      args: 'run dev',
      cwd: './frontend',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://localhost:8000',
        NEXT_PUBLIC_SITE_URL: 'http://localhost:3000'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false, // Next.js가 자체 핫 리로딩 제공
      max_memory_restart: '1G',
      error_file: './logs/pm2-frontend-dev-error.log',
      out_file: './logs/pm2-frontend-dev-out.log',
      log_file: './logs/pm2-frontend-dev-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '3s'
    }
  ]
};