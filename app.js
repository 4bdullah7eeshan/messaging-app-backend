const express = require("express");
const cors = require("cors");
const passport = require("passport");

const prismaSession = require("./config/session");
require("./config/passport")(passport);
const authRouter = require("./routes/authRouters");
const userRouter = require("./routes/userRoutes");
const friendRouter = require("./routes/friendRoutes");
const friendRequestRouter = require("./routes/friendRequestRoutes");
const groupRouter = require("./routes/groupRoutes");
const messageRouter = require("./routes/messageRoutes");

const app = express();

// Middleware
const corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Session and Passport
app.use(prismaSession);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/groups", groupRouter);
app.use("/friends", friendRouter);
app.use("/friend_requests", friendRequestRouter);
app.use("/messages", messageRouter);

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`Messaging App running on port ${PORT}!`)
);
