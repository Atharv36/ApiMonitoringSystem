import logger from "../config/logger.js";

/***
 * Request Logger Middleware -> Centralizes Request Logging
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`HTTP %s %s %s %dms`, req.method, req.originalUrl || req.url, req.ip || req.socket.remoteAddress, duration,
            {
                method: req.method,
                path: req.originalUrl || req.url,
                status: req.statusCode,
                duration
            })
    });
    next();        
}
export default requestLogger;