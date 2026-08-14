import winston from "winston";

import config from "./index.js";


/**
 * WINSTON LOGger CONFIGURATION
 */



const logger = winston.createLogger({
    level: config.node_env === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'api-monitoring' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log'}),
        
    ]
})


// Always log to stdout/stderr, not just in dev — on Render (and any other
// container host), file transports write inside the ephemeral container's
// filesystem, which the platform's log viewer never sees. Without this,
// startup crashes are completely invisible in production.
logger.add(new winston.transports.Console({
    format: config.node_env !== 'production'
        ? winston.format.combine(winston.format.colorize(), winston.format.simple())
        : winston.format.simple(),
}))


export default logger;