import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"Electro Etalon" <${process.env.EMAIL}>`,
      to,
      subject,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2 style="color:#111">Electro Etalon</h2>
          <p style="font-size:16px">${text}</p>
        </div>
      `,
    });
    console.log("✅ Email sent to:", to);
  } catch (error) {
    console.error("❌ Email error:", error.message);
  }
};
