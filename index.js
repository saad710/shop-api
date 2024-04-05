const express = require('express')
const mongoose = require("mongoose")
const cors = require('cors')
const dotenv = require('dotenv')
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const categoryRoute = require("./routes/category");
const productRoute = require("./routes/product");
const orderRoute = require("./routes/order");
dotenv.config()
const app = express()


mongoose.connect(process.env.MONGO_URL, {
}).then(()=> {
    console.log("mongodb connected successfully")
}).catch((err)=> {
    console.error('Error connecting to Mongo', err);
})

app.use(cors())
app.use(express.json())
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/category", categoryRoute);
app.use("/api/product", productRoute);
app.use("/api/order", orderRoute);

app.listen(process.env.PORT || 8000, () => {
    console.log("Backend server is running!");
  });