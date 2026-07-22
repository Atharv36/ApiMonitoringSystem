//global level config

import dotenv from "dotenv"

dotenv.config();

const config = {
    //server
    node_env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || "5000"),

    //MongoDb
    mongo: {
        uri: process.env.MONGO_URI ,
        // uri: process.env.MONGO_URI || 'mongodb://localhost:27017/api_monitoring',
        dbName: process.env.MONGO_DB_NAME || 'api_monitoring'
    },

    //postgres
    postgres: {
        host: process.env.PG_HOST || 'localhost',
        port: parseInt(process.env.PG_PORT || '5432'),
        database: process.env.PG_DATABASE || 'api_monitoring',
        user: process.env.PG_USER || 'postgres',
        password: process.env.PG_PASSWORD || 'atharv',
    },

    //RabbitMQ
    rabbitmq: {
        url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
        queue: process.env.RABBITMQ_QUEUE || 'api_hits',
        publisherConfirms: process.env.RABBITMQ_PUBLISHER_CONFIRMS === 'true' || false,
        retryAttempts: parseInt(process.env.RABBITMQ_RETRY_ATTEMPTS || '3'),
        retryDelay: process.env.RABBITMQ_RETRY_DELAY || '1000',

        
    },

    jwt: {
        secret: process.env.JWT_SECRET || "nasdljnsadanwofawifhnaonfjsndvjsbjkeabn",
        expiresIn : process.env.JWT_EXPIRES_IN || '24h'
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), //15min
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000',10) // 1000req/15min per IP
        
    },

    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expiresIn:24*60*60*1000
    }


    



}


// export default config; 
export default Object.freeze(config);

