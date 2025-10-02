import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/contact-us", async (req, res) => {
  const { firstName, lastName, email, phoneNumber, subject, message } = req.body;

  try {
    // ✅ Setup transporter for Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Email to YOU (admin)
    await transporter.sendMail({
      from: email, // user’s email (so you see who sent it)
      to: process.env.EMAIL_USER, // your business Gmail
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
      from: process.env.EMAIL_USER,
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
