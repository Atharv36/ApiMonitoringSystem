import express from "express";
import rateLimit from "express-rate-limit";

import ingestContainer from "../Dependencies/dependencies.js";
import validateApiKey from "../../../shared/middlewares/validateApiKey.js";

import config from "../../../shared/config/index.js";

const router = express.Router();

const ingestLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,

    message: {
        success: false,
        message: "Too Many Requests, Please Try Again Later",
        statusCode: 429,
    },

    standardHeaders: true,
    legacyHeaders: false,
});

router.post(
    "/",
    validateApiKey,
    ingestLimiter,
    (req, res, next) =>
        ingestContainer.ingestController.ingestHit(req, res, next)
);

export default router;