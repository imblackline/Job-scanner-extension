
const CONFIG = {
  defaultStatus: "Not Respond",
  defaultEmptyValue: "-",
  supportedSites: {
    linkedin: "linkedin.com/jobs",
    glassdoor: "glassdoor.it/job-listing"
  },
  sheetName: "Sheet1",
  checkboxColumn: 15
};

if (typeof module !== 'undefined') {
  module.exports = CONFIG;
} 