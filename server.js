require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

  app.use("/uploads", express.static("uploads"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/enquiry", require("./routes/enquiryRoutes"));
app.use("/api/expense", require("./routes/expenseRoutes"));
app.use("/api/customer", require("./routes/customerRoutes"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/dsc", require("./routes/digitalSignature"));
app.use("/api/error", require("./routes/error"));
app.use("/api/service",require("./routes/servicesRoutes"));

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR 👉", err);

  res.status(500).json({
    status: false,
    message: err.message || "Something went wrong",
  });
});

app.get("/", (req, res) => {
  res.send("<h1>Server</h1>")
})

app.listen(process.env.PORT, () => {
  console.log("Server running...");
});