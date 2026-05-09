import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTP(email, otp) {
  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Your OTP Code",
      html: `
        <div style="font-family:sans-serif">
          <h2>Verification Code</h2>
          <p>Your OTP code:</p>
          <h1>${otp}</h1>
        </div>
      `,
    });

    console.log("✅ Email sent:", response);
  } catch (error) {
    console.error("❌ Email send error:", error);
  }
}