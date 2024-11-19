const express = require("express");
const cors = require("cors");

const prismaSession = require("./config/session");

const app = express();

app.use(cors());
app.use(express.json());

app.use(prismaSession);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Messaging App running on port ${PORT}!`)
);