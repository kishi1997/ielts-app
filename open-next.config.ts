import { defineCloudflareConfig } from '@opennextjs/cloudflare'

// Free Plan: D1 and Workers Static Assets only. No R2-backed incremental cache.
export default defineCloudflareConfig({})
