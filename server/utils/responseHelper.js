export const responseHelper = {
    success: (res, message= "Success", data = null, statusCode = 200) => {
        return res.status(statusCode).json({
            success: true,
            message,
            ...(data && { data }),
        });
    },
    error: (res, message= "Internal server error", statusCode = 500, details = null)=> {
        return res.status(statusCode).json({
            success: false,
            message,
            ...(details && { details }),        
        });
    },
    validationError: (res, errors) => {
        const message =
            typeof errors === "string"
                ? errors
                : Array.isArray(errors) && errors.length > 0
                    ? errors[0]?.msg || "Validation error"
                    : "Validation error";

        return res.status(400).json({
            success: false,
            message,
            ...(errors && typeof errors !== "string" ? { errors } : {}),
        });
    },
    notFound: (res, resource = 'Resource') => {
        return res.status(404).json({
            success: false,
            message: `${resource} not found`,
        });
    },
    unauthorized: (res, message = 'Unauthorized access') => {
        return res.status(401).json({
            success: false,
            message,
        });
    },
    forbidden: (res, message = 'Access denied') => {
        return res.status(403).json({
            success: false,
            message,
        });
    },
};
