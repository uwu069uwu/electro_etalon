import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
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
        <div style="font-family:sans-serif">
          <h2>Electro Etalon</h2>
          <p>${text}</p>
        </div>
      `,
    });
    console.log("✅ Email sent to:", to);
  } catch (error) {
    console.error("❌ Email error:", error);
  }
};
