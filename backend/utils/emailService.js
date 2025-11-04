const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email function
const sendEmail = async (options) => {
  try {
    const message = {
      from: `Y-Ultimate Platform <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html
    };

    const info = await transporter.sendMail(message);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Tournament notification templates
const sendTournamentRegistrationConfirmation = async (email, tournamentName, teamName) => {
  const subject = `Team Registration Confirmation - ${tournamentName}`;
  const message = `Your team "${teamName}" has been successfully registered for ${tournamentName}. You will receive an update once your registration is reviewed.`;
  
  await sendEmail({ email, subject, message });
};

const sendTeamApprovalNotification = async (email, tournamentName, teamName, status) => {
  const subject = `Team Registration ${status === 'approved' ? 'Approved' : 'Rejected'} - ${tournamentName}`;
  const message = status === 'approved' 
    ? `Congratulations! Your team "${teamName}" has been approved for ${tournamentName}.`
    : `Unfortunately, your team "${teamName}" registration for ${tournamentName} has been rejected.`;
  
  await sendEmail({ email, subject, message });
};

const sendMatchReminder = async (email, matchDetails) => {
  const subject = `Match Reminder - ${matchDetails.tournament}`;
  const message = `Reminder: Your match is scheduled for ${matchDetails.date} at ${matchDetails.time} on ${matchDetails.field}.`;
  
  await sendEmail({ email, subject, message });
};

// Coaching programme notification templates
const sendSessionReminder = async (email, sessionDetails) => {
  const subject = `Session Reminder - ${sessionDetails.title}`;
  const message = `Reminder: ${sessionDetails.title} is scheduled for ${sessionDetails.date} at ${sessionDetails.location}.`;
  
  await sendEmail({ email, subject, message });
};

const sendHomeVisitScheduled = async (email, visitDetails) => {
  const subject = `Home Visit Scheduled`;
  const message = `A home visit has been scheduled for ${visitDetails.date} at ${visitDetails.time}. Coach: ${visitDetails.coachName}`;
  
  await sendEmail({ email, subject, message });
};

const sendAssessmentDueNotification = async (email, childName, assessmentType) => {
  const subject = `Assessment Due - ${childName}`;
  const message = `${assessmentType} assessment is due for ${childName}. Please schedule and complete the assessment.`;
  
  await sendEmail({ email, subject, message });
};

module.exports = {
  sendEmail,
  sendTournamentRegistrationConfirmation,
  sendTeamApprovalNotification,
  sendMatchReminder,
  sendSessionReminder,
  sendHomeVisitScheduled,
  sendAssessmentDueNotification
};