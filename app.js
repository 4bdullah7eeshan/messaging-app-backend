const express = require("express");
const cors = require("cors");
const passport = require("passport");


const prismaSession = require("./config/session");
require("./config/passport")(passport);
const authRouter = require("./routes/authRouters");


const app = express();

app.use(cors());
app.use(express.json());

app.use(prismaSession);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRouter);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Messaging App running on port ${PORT}!`)
);