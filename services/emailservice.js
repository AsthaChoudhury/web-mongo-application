import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendVerificationEmail = async (
  recipientEmail,
  verificationToken
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const testMailOptions = {
    from: process.env.EMAIL_USER,
    to: "user.email",
    subject: "Test Email",
    text: "This is a test email to verify Nodemailer configuration.",
  };

  transporter.sendMail(testMailOptions, (error, info) => {
    if (error) {
      console.error("Error sending test email:", error);
    } else {
      console.log("Test email sent:", info.response);
    }
  });
};

sendVerificationEmail();
