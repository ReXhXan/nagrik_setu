import emailjs from '@emailjs/browser';

const OFFICER_MAP = {
  Pothole: { officerName: "Sri Janardan Tahasildar (Executive Engineer, Div I)", email: "ee1@bmc.gov.in", department: "Roads & Engineering" },
  Waterlogging: { officerName: "Sri Priyabrata Behera (Executive Engineer, Drainage)", email: "grievance@bmc.gov.in", department: "Drainage" },
  Streetlight: { officerName: "Er. Varsha Pradhan (Executive Engineer, Electrical)", email: "ae-elect@bmc.gov.in", department: "Electrical" },
  Garbage: { officerName: "Sri N Ganesh Babu (Dy. Commissioner City Sanitation)", email: "dc-sanitation@bmc.gov.in", department: "Sanitation" },
  SewageLeak: { officerName: "Smt Himani Nayak (Environment Officer)", email: "envt-off@bmc.gov.in", department: "Environment" },
  WaterLeak: { officerName: "Dr. Deepak Ku. Bisoyi (Health Officer)", email: "cho@bmc.gov.in", department: "Public Health" },
  StrayAnimal: { officerName: "Municipal Veterinary Officer", email: "grievance@bmc.gov.in", department: "Veterinary" },
  Other: { officerName: "Grievance Cell", email: "grievance@bmc.gov.in", department: "General Administration" }
};

export const getRoutingDetails = (category) => {
  return OFFICER_MAP[category] || OFFICER_MAP.Other;
};

export const sendNotificationEmail = async (reportData, reportId) => {
  const routing = getRoutingDetails(reportData.category);
  const testEmail = import.meta.env.VITE_TEST_RECIPIENT_EMAIL;

  const templateParams = {
    to_email: testEmail || routing.email, // Use test email for demo to avoid spam
    officer_name: routing.officerName,
    department: routing.department,
    category: reportData.category,
    description: reportData.description || 'No description provided.',
    report_url: `${window.location.origin}/report/${reportId}`
  };

  try {
    // TEMPORARILY DISABLED: Preventing EmailJS from hanging the submission
    // since API keys are not yet configured.
    // await emailjs.send(
    //   import.meta.env.VITE_EMAILJS_SERVICE_ID,
    //   import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    //   templateParams,
    //   import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    // );
    
    console.log("Mock Email Sent to:", templateParams.to_email);
    return true;
  } catch (error) {
    console.error("Failed to send email via EmailJS", error);
    return false;
  }
};
