require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const path = require("path");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const kycRoutes = require("./routes/kyc");
const uploadRoutes = require("./routes/uploads");

const app = express();
app.use(cors());
app.use(express.json());

app.use(
  "/uploads",
  express.static(path.resolve(process.env.UPLOAD_DIR || "uploads"))
);

// api routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/uploads", uploadRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("DB connected");
    await sequelize.sync({ alter: true });
    console.log("All models were synchronized successfully.");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Unable to start server:", err);
  }
}

start();
