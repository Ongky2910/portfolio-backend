const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const projectRoutes = require("./routes/projectRoutes");
const cloudinary = require("./config/cloudinaryConfig"); 

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    console.log(`📢 Request received: ${req.method} ${req.url}`);
    next();
});

// ✅ Panggil connectDB() yang sudah diimport
connectDB();

// Routes
app.get("/", (req, res) => {
    console.log("📢 GET / called");
    res.send("Portfolio API Running...");
});
app.use("/api/projects", projectRoutes);

// Middleware untuk menangani error
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
