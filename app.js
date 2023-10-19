const express = require("express");
const app = express();
const port = 6000;
const userRouter = require("./route/user.route");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`Method : ${req.method}, ip : ${req.ip}, Path : ${req.path}, `);
  next();
});
app.use("/user",userRouter)

app.listen(port, () => {
  console.log(`server started at ${port}`);
});
