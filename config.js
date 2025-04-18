// Job Scanner Extension Configuration
const CONFIG = {
  appUrl: "Your-App-URL",
  
  // Default status values
  defaultStatus: "Not Respond",
  
  // Default empty values
  defaultEmptyValue: "-",
  
  // Supported job sites
  supportedSites: {
    linkedin: "linkedin.com/jobs",
    glassdoor: "glassdoor.it/job-listing"
  },
  
  // Sheet information
  sheetName: "Sheet1",
  
  // Checkbox column (1-indexed)
  checkboxColumn: 15
};

// Don't modify below this line
if (typeof module !== 'undefined') {
  module.exports = CONFIG;
} 