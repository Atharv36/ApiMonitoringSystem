import logger from "../../../shared/config/logger.js"
import { APPLICATION_ROLES, isValidClientRole } from "../../../shared/constants/roles.js";
import AppError from "../../../shared/utils/AppError.js";
import { v4  as uuidv4} from "uuid";
import crypto from "node:crypto";

export class ClientService{

    constructor(dependencies) {
        if (!dependencies) {
            throw new Error("Dependencies are required");
        };
        if (!dependencies.clientRepository) {
            throw new Error("Client Repository is required");
        }
        if (!dependencies.apiKeyRepository) {
            throw new Error("ApiKey Repository  is required");
        }
        if (!dependencies.userRepository) {
            throw new Error("User Repository is required");
        }

        this.clientRepository = dependencies.clientRepository
        this.apiKeyRepository = dependencies.apiKeyRepository
        this.userRepository = dependencies.userRepository
        
    }

    formatClientForResponse(user) {
        const userObj = user.toObject ? user.toObject() : { ...user };
        delete userObj.password;
        return userObj;
    }

    /**
     * Generate unique slug from name
     * @param {String} name - The name to generate the slug from
     * @returns {String} - The generated slug
     */
    generateSlug(name) {
        return name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
    }
    async createClient(clientData, adminUser) {
        try {
            const {name , email , description , website} = clientData
            
            const slug = this.generateSlug(name);

            const existingClient = await this.clientRepository.findBySlug(slug);

            if (existingClient) {
                throw new AppError(`Client with Slug ${slug} already exists`, 400);
            }
            const client = await this.clientRepository.create({
                name,
                slug,
                email,
                description,
                website,
                createdBy : adminUser.userId
            })

            return client;


        } catch (error) {
            logger.error("Error creating client",error)
            throw error
        }
    }

    canUserAccessClient(user, clientId) {
        if (user.role === APPLICATION_ROLES.SUPER_ADMIN) return true;
        return user.clientId && user.clientId.toString() === clientId.toString()
    }




    async createClientUser(clientId, userData, adminUser) {
        try {
            if (!this.canUserAccessClient(adminUser, clientId)) {
                throw new AppError("Access Denied", 403);
            }
            const { username, email, password, role = APPLICATION_ROLES.CLIENT_VIEWER } = userData;
            if (!isValidClientRole(role)) {
                throw new AppError("Invalid Role for Client User", 400);
            }

            const client = await this.clientRepository.findById(clientId);
            if (!client) {
                throw new AppError("Client Not Found", 404);
            };

            let permissions = {
                canCreateApiKeys: false,
                canManageUsers: false,
                canViewAnalytics: true,
                canExportData: false
            };

            if (role === APPLICATION_ROLES.CLIENT_ADMIN) {
                permissions = {
                canCreateApiKeys: true,
                canManageUsers: true,
                canViewAnalytics: true,
                canExportData: true
            };
            }

            const user = await this.userRepository.create({
                username,
                email,
                password,
                role,
                clientId,
                permissions
            });
            logger.info("Client User Created", {
                clientId,
                userId: user._id,
                role
            })

            return this.formatClientForResponse(user);



        } catch (error) {
            logger.error("Error in Creating Client User", error)
            throw error
        }
    }

    /**
     * Generate a new API key
     * @returns {String} - The generated API key
     */
    generateApiKey() {
    return `apim_${crypto.randomBytes(20).toString("hex")}`;
}

    async createApiKey(clientId, keyData, adminUser) {
        try {
            logger.info("clientId from request", { clientId });

            const client = await this.clientRepository.findById(clientId);

        if (!client) throw new AppError("Client Not Found", 404);
        if (!this.canUserAccessClient(adminUser, clientId)) {
            throw new AppError("Access Denied", 403);
        }
        if (!(adminUser.role === APPLICATION_ROLES.SUPER_ADMIN || adminUser.role === APPLICATION_ROLES.CLIENT_ADMIN) ) {
            throw new AppError("Access Denied -> Only Super Admin And Client Admin can create API keys",403)
        }
            


        const { name, description, environment = 'production' } = keyData
        
            const keyId = crypto.randomUUID();
            const keyValue = this.generateApiKey();
            
            const apiKey = await this.apiKeyRepository.create({
                keyId,
                keyValue,
                clientId,
                name,
                description,
                environment,
                createdBy: adminUser.userId
            });

            return apiKey;
        } catch (error) {
            logger.error("Error creating API key", error)
            throw error;
        }


    }


    async getClientApiKeys(clientId, user) {
        try {
            if (!this.canUserAccessClient(user, clientId)) {
                throw new AppError('Access denied to this client', 403);
            };

            const apiKeys = await this.apiKeyRepository.findByClientId(clientId);

            const formattedResponse = apiKeys.map(key => {
                const keyObj = key.toObject ? key.toObject() : key;
                delete keyObj.keyValue;
                return keyObj
            })

            return formattedResponse

        } catch (error) {
            logger.error('Error getting client API keys:', error);
            throw error;
        }
    };

    async getClientByApiKey(apiKey) {
        try {
            const key = await this.apiKeyRepository.findByKeyValue(apiKey);

            if (!key) {
                return null;
            }

            if (key.isExpired()) {
                return null;
            }

            // Get the populated client from the key
            const client = key.clientId;

            return {
                client,
                apiKey: key,
            };
        } catch (error) {
            logger.error('Error finding client by API key:', error);
            throw error;
        }
    }

    async getClientByApiKey(apiKey) {
        try {
            const key = await this.apiKeyRepository.findByKeyValue(apiKey);

            if (!key) {
                return null;
            }

            if (key.isExpired()) {
                return null;
            }

            // Get the populated client from the key
            const client = key.clientId;

            return {
                client,
                apiKey: key,
            };
        } catch (error) {
            logger.error('Error finding client by API key:', error);
            throw error;
        }
    }
}

