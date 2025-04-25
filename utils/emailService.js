import nodemailer from "nodemailer";

import dotenv from "dotenv";
dotenv.config();
// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// Send query submission confirmation
export const sendQueryConfirmation = async (email, name, queryId) => {
  try {
    const info = await transporter.sendMail({
      from: '"VIT Help Desk" <kumarprashant10222@gmail.com>', // Ideally use a domain email
      to: email,
      subject: "Your Query Has Been Received",
      text: `Hello ${name}, Your query (ID: ${queryId}) has been received. You will be notified once there's a response.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0A1E46;">Query Submitted Successfully</h2>
          <p>Hello ${name},</p>
          <p>Your query has been successfully submitted to the VIT Help Desk system.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Query Details:</strong></p>
            <p style="margin: 10px 0;">Query ID: ${queryId}</p>
          </div>
          <p>You can track your query status using this Query ID.</p>
          <p>We will notify you when there's a response to your query.</p>
          <p style="color: #666; font-size: 0.9em; margin-top: 30px;">
            This is an automated message, please do not reply directly to this email.
          </p>
        </div>
      `,
    });

    console.log("Query confirmation email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending query confirmation email:", error);
    return false;
  }
};

// Send admin response notification
export const sendResponseNotification = async (email, name, queryId) => {
  try {
    const info = await transporter.sendMail({
      from: '"VIT Help Desk" <kumarprashant10222@gmail.com>',
      to: email,
      subject: "New Response to Your Query",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0A1E46;">Your Query Has Been Updated</h2>
        <p>Hello ${name},</p>
        <p>A new response has been added to your query in the VIT Help Desk system.</p>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Query ID:</strong> ${queryId}</p>
        </div>

        <p>You can view the full response and conversation history by tracking your query using the above ID.</p>

        <p style="color: #666; font-size: 0.9em; margin-top: 30px;">
          This is an automated message. Please do not reply to this email.
        </p>
        </div>
      `,
    });
    console.log("Response notification email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending response notification email:", error);
    return false;
  }
};
