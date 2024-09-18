require("dotenv").config();
const express = require("express");
const app = express();

const userRouter = require("./api/users/user.router");
const expectRouter = require("./api/expects/expect.router");

app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/expects", expectRouter);

const port = process.env.PORT;
app.listen(port, () => {
  console.log("server up and running on PORT :", port);
});