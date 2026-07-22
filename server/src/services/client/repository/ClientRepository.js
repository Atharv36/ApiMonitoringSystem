import BaseClientRepository from "./BaseClientRepository.js";
import Client from "../../../shared/models/Client.js"
import logger from "../../../shared/config/logger.js";


class MongoClientRepository extends BaseClientRepository{
    constructor() {
        super(Client)
    }


    /**
     * Creates a new Client
     * @param {Object} clientData 
     * @returns {Promise<Object></Object>}
     */
    async create(clientData) {
        try {
            const client = new this.model(clientData);
            await client.save()
            
            logger.info('Client Created In MongoDB', {
                mongoId: client._id,
                slug: client.slug
            });
            return client;
        } catch (error) {
            logger.error('Error Creating Client in MongoDB', error);
            throw error;
        }
    };

    /**
     * Find a client by ID
     * @param {string} clientId - The ID of the client
     * @returns {Promise<Object|null>} - The client object or null if not found
     */
    async findById(clientId) {
        try {
                logger.info("Searching client", { clientId });

            const client = await this.model.findById(clientId);

            logger.info('Client details from MongoDB', client);
            logger.info("Found client", client);

            return client
        } catch (error) {
            logger.error('Error finding client in db by id', error);
            throw error
        }
    };

    /**
     * Find a client by slug
     * @param {string} slug - The slug of the client
     * @returns {Promise<Object|null>} - The client object or null if not found
     */
    async findBySlug(slug) {
        try {
            const client = await this.model.findOne({ slug });
            return client;
        } catch (error) {
            logger.error('Error finding client by slug:', error);
            throw error;
        }
    }

    /**
     * Find clients with filters and pagination
     * @param {Object} filters - Query filters
     * @param {Object} options - Query options (limit, skip, sort)
     * @returns {Promise<Object>}
     */
    async find(filters = {}, options = {}) {
        try {
            const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

            const clients = await this.model.find(filters)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .select('-__v');

            return clients;
        } catch (error) {
            logger.error('Error finding clients:', error);
            throw error;
        }
    }

    /**
     * Count clients matching filters
     * @param {Object} filters - Query filters
     * @returns {Promise<number>}
     */
    async count(filters = {}) {
        try {
            const count = await this.model.countDocuments(filters);
            return count;
        } catch (error) {
            logger.error('Error counting clients:', error);
            throw error;
        }
    }

    
}

export default new MongoClientRepository();