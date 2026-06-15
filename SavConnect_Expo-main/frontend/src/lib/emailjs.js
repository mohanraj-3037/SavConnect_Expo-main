import emailjs from 'emailjs-com';

// ⚠️  Replace these with your actual EmailJS credentials.
//     Find them at: https://dashboard.emailjs.com
const EMAILJS_SERVICE_ID = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY;


/**
 * Send a "Request to Join" email via EmailJS.
 *
 * NOTE: Email sending is now handled by the FastAPI backend endpoint
 *       POST /request-to-join. This client-side function is kept as a
 *       fallback but is NOT used in the current flow.
 *
 * Your EmailJS template should contain these variables:
 *   {{to_email}}          — project owner's email
 *   {{owner_name}}        — project owner's name
 *   {{applicant_name}}    — current logged-in user's name
 *   {{project_title}}     — title of the opportunity
 *   {{matched_skills}}    — overlapping skills (comma-separated)
 *   {{applicant_email}}   — applicant's email (Reply To)
 *
 * @param {object} params
 * @param {string} params.toEmail         — recipient (owner) email
 * @param {string} params.ownerName       — project owner's name
 * @param {string} params.applicantName   — current user's name
 * @param {string} params.projectTitle    — opportunity title
 * @param {string} params.matchedSkills   — overlapping skills string
 * @param {string} params.applicantEmail  — current user's email
 */
export const sendJoinRequest = async ({
  toEmail,
  ownerName,
  applicantName,
  projectTitle,
  matchedSkills,
  applicantEmail,
}) => {
  const templateParams = {
    to_email: toEmail,
    owner_name: ownerName,
    applicant_name: applicantName,
    project_title: projectTitle,
    matched_skills: matchedSkills || 'None',
    applicant_email: applicantEmail,
  };

  return emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    templateParams,
    EMAILJS_PUBLIC_KEY
  );
};
