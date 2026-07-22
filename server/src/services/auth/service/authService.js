import AppError from "../../../shared/utils/AppError.js"
import jwt from "jsonwebtoken";
import config from "../../../shared/config/index.js";
import logger from "../../../shared/config/logger.js"
import bcrypt from "bcryptjs";
import {APPLICATION_ROLES} from "../../../shared/constants/roles.js"


export class AuthService {
    constructor(userRepository) {
        if (!userRepository) {
            throw new Error("UserRepository is Required");
        }
        this.userRepository = userRepository;
    };

    generateToken(user) {
        const { _id, email, username, role, clientId } = user;
        const payload = {
            userId: _id,
            username,
            email,
            role,
            clientId
        }
        return jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn
        })
    }

    formatUserForResponse(user) {
        const userObj = user.toObject ? user.toObject() : { ...user };
        delete userObj.password;
        return userObj;
    }

    async comparePassword(userEnteredPassword , hashedPassword) {
        return await bcrypt.compare(userEnteredPassword , hashedPassword)
    }


    async onboardSuperAdmin(superAdminData) {
        try {
            const exisitingUser = await this.userRepository.findAll();
            if (exisitingUser && exisitingUser.length > 0) {
                throw new AppError("Super Admin Onboarding is disabled", 403);
            }
            const user = await this.userRepository.create(superAdminData);
            const token = this.generateToken(user);
            
            logger.info("Admin Onboarded Successfully", {
                user:user.username
            })

            return {
                user :this.formatUserForResponse(user),
                token
            }



        } catch (error) {
            logger.error("Error in Admin Onboarding ", error);
            throw error;
        }
    };


    async register(userData) {
        
        try {
            const exisitingUser = await this.userRepository.findByUsername(userData.username);
            if (exisitingUser) {
                throw new AppError("Username already exists" , 409 )
            }

            const exisitingEmail = await this.userRepository.findByEmail(userData.email);
            if (exisitingEmail) {
                throw new AppError("Email already exists" , 409 )
            }

            const user = await this.userRepository.create(userData);

            const token = this.generateToken(user);
            
            logger.info("User Registered Successfully", {
                user:user.username
            }) 

            return {
                user :this.formatUserForResponse(user),
                token
            }


        } catch (error) {
            logger.error("Error in Register Service", error);
            throw error
        }
    };

    async login(username, password){
    try {
        const user = await this.userRepository.findByUsername(username);
        if (!user) {
            throw new AppError("Invalid Credentails", 401);
        };

        if (!user.isActive) {
            throw new AppError("Account is Deactivated", 403);
        }

        const isPasswordValid = await this.comparePassword(password, user.password);

        if (!isPasswordValid) return new AppError("Invalid Credentails", 401);
        const token = this.generateToken(user);
        logger.info("User Logged In Successfully", { username: user.username });

        return {
            user: this.formatUserForResponse(user),
            token:token
        }

    } catch (error) {
            logger.error("Error in Login  Service", error);
            throw error
    }
    }

    async getProfile(userId) {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new AppError("User Not Found", 404);
            }

            return this.formatUserForResponse(user);
        } catch (error) {
            logger.error("Error getting user profile",error)
        }
    }

    async checkSuperAdminPermissions(userId) {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new AppError("User Not Found ",404)
            }
            return user.role === APPLICATION_ROLES.SUPER_ADMIN
        } catch (error) {
            logger.error("Error checking SuperAdminPermission",error)

        }
    }


}