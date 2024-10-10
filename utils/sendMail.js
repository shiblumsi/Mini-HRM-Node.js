const nodemailer = require('nodemailer');

// USING GMAIL
exports.sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',  // Corrected typo here
    port: 587,
    secure: false,  // Use TLS
    auth: {
      user: 'shiblu.dbug@gmail.com',
      pass: process.env.APP_PASSWORD,  // Ensure APP_PASSWORD is set in your environment variables
    },
  });

  
  // Define email options
  const mailOptions = {
    from: 'D-Bug HRM <hrm@dbug.dev>',
    to: options.to, 
    subject: options.subject,
    text: options.message,
  };

  // Send email
  await transporter.sendMail(mailOptions);
};
