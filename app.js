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

app.use(cors());
app.use(express.json());

app.use(prismaSession);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/groups", groupRouter);
app.use("/friends", friendRouter);
app.use("/friend_requests", friendRequestRouter);
app.use("/messages", messageRouter);







const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Messaging App running on port ${PORT}!`)
);