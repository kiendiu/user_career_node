require("dotenv").config();
const express = require("express");
const app = express();

const userRouter = require("./api/users/user.router");
const expectRouter = require("./api/expects/expect.router");
const uploadRouter = require("./api/uploads/upload.router");
const bookRouter = require("./api/book/book.router");

app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/expects", expectRouter);
app.use('/api/uploads', uploadRouter);
app.use('/api/book', bookRouter);

const port = process.env.PORT;
app.listen(port, () => {
  console.log("server up and running on PORT :", port);
});