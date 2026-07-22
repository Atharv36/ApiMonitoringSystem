import mongoose from "mongoose";
import config from "./index.js";
import logger from "./logger.js"; 


/***
 * MONGODB Database connector
 */
class MongoConnection {
    constructor() {
        this.connection = null;
    }
    /**
     * Connects to MongoDB
     * @returns {Promise<mongoose.Connections>}
     */
    async connect() {
        try {
            if (this.connection) {
                logger.info("MONGODB already connected")
                return this.connection
            }

            await mongoose.connect(config.mongo.uri, {
                dbName: config.mongo.dbName,
            });

            this.connection = mongoose.connection;

            logger.info(`MONGODB connected : ${config.mongo.uri}`)

            this.connection.on("error", error => {
                logger.error("MONGODB connection error", {error});
            })
            this.connection.on("disconnected", () => {
                logger.error("MONGODB disconnected");
            })
            return this.connection

        } catch (error) {   

                
            logger.error("Failed to connect to mongodb", error)
            throw error;

            
        }
    }

    /**
     * This helps to disconnect from MongoDB
     */
    async disconnect() {
        try {
            if (this.connection) {
                await mongoose.disconnect();
                this.connection = null;
                logger.info("MONGO Disconnected")
            }
        } catch (error) {
            logger.error("Failed to disconnect to mongodb", error)
            throw error;
        }
    }

    /**
     * This helps to getConnection from MongoDB
     * @returns {mongoose.Connection}
     */
    getConnection() {
        return this.connection;
    }
}



export default new MongoConnection()