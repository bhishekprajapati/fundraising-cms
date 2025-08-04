import { defaultLexical } from '@/fields/defaultLexical'
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import sharp from 'sharp' // sharp-import
import { fileURLToPath } from 'url'

import { CampaignCollectionConfig } from './collections/campaigns/'
import { DonationCollectionConfig } from './collections/donations/'
import { Media } from './collections/Media'
import { UserCollectionConfig } from './collections/users'
import { plugins } from './plugins'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  routes: {
    admin: '/backoffice',
  },
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard'],
      graphics: {
        Logo: {
          path: '@/components/brand#Logo',
          clientProps: {
            size: 72,
            style: {
              borderRadius: '50%',
            },
          },
        },
        Icon: {
          path: '@/components/brand#Logo',
          clientProps: {
            size: 36,
            style: {
              borderRadius: '50%',
            },
          },
        },
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: UserCollectionConfig.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
    meta: {
      titleSuffix: '- She Can Foundation',
      icons: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          url: 'favicon.ico',
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
  }),
  collections: [Media, UserCollectionConfig, CampaignCollectionConfig, DonationCollectionConfig],
  cors: [getServerSideURL()].filter(Boolean),
  plugins: [...plugins],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
  graphQL: {
    disable: true,
  },
})
