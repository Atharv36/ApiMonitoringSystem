export default class BaseApiKeyRepository{
    constructor(model) {
        this.model = model;
    }
    async create(apiKeyData) {
        throw new Error("Method Not Implemented");
    }
    async findByKeyValue(keyValue , includeInactive) {
        throw new Error("Method Not Implemented");
    }
    async findByClientId(clientId , filters) {
        throw new Error("Method Not Implemented");
    }
    async countByClientId(clientId , filters) {
        throw new Error("Method Not Implemented");
    }
    


}