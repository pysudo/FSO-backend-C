require("dotenv").config();
const express = require("express");
require("express-async-errors");
const cors = require("cors");
const mongoose = require("mongoose");

const logger = require("./utils/logger");
const config = require("./utils/config");
const middleware = require("./utils/middleware");
const notesRouter = require("./controllers/notes");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");


const app = express();

logger.info("connecting to", config.MONGODB_URI);
mongoose.connect(config.MONGODB_URI)
    .then(() => {
        logger.info("connected to MongoDB");
    })
    .catch((error) => {
        logger.info("error connecting to MongoDB:", error.message);
    });


// Remember: Middlewares work only when making a request
// Not when the application first starts
app.use(express.static("build"));
app.use(express.json());
app.use(middleware.requestLogger);
app.use(cors());

app.use("/api/notes", notesRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);
if (process.env.NODE_ENV === "test") {
    const testingRouter = require("./controllers/testingRouter");
    app.use("/api/testing", testingRouter);
}

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;