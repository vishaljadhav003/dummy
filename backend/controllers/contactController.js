const db = require("../config/db");
const nodemailer = require("nodemailer");

// 🔥 email logs array
let emailLogs = [];

// 🔥 Transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  pool: true,
  maxConnections: 2,
  maxMessages: 50,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.log("❌ Email config error:", err);
  } else {
    console.log("✅ Email server ready", success);
  }
});
// ================= GET CONTACTS =================
exports.getContacts = (req, res) => {

  const search = req.query.search || "";
  const status = req.query.status || "";

  let sql = "SELECT * FROM contacts WHERE 1=1";
  let params = [];

  if (search) {
    sql += " AND (CONCAT(fname,' ',lname) LIKE ? OR email LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }

  sql += " ORDER BY id DESC";

  const chartSql = `
    SELECT services, COUNT(*) as count 
    FROM contacts 
    GROUP BY services
  `;
  
  db.query(sql, params, (err, results) => {
    if (err) throw err;

    db.query(chartSql, (err2, chartData) => {
      if (err2) throw err2;

      res.render("admin", {
        data: results,
        search,
        status,
        chartData,
        emailLogs, // ✅ pass logs
      });
    });
  });
};

// ================= CREATE CONTACT =================
exports.createContact = async (req, res) => {
const io = req.app.get("io");

const newContact = {
  id: result.insertId,
  fname,
  lname,
  email,
  services,
  contact,
  msg,
  status: "pending",
  created_at: new Date(),
};

if (io) {
  io.emit("newContact", newContact);
}
  const { fname, lname, email, services, contact, msg } = req.body;

  const sql =
    "INSERT INTO contacts (fname,lname,email,services,contact,msg) VALUES (?,?,?,?,?,?)";

  db.query(sql, [fname, lname, email, services, contact, msg], async (err, result) => {
    if (err) return res.status(500).json(err);

    // 🔥 SOCKET
    io.emit("newContact", {
      id: result.insertId,
      fname,
      lname,
      email,
      services,
      msg,
      status: "pending",
      created_at: new Date(),
    });

    try {
      // ✅ ADMIN MAIL
    // ADMIN MAIL
        await transporter.sendMail({
          from: `"MotionPix" <${process.env.EMAIL_USER}>`,
          to: process.env.EMAIL_USER, // info@motionpixindia.com
          subject: "🚀 New Inquiry",
          html: `
            <h3>New Inquiry</h3>
            <p>Name: ${fname} ${lname}</p>
            <p>Email: ${email}</p>
            <p>Service: ${services}</p>
            <p>Message: ${msg}</p>
          `
        });

        // USER CONFIRMATION
        await transporter.sendMail({
          from: `"MotionPix" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Inquiry Received ✨ – MotionPix",
          html: `
            <h2 style="color:#333;">Hello ${fname},</h2>

            <p>Thank you for reaching out to <b>MotionPix</b>.</p>

            <p>We have successfully received your inquiry regarding 
            <b>${services}</b>.</p>

            <p>Our team is currently reviewing your request and will get back to you shortly with the necessary details.</p>

            <br/>

            <p style="color:#555;">We appreciate your interest in working with us.</p>

            <p><b>— Team MotionPix</b></p>
          `
        });

    } catch (error) {
      console.log("Email error:", error);
    }

    res.json({ success: true });
  });
};

// ================= MARK COMPLETE =================
exports.markComplete = (req, res) => {
  const id = req.params.id;

  const sql = "UPDATE contacts SET status='completed' WHERE id=?";

  db.query(sql, [id], (err) => {
    if (err) throw err;

    db.query("SELECT email,fname FROM contacts WHERE id=?", [id], (err, result) => {
      if (err) throw err;

      const user = result[0];

     transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Inquiry Accepted ✅ – MotionPix",
     html: `
            <div style="font-family:Arial, sans-serif; background:#f4f6f8; padding:20px;">
              <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.05);">

                <!-- HEADER -->
                <div style="background:#0f172a; padding:20px; text-align:center;">
                  <img src="LOGO_URL" alt="MotionPix" style="height:50px;">
                </div>

                <!-- BODY -->
                <div style="padding:30px; color:#333;">
                  <h2>Hello ${user.fname},</h2>

                  <p>We’re happy to inform you that your inquiry has been</p>

                  <p style="font-size:18px;">
                    <b style="color:green;">✔ Successfully Accepted</b>
                  </p>

                  <p>Our team will now proceed with the next steps and contact you shortly.</p>

                  <!-- BUTTON -->
                  <div style="text-align:center; margin:30px 0;">
                    <a href="https://motionpixindia.com/contact"
                      style="background:#16a34a; color:#fff; padding:12px 25px; text-decoration:none; border-radius:6px; font-weight:bold;">
                      View Details
                    </a>
                  </div>

                  <p>If you have any questions, feel free to reply to this email.</p>

                  <p><b>— Team MotionPix</b></p>
                </div>

                <!-- FOOTER -->
                <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#777;">
                  © ${new Date().getFullYear()} MotionPix. All rights reserved.
                </div>

              </div>
            </div>
            `
}, (err, info) => {
  if (err) {
    console.log("❌ Email failed:", err);
  } else {
    console.log("✅ Email sent:", info.response);
  }
});

      res.redirect("/api/admin");
    });
  });
};

// ================= DELETE =================
exports.deleteContact = (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM contacts WHERE id=?", [id], (err) => {
    if (err) console.error("Delete Error:", err);
    res.redirect("/api/admin");
  });
};
