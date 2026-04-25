import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api/send-reservation-email' && req.method === 'POST') {
            // Parse JSON body
            let body = ''
            for await (const chunk of req) {
              body += chunk
            }

            try {
              const formData = JSON.parse(body)

              // Dynamically import the handler
              const handlerPath = path.resolve(__dirname, 'api/send-reservation-email.js')
              const handlerUrl = `file://${handlerPath.replace(/\\/g, '/')}?t=${Date.now()}`

              // Clear module cache for hot reload
              delete require.cache[handlerPath]

              const { default: handler } = await import(handlerUrl)

              // Create request/response shims for the Vercel-style handler
              const reqShim = {
                method: req.method,
                body: formData,
                headers: req.headers
              }

              let statusCode = 200

              const resShim = {
                setHeader: (name: string, value: string) => {
                  res.setHeader(name, value)
                  return resShim
                },
                status: (code: number) => {
                  statusCode = code
                  return resShim
                },
                json: (data: any) => {
                  res.statusCode = statusCode
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify(data))
                  return resShim
                },
                end: () => {
                  res.statusCode = statusCode
                  res.end()
                  return resShim
                }
              }

              await handler(reqShim, resShim)

            } catch (error: any) {
              console.error('[Local API] Error:', error)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: error.message }))
            }
            return
          }
          next()
        })
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    hmr: {
      timeout: 30000,
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    force: true,
  },
})
