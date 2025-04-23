
const CONFIG = {
  defaultStatus: "Not Respond",
  defaultEmptyValue: "-",
  supportedSites: {
    linkedin: "linkedin.com/jobs",
    glassdoor: ["glassdoor.it/job-listing", "glassdoor.it/Lavoro"],
    indeed: "it.indeed.com"
  },
  sheetName: "Sheet1",
  checkboxColumn: 15
};

if (typeof module !== 'undefined') {
  module.exports = CONFIG;
} 