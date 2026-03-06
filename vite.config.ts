import {defineConfig, type Plugin} from 'vite'
import react from '@vitejs/plugin-react'
import {VitePWA} from 'vite-plugin-pwa'
import matter from 'gray-matter'
import {promises as fs} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const postsDir = path.resolve(__dirname, 'src/posts')

type PostMeta = {
  title: string
  date?: string
  summary?: string
  tags?: string[]
}

type ApiPost = {
  slug: string
  meta: PostMeta
  content: string
}

async function readAllPosts(): Promise<ApiPost[]> {
  const files = await fs.readdir(postsDir)
  const markdownFiles = files.filter((file) => file.endsWith('.md'))

  const posts = await Promise.all(
    markdownFiles.map(async (file) => {
      const raw = await fs.readFile(path.join(postsDir, file), 'utf-8')
      const {data, content} = matter(raw)
      const slug = file.replace(/\.md$/, '')

      return {
        slug,
        meta: {
          title: typeof data.title === 'string' ? data.title : slug,
          date: typeof data.date === 'string' ? data.date : undefined,
          summary: typeof data.summary === 'string' ? data.summary : undefined,
          tags: Array.isArray(data.tags)
            ? data.tags.filter((tag): tag is string => typeof tag === 'string')
            : undefined,
        },
        content,
      }
    }),
  )

  posts.sort((a, b) => (b.meta.date ?? '').localeCompare(a.meta.date ?? ''))
  return posts
}

function blogStaticApiPlugin(): Plugin {
  async function getApiPayload(pathname: string): Promise<string | null> {
    const posts = await readAllPosts()

    if (pathname === '/api/posts.json') {
      return JSON.stringify(posts, null, 2)
    }

    const slugMatch = pathname.match(/^\/api\/posts\/([^/]+)\.json$/)
    if (!slugMatch) {
      return null
    }

    const slug = decodeURIComponent(slugMatch[1])
    const post = posts.find((entry) => entry.slug === slug)

    if (!post) {
      return JSON.stringify({message: 'Post not found'}, null, 2)
    }

    return JSON.stringify(post, null, 2)
  }

  return {
    name: 'blog-static-api',

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split('?')[0] ?? ''
        const payload = await getApiPayload(pathname)

        if (payload === null) {
          next()
          return
        }

        const isMissingPost = pathname.startsWith('/api/posts/') && payload.includes('"Post not found"')
        res.statusCode = isMissingPost ? 404 : 200
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(payload)
      })
    },

    async generateBundle() {
      const posts = await readAllPosts()

      this.emitFile({
        type: 'asset',
        fileName: 'api/posts.json',
        source: JSON.stringify(posts, null, 2),
      })

      for (const post of posts) {
        this.emitFile({
          type: 'asset',
          fileName: `api/posts/${post.slug}.json`,
          source: JSON.stringify(post, null, 2),
        })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    blogStaticApiPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Tami Site',
        short_name: 'TamiSite',
        description: 'Personal website and markdown-based blog.',
        theme_color: '#111111',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,md}'],
        runtimeCaching: [
          {
            urlPattern: ({request}) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
            },
          },
          {
            urlPattern: ({request}) =>
              ['style', 'script', 'worker'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'asset-cache',
            },
          },
          {
            urlPattern: ({request}) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
