class ResponseFormatter {
    static success(data = null, message = "Success", statusCode = 200) {
        return {
            success: true,
            message,
            data,
            statusCode,
            timestamp: new Date().toISOString(),
        };
    }

    static error(
        message = "Internal Server Error",
        statusCode = 500,
        error = null
    ) {
        return {
            success: false,
            message,
            error,
            statusCode,
            timestamp: new Date().toISOString(),
        };
    }

    static validationError(error = null) {
        return {
            success: false,
            message: "Validation Failed",
            error,
            statusCode: 400,
            timestamp: new Date().toISOString(),
        };
    }

    static paginated(
        data = [],
        page = 1,
        limit = 10,
        total = 0
    ) {
        return {
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            timestamp: new Date().toISOString(),
        };
    }
}

export default ResponseFormatter;