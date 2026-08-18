import ResponseFormatter from "../../../shared/utils/ResponseFormatter.js";

export class ClientController{
    constructor(clientService , authService) {
        if (!clientService) {
            throw new Error("ClientService is required")
        }
        if (!authService) {
            throw new Error("AuthService is required")
        }
        this.clientService = clientService;
        this.authService = authService;
    }

    async createClient(req, res, next) {
        try {
            const isSuperAdmin = await this.authService.checkSuperAdminPermissions(req.user.userId)
            if (!isSuperAdmin) {
                return res.status(403).json(ResponseFormatter.error("Acess Denied",403))
            }
            const client = await this.clientService.createClient(req.body, req.user);

            return res.status(201).json(ResponseFormatter.success(client ,"Client Created Successfully" , 201))
        
        } catch (error) {
            next(error)
        }
    }

    /**
     * 
     * @param {Request} req 
     * @param {Response} res 
     * @param {*} next 
     * @returns 
     */
    async createClientUser(req, res, next) {
        try {
            const { clientId } = req.params;
            const user = await this.clientService.createClientUser(clientId , req.body,req.user)

            return res.status(201).json(ResponseFormatter.success(user ,"Client User Created Successfully" , 201))
        
        } catch (error) {
            next(error)
        }
    }

    /**
     * 
     * @param {Request} req 
     * @param {Response} res 
     * @param {*} next 
     * @returns 
     */
    async createApiKey(req, res, next) {
        try {
            const { clientId } = req.params;
            const apiKey = await this.clientService.createApiKey(clientId, req.body, req.user);

            return res.status(201).json(ResponseFormatter.success(apiKey ,"API key Created Successfully" , 201))
        
        } catch (error) {
            next(error)
        }
    }

    async getClientApiKeys(req, res, next) {
        try {
            const { clientId } = req.params;
            const apiKey = await this.clientService.getClientApiKeys(clientId, req.user)
            return res.status(200).json(ResponseFormatter.success(apiKey, "API key fetched successfully", 200))
        } catch (error) {
            next(error)
        }
    }

    async deactivateApiKey(req, res, next) {
        try {
            const { clientId, apiKeyId } = req.params;
            const apiKey = await this.clientService.deactivateApiKey(clientId, apiKeyId, req.user);
            return res.status(200).json(ResponseFormatter.success(apiKey, "API key deactivated successfully", 200))
        } catch (error) {
            next(error)
        }
    }
}



