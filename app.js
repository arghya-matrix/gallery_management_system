const express = require("express");
const app = express();
const port = 8080;
const userRouter = require("./route/user.route");
const galleryRouter = require("./route/gallery.route")
const path = require('path')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`Method : ${req.method}, ip : ${req.ip}, Path : ${req.path}, `);
  next();
});
app.use("/uploads", express.static(path.join(__dirname, 'uploads')));
app.use("/user",userRouter)
app.use("/gallery",galleryRouter)

app.listen(port, () => {
  console.log(`server started at ${port}`);
});
