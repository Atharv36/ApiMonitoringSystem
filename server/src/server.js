import express from "express";
import cors from 'cors';
import helmet from "helmet";
import config from "./shared/config/index.js";
import logger from "./shared/config/logger.js";
import mongodb from "./shared/config/mongodb.js"
import postgres from "./shared/config/postgres.js";
import rabbitmq from "./shared/config/rabbitmq.js";
import errorHandler from "./shared/middlewares/errorHandler.js";
import ResponseFormatter from "./shared/utils/ResponseFormatter.js";

import cookieParser from "cookie-parser";

//Routers
import authRouter from "./services/auth/routes/authRouter.js";
import clientRouter from "./services/client/routes/clientRoute.js"
import ingestRouter from "./services/ingest/routes/ingestRoutes.js"
import analyticsRouter from "./services/analytics/routes/analyticsRoutes.js"


/***
 * TO INIT THE EXPRESS SERVER
 */

const app = express();
/***
 * To prevent XSS and similar attacks
 * Used as Middleware
 */

app.use((req, res, next) => {
    console.log("Incoming:", req.method, req.originalUrl);
    next();
});

app.use(helmet());
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
    logger.info(`${req.method} - ${req.path}`, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
    });
    next();
});


/***
 * Health Check Endpoint(if it can be accessed -> server is healthy)
 */
app.get('/health', (req, res) => {
    res.status(200).json(
        ResponseFormatter.success({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        }, "Service is Healthy"
        )
    )
})

app.get("/", (req, res) => {
    res.status(200).json(
        ResponseFormatter.success(
            {
                service: 'API Hit Monitoring System',
                version: '1.0',
                endpoints: {
                    health: '/health',
                    auth: '/api/auth',
                    ingest: '/api/hit',
                    analytics: '/api/analytics',

                }
            },
            "API Hit Monitoring System"
        )
    )
})

app.use("/api/auth", authRouter)
app.use("/api/hit", ingestRouter)
app.use("/api/analytics", analyticsRouter)
app.use("/api", clientRouter)


/***
 * 404 Handler
 */
app.use((req, res) => {
    res.status(404).json(ResponseFormatter.error(
        "Endpoint Not Found", 404
    ))
})

async function initConnection() {
    try {
        logger.info("Initializing DB Connections..");
        //connect to mongodb
        await mongodb.connect();

        //connect to postgress
        await postgres.testConnection();

        //connect to rabbitmq
        await rabbitmq.connect();
        logger.info("All connections established successfully")

    } catch (error) {
        logger.error("Failed to init connections");
        throw error

    }
}

async function startServer() {
    try {
        await initConnection();
        const server = app.listen(config.port, () => {
            logger.info(`Server started on port ${config.port}`)
            logger.info(`Environment ${config.node_env}`)
            logger.info(`API available at :http://localhost:${config.port}`)
        })

        const shutdown = async (signal) => {
            logger.info(`${signal} received , shutting down`)

            server.close(async () => {
                logger.info("SERVER CLOSED");
                try {
                    await mongodb.disconnect();
                    await postgres.close();
                    await rabbitmq.close();
                    logger.info("All Connections Closed , exiting process");
                    process.exit(0);


                } catch (error) {
                    logger.error("Error during shutdown", error);
                    process.exit(1);
                }
            })
            setTimeout(() => {
                logger.error("Forced Shutdown");
                process.exit(1);
            }, 10000)



        }
        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));

        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception', error);
            shutdown('uncaughtException')
        })
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection at: ', promise, 'reason :', reason);
            shutdown('unhandledRejection')
        })
    } catch (error) {
        logger.error("Failed To Start Server", error);
        process.exit(1);
    }
}
startServer();

app.use(errorHandler)