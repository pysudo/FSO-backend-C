const logger = require("./logger");


const requestLogger = (request, response, next) => {
    logger.info("Method:", request.method);
    logger.info("Path:  ", request.path);
    logger.info("Body:  ", request.body);
    logger.info("---");
    next();
};


// Catching requests made to non-existent routes
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "unknown endpoint" });
};


// this has to be the last loaded middleware.
const errorHandler = (error, request, response, next) => {
    logger.error(error.message);

    if (error.name === "CastError") {
        return response.status(400).send({ error: "malformatted id" });
    }
    if (error.name === "ValidationError") {
        return response.status(400).send({ error: error.message });
    }
    if (error.name === "JsonWebTokenError") {
        return response.status(401).send({ error: "invalid token" });
    }
    if (error.name === "TokenExpiredError") {
        return response.status(401).send({ error: "token expired" });
    }

    next(error);
};


module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler
};