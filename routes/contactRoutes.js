import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/contact-us", async (req, res) => {
  const { firstName, lastName, email, phoneNumber, subject, message } = req.body;

  try {
    // ✅ Setup transporter for Gmail
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.EMAIL_ADMIN,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
    rejectUnauthorized: false,
  },
    });

    // ✅ Email to YOU (admin)
    await transporter.sendMail({
      from: process.env.EMAIL_ADMIN,
      to: process.env.EMAIL_ADMIN,
      subject: `New Contact Form Submission: ${subject}`,
      text: `
        📩 New Contact Form Submission

        Name: ${firstName} ${lastName}
        Email: ${email}
        Phone: ${phoneNumber}
        Subject: ${subject}
        Message:
        ${message}
      `,
    });

    // ✅ Auto-reply to User
    await transporter.sendMail({
      from: process.env.EMAIL_ADMIN,
      to: email, // user’s email
      subject: "We received your message!",
      text: `Hello ${firstName},

Thank you for reaching out! We have received your message and will respond shortly.

Best regards,  
HealthSure Team`,
    });

    res.status(200).json({ message: "Message sent successfully ✅" });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ message: "Failed to send message ❌" });
  }
});

export default router;
