const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// ================= ENV CHECK =================

if (!process.env.SESSION_SECRET) {
  console.error("❌ SESSION_SECRET is missing in .env");
  process.exit(1);
}

// ================= SOCKET.IO =================

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5175",
      "https://motionpixindia.com",
      "https://www.motionpixindia.com",
    ],
    credentials: true,
  },
});

app.set("io", io);

// ================= TRUST PROXY =================

app.set("trust proxy", 1);

// ================= SESSION =================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// ================= CACHE =================

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// ================= CORS =================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5175",
      "https://motionpixindia.com",
      "https://www.motionpixindia.com",
    ],
    credentials: true,
  })
);

// ================= BODY PARSER =================

app.use(express.json({ limit: "20mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "20mb",
  })
);

// ================= API ROUTES =================

const contactRoutes = require("./routes/contactRoutes");

app.use("/api", contactRoutes);

// ================= API 404 =================

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ================= SOCKET CONNECTION =================

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected:", socket.id);
  });
});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 MotionPix server running on port ${PORT}`);
});