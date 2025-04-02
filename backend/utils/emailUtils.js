const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

async function sendEmail(to, subject, template, placeholders = {}) {
  const htmlFilePath = path.join(__dirname, `../templates/${template}.html`);

  if (!fs.existsSync(htmlFilePath)) {
    throw new Error("Template wasn't found");
  }

  let htmlContent = fs.readFileSync(htmlFilePath, "utf-8");

  for (const key in placeholders) {
    const regex = new RegExp(`{{${key}}}`, "g");
    htmlContent = htmlContent.replace(regex, placeholders[key]);
  }

  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject,
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendEmail };
