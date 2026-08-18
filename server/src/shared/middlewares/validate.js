import ResponseFormatter from "../utils/ResponseFormatter.js";

const validate = (schema) =>(req,res,next)=> {
    if (!schema) {
        return next();
    }
    const errors = [];
    const body = req.body || {};


    Object.entries(schema).forEach(([field, rules]) => {
        const value = body[field];//body["username"];

        if (rules.required && (value === undefined || value === null || value === "")) {
            errors.push(`${field} is required`);
        }
        if (rules.minLength && typeof value === "string" && value.length  < rules.minLength) {
            errors.push(`${field} must be atleast ${rules.minLength} characters`);
        }
        if (rules.custom && typeof rules.custom === "function") {
            const customError = rules.custom(value, body);
            if(customError)errors.push(customError)
        }
    })

    if (errors.length) {
        return res.status(400).json(ResponseFormatter.error("Validation Failed" , 400 ,errors))
    }

    next()

}

export default validate