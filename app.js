require("dotenv").config();
const express = require("express");
const app = express();

const userRouter = require("./api/users/user.router");
const expectRouter = require("./api/expects/expect.router");
const uploadRouter = require("./api/uploads/upload.router");
const bookRouter = require("./api/book/book.router");
const requestRouter = require("./api/requests/request.router");
const manageRouter = require("./api/manages/manage.router");
const walletRouter = require("./api/wallet/wallet.router");
const adminRouter = require("./api/admin/admin.router");
const otpRouter = require("./api/otp/otp.router");

app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/expects", expectRouter);
app.use('/api/uploads', uploadRouter);
app.use('/api/book', bookRouter);
app.use('/api/requests', requestRouter);
app.use('/api/manages', manageRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/admin", adminRouter);
app.use("/api/otp", otpRouter);


const port = process.env.PORT;
app.listen(port, () => {
  console.log("server up and running on PORT :", port);
});