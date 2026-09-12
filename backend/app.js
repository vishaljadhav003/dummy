require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const http = require("http");
const { Server } = require("socket.io");
const db = require("./config/db");
const auth = require("./middleware/auth");

const contactRoutes = require("./routes/contactRoutes");

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
    proxy: true,

    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
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

// ================= LOGIN =================

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.isAuth = true;

   return req.session.save((err) => {
  if (err) {
    console.error("SESSION SAVE ERROR:", err);
    return res.status(500).send("Unable to create login session");
  }

  console.log("LOGIN SESSION:", {
    sessionID: req.sessionID,
    isAuth: req.session.isAuth,
  });

  return res.redirect("/admin");
});
  }

  return res.status(401).send("Invalid username or password");
});

// ================= API ROUTES =================

app.use("/api", contactRoutes);

// ================= API 404 =================

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/admin", auth, async (req, res) => {
  try {
    const { search = "", status = "" } = req.query;

    let sql = `
      SELECT * FROM contacts
      WHERE 1 = 1
    `;
    const params = [];

    if (search) {
      sql += `
        AND (
          fname LIKE ?
          OR lname LIKE ?
          OR email LIKE ?
        )
      `;

      const searchValue = `%${search}%`;
      params.push(searchValue, searchValue, searchValue);
    }

    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }

    sql += " ORDER BY id DESC";

    const [submissions] = await db.promise().query(sql, params);

    res.render("admin", {
      submissions,
      search,
      status
    });
  } catch (error) {
    console.error("ADMIN DATABASE ERROR:", error);
    res.status(500).send("Unable to load admin panel");
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("LOGOUT ERROR:", err);
      return res.status(500).send("Unable to logout");
    }

    res.clearCookie("connect.sid", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return res.redirect("/login");
  });
});

// ================= FRONTEND =================

const frontendPath = path.join(__dirname, "..", "dist");
app.use(express.static(frontendPath));

// React Router fallback
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }

  res.sendFile(path.join(frontendPath, "index.html"));
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

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 MotionPix server running on port ${PORT}`);
});
