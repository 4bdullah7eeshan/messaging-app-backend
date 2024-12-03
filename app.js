const express = require("express");
const cors = require("cors");
const passport = require("passport");
const { createServer } = require('node:http');
const { Server } = require('socket.io');



const prismaSession = require("./config/session");
require("./config/passport")(passport);
const authRouter = require("./routes/authRouters");
const userRouter = require("./routes/userRoutes");
const friendRouter = require("./routes/friendRoutes");
const friendRequestRouter = require("./routes/friendRequestRoutes");
const groupRouter = require("./routes/groupRoutes");
const messageRouter = require("./routes/messageRoutes");
const chatRouter = require("./routes/chatRoutes");
const { authenticateSocket } = require("./middlewares/authenticateSocket"); // Custom middleware for socket authentication


const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Allow frontend origin
        methods: ["GET", "POST", "PUT", "DELETE"], // Add allowed HTTP methods
    },
});


app.use(cors());
app.use(express.json());

// Session and Passport



app.use(prismaSession);
app.use(passport.initialize());
app.use(passport.session());

app.set("io", io);

io.use(authenticateSocket);

// Handle socket events
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Routes
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/groups", groupRouter);
app.use("/friends", friendRouter);
app.use("/friend_requests", friendRequestRouter);
app.use("/messages", messageRouter);
app.use("/chats", chatRouter);
// // 404 Handler
// app.use((req, res, next) => {
//     res.status(404).json({ message: "Route not found" });
// });

// // Global Error Handler
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
// });

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
    console.log(`Messaging App running on port ${PORT}!`)
);
