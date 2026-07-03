const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send email helper
const sendEmail = async (to, subject, htmlContent) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email service not configured. Skipping email send.');
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
};

// Email templates
const emailTemplates = {
  complaintCreated: (complaintTitle, complaintId, residentName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">New Complaint Filed</h2>
      <p>Hello Admin,</p>
      <p><strong>${residentName}</strong> has filed a new complaint:</p>
      <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Title:</strong> ${complaintTitle}</p>
        <p><strong>Complaint ID:</strong> ${complaintId}</p>
      </div>
      <p>Please review and take action.</p>
      <p>Best regards,<br>Society Maintenance Tracker</p>
    </div>
  `,

  complaintStatusUpdated: (complaintTitle, newStatus, note, residentName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Complaint Status Updated</h2>
      <p>Hello ${residentName},</p>
      <p>Your complaint has been updated:</p>
      <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Title:</strong> ${complaintTitle}</p>
        <p><strong>New Status:</strong> <span style="background-color: #3498db; color: white; padding: 5px 10px; border-radius: 3px;">${newStatus}</span></p>
        ${note ? `<p><strong>Note:</strong> ${note}</p>` : ''}
      </div>
      <p>Thank you for using our service.</p>
      <p>Best regards,<br>Society Maintenance Tracker</p>
    </div>
  `,

  complaintDeleted: (complaintTitle, residentName, adminName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Complaint Deleted</h2>
      <p>Hello Admin,</p>
      <p><strong>${residentName}</strong> has deleted the following complaint:</p>
      <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Title:</strong> ${complaintTitle}</p>
      </div>
      <p>This action was performed at ${new Date().toLocaleString()}.</p>
      <p>Best regards,<br>Society Maintenance Tracker</p>
    </div>
  `,

  noticePosted: (noticeTitle, noticeMessage, important) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${important ? '#e74c3c' : '#2c3e50'};">
        ${important ? '🔔 Important Notice' : 'New Notice'}
      </h2>
      <p>Hello,</p>
      <p>A new notice has been posted on the Society Maintenance Portal:</p>
      <div style="background-color: ${important ? '#fadbd8' : '#ecf0f1'}; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${important ? '#e74c3c' : '#3498db'};">
        <p><strong>Title:</strong> ${noticeTitle}</p>
        <p><strong>Message:</strong></p>
        <p>${noticeMessage}</p>
      </div>
      <p>Please check your dashboard for more information.</p>
      <p>Best regards,<br>Society Maintenance Tracker</p>
    </div>
  `,
};

module.exports = {
  sendEmail,
  emailTemplates,
};
