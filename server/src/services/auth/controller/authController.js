import { APPLICATION_ROLES } from "../../../shared/constants/roles.js";
import config from "../../../shared/config/index.js";
import ResponseFormatter from "../../../shared/utils/ResponseFormatter.js";

export class AuthController{
    constructor(authService) {
        if (!authService) {
            throw new Error("userService is required")
        }
        this.authService = authService;
    };

    async onboardSuperAdmin(req,res,next) {
        try {
            const { username, email, password } = req.body;
            const superAdminData = {
                username, email, password, role: APPLICATION_ROLES.SUPER_ADMIN
            };

            const {user,token} = await this.authService.onboardSuperAdmin(superAdminData);

            res.cookie("authToken", token, {
                httpOnly: config.cookie.httpOnly,
                secure: config.cookie.secure,
                sameSite: config.cookie.sameSite,
                maxAge: config.cookie.expiresIn
            });

            res.status(201).json(ResponseFormatter.success(user,"Super Admin Created Successfully",201))
        } catch (error) {
            next(error)
        }
    };


    async register(req, res, next) {
        try {
        
            const { username, email, role, password } = req.body
            
            const userData = {
                username, email, password, role: role || APPLICATION_ROLES.CLIENT_VIEWER
            };

            const { token, user } = await this.authService.register(userData);
            res.cookie("authToken", token, {
                httpOnly: config.cookie.httpOnly,
                secure: config.cookie.secure,
                sameSite: config.cookie.sameSite,
                maxAge: config.cookie.expiresIn
            });

            res.status(201).json(ResponseFormatter.success(user , "User Created Successfully" ,201))
        
        } catch (error) {
            next(error)
        }
    };

    async login(req, res, next) {
        try {
            const { username, password } = req.body;
            const { user, token } = await this.authService.login(username, password);
            res.cookie("authToken", token, {
                httpOnly: config.cookie.httpOnly,
                secure: config.cookie.secure,
                sameSite: config.cookie.sameSite,
                maxAge: config.cookie.expiresIn
            });

            res.status(200).json(ResponseFormatter.success(user , "Logged In Successfully" ,200))
        
        } catch (error) {
            next(error)
        }
    }

    async getProfile(req, res, next) {
        try {
            const userId = req.user.userId;
            const result = await this.authService.getProfile(userId);
            res.status(200).json(ResponseFormatter.success(result ,"Profile Fetched Successfully",200))
        } catch (error) {
            next(error)
        }
    }

    async logout(req, res, next) {
        try {
            res.clearCookie("authToken", {
                httpOnly: config.cookie.httpOnly,
                secure: config.cookie.secure,
                sameSite: config.cookie.sameSite,
            });
            res.status(200).json(ResponseFormatter.success({} ,"Logged Out Successfully",200))
        } catch (error) {
            next(error)
        }
    }






}