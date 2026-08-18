import MongoClientRepository from "../repository/ClientRepository.js";
import MongoApiKeyRepository from "../repository/ApiKeyRepository.js"
import MongoUserRepository from "../../auth/repository/UserRepository.js"
import { ClientService } from "../services/clientService.js";
import { ClientController } from "../controller/clientController.js";
import authContainer from "../../auth/Dependencies/dependencies.js"



class Container{
    static init() {
        const repositories = {
            clientRepository : MongoClientRepository,
            apiKeyRepository : MongoApiKeyRepository,
            userRepository: MongoUserRepository
        };
        const services = {
            clientServices: new ClientService({
                clientRepository: repositories.clientRepository,
                apiKeyRepository: repositories.apiKeyRepository,
                userRepository: repositories.userRepository,
            })
        };
        const controllers = {
            clientController : new ClientController(services.clientServices , authContainer.services.authService)
        }
        return {
            repositories,services,controllers
        }
    }
}

const initialized = Container.init()
export { Container };
export default initialized
