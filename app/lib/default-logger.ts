import { config } from '#app/config.js'
import { createLogger } from './logger'

export const logger = createLogger({ level: config.logLevel })
