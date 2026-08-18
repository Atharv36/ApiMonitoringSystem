//Interface

export default class BaseRepository{
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        throw new Error("Method Not Implemented")
    }

    async findById(id) {
        throw new Error("Method Not Implemented")
    }

    async findByUsername(username) {
        throw new Error("Method Not Implemented")
    }

    async findByEmail(email) {
        throw new Error("Method Not Implemented")
    }

    async findAll() {
        throw new Error("Method Not Implemented")
    }
    
    
}

