import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const zhipuApiKey = (env.ZHIPU_API_KEY ?? env.VITE_ZHIPU_API_KEY ?? '').trim();

  return {
    envPrefix: ['VITE_ROUTE_'],
    plugins: [
      react(),
      {
        name: 'zhipu-proxy-key-check',
        configureServer(server) {
          server.middlewares.use('/api/zhipu', (_request, response, next) => {
            if (!zhipuApiKey) {
              response.statusCode = 500;
              response.setHeader('Content-Type', 'application/json; charset=utf-8');
              response.end(
                JSON.stringify({
                  error: {
                    message:
                      '未配置智谱 API Key。请在项目根目录 .env.local 中设置 ZHIPU_API_KEY，并重启开发服务器。',
                  },
                }),
              );
              return;
            }

            next();
          });
        },
      },
    ],
    server: {
      proxy: {
        '/api/zhipu': {
          target: 'https://open.bigmodel.cn',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/zhipu/, '/api/paas/v4'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyRequest) => {
              proxyRequest.setHeader('Authorization', `Bearer ${zhipuApiKey}`);
            });
          },
        },
      },
    },
  };
});
