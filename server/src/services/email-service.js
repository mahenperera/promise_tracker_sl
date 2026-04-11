import User from "../models/User.js";

const buildSendGridPayload = (subject, html, recipients) => ({
  personalizations: [
    {
      to: recipients.map((email) => ({ email })),
      subject,
    },
  ],
  from: {
    email: process.env.EMAIL_FROM || "no-reply@promise-tracker.com",
    name: "Promise Tracker SL",
  },
  content: [
    {
      type: "text/html",
      value: html,
    },
  ],
});

const renderPromiseHtml = (promise, politician) => `
  <h2>New Promise Added</h2>
  <p><strong>Politician:</strong> ${politician.fullName}</p>
  <p><strong>Promise Title:</strong> ${promise.title}</p>
  <p><strong>Description:</strong> ${promise.description || "No description"}</p>
  <p><strong>Category:</strong> ${promise.category || "N/A"}</p>
  <p><strong>Status:</strong> ${promise.status}</p>
  <p><strong>Promise Date:</strong> ${promise.promiseDate ? new Date(promise.promiseDate).toLocaleDateString() : "Not set"}</p>
`;

export const sendNewPromiseNotification = async (promise, politician) => {
  const SEND_TO_ALL_USERS = process.env.SEND_TO_ALL_USERS === "true";
  const sendGridKey = process.env.SENDGRID_API_KEY;

  if (!sendGridKey) {
    console.warn(
      "SENDGRID_API_KEY is not configured. Skipping email notification.",
    );
    return;
  }

  let recipients = [];
  if (SEND_TO_ALL_USERS) {
    const users = await User.find({}, "email");
    recipients = users.map((user) => user.email).filter(Boolean);
  } else {
    recipients = [process.env.NOTIFICATION_EMAIL || "test@example.com"];
  }

  if (recipients.length === 0) {
    console.log("No recipients found for email notification");
    return;
  }

  const subject = `New Promise Created: ${promise.title}`;
  const html = renderPromiseHtml(promise, politician);
  const payload = buildSendGridPayload(subject, html, recipients);

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sendGridKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `SendGrid failed: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    console.log("SendGrid email notification sent to:", recipients.join(", "));
  } catch (error) {
    console.error("Error sending email notification via SendGrid:", error);
  }
};
