const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const dietRoutes = require("./routes/dietRoutes");
const productRoutes = require("./routes/productRoutes");
const progressRoutes = require("./routes/progressRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
connectDB();

app.use(
  cors({
    origin: [process.env.CLIENT_URL || "http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("12Fit API is running");
});

app.use("/auth", authRoutes);
app.use("/workouts", workoutRoutes);
app.use("/diet", dietRoutes);
app.use("/products", productRoutes);
app.use("/progress", progressRoutes);
app.use("/users", userRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL || "http://localhost:3000"],
    credentials: true,
  },
});

const onlineUsers = new Set();

io.on("connection", (socket) => {
  socket.on("user-online", (userId) => {
    if (userId) {
      socket.userId = String(userId);
      onlineUsers.add(socket.userId);
      io.emit("online-users-count", onlineUsers.size);
    }
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit("online-users-count", onlineUsers.size);
    }
  });
});

app.set("io", io);
app.set("onlineUsers", onlineUsers);

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});