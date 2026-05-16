const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
require("./listeners/authListener");

const connectDB = require("./config/db");

const errorMiddleware = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const dietRoutes = require("./routes/dietRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const progressRoutes = require("./routes/progressRoutes");
const userRoutes = require("./routes/userRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

connectDB();

app.use(cors());

app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "https://12-fit.vercel.app",
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Vary", "Origin");

  res.setHeader("Access-Control-Allow-Credentials", "true");

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("12Fit API is running");
});

app.use("/auth", authRoutes);
app.use("/workouts", workoutRoutes);
app.use("/diet", dietRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/progress", progressRoutes);
app.use("/users", userRoutes);


app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/workouts", workoutRoutes);
app.use("/api/v1/diet", dietRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/progress", progressRoutes);
app.use("/api/v1/users", userRoutes);

app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

app.use(errorMiddleware);

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    message: err.message || "Server error",
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://12-fit.vercel.app",
    ],
     credentials: true,
  },
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.set("io", io);

let onlineUsers = 0;

app.set("onlineUsers", onlineUsers);

io.on("connection", (socket) => {
  onlineUsers += 1;

  app.set("onlineUsers", onlineUsers);

  io.emit("onlineUsers", onlineUsers);
  io.emit("online-users-count", onlineUsers);

  socket.on("disconnect", () => {
    onlineUsers = Math.max(0, onlineUsers - 1);

    app.set("onlineUsers", onlineUsers);

    io.emit("onlineUsers", onlineUsers);
    io.emit("online-users-count", onlineUsers);
  });
});



const PORT = process.env.PORT || 8080;

const startServer = async () => {
  await connectDB();
  
  if (process.env.NODE_ENV !== "test") {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
};

startServer();

module.exports = app;
