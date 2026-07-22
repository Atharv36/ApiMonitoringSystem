import ResponseFormatter from "../utils/ResponseFormatter.js";

const authorize = (allowedRoles = []) => (req, res, next) => {
    try {
        if (!req.user || !req.user.role) {
            return res.status(403).json(ResponseFormatter.error("Forbidden" , 403))
        }


        if (allowedRoles.length === 0) {
            return next();
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json(ResponseFormatter.error("No permissions" , 403))
        }
        next();
    } catch (error) {
        return res.status(403).json(ResponseFormatter.error("Forbidden" , 403))
    }
}

export default authorize;