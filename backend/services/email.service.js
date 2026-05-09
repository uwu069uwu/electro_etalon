import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, text) => {
  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject,
      html: `
        <div style="font-family:sans-serif">
          <h2>Electro Etalon</h2>
          <p>${text}</p>
        </div>
      `,
    });

    console.log("✅ Email sent:", response);
  } catch (error) {
    console.error("❌ Email error:", error);
  }
};