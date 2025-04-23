if (localStorage.getItem('appUrl')) {
    document.getElementById('appUrlInput').value = localStorage.getItem('appUrl');
}

document.getElementById('scanBtn').addEventListener('click', async () => {
    const TabInfo = document.getElementById('TabInfo');
    TabInfo.textContent = "Scanning job details...";
    if (localStorage.getItem('appUrl') == null) {
        TabInfo.textContent = "⭕Set your App link in the config";
        return;
    }
    const appUrl = localStorage.getItem('appUrl');
    TabInfo.textContent = appUrl;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let mode = "";

    if (tab.url.includes(CONFIG.supportedSites.linkedin)) {
        mode = "LinkedIn";
    } else if (CONFIG.supportedSites.glassdoor.some(site => tab.url.includes(site))) {
        mode = "Glassdoor";
    } else {
        alert("Please open a LinkedIn or Glassdoor job page.");
        return;
    }

    const cityList = window.cityList;
    const countryList = window.countryList;

    if (!cityList || !countryList) {
        console.error("❌ cityList or countryList is not loaded!");
        TabInfo.textContent = `Error: City and Country data not found!`;
        return;
    }

    try {
        const [resp] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            args: [window.cityList, window.countryList, mode],
            function: (cities, countries, pageMode) => {
                if (!cities || !countries) {
                    throw new Error("cityList or countryList is missing!");
                }

                const getElementText = (selector, defaultValue = "Not Found") => {
                    return document.querySelector(selector)?.innerText || defaultValue;
                };

                const getLinkedinJobData = () => {
                    let workplaceTypeValue = undefined;

                    if (document.querySelector(".job-details-fit-level-preferences span")?.innerText) {
                        workplaceTypeValue = document.querySelector(".job-details-fit-level-preferences span")?.innerText;
                    } else if (document.querySelector(".job-details-preferences-and-skills__pill span")?.innerText) {
                        workplaceTypeValue = document.querySelector(".job-details-preferences-and-skills__pill span")?.innerText
                    }
                    return {
                        jobTitle: getElementText("h1"),
                        companyName: getElementText(".job-details-jobs-unified-top-card__company-name a"),
                        workplaceType: workplaceTypeValue,
                        publishDate: document.querySelector(".job-details-jobs-unified-top-card__tertiary-description-container span span:nth-of-type(3)")?.innerText,
                        easyApply: document.querySelector(".jobs-apply-button--top-card button")?.ariaLabel.includes('Easy Apply') || false,
                        location: getElementText(".job-details-jobs-unified-top-card__primary-description-container div span").toLowerCase()
                    };
                }
                const getGlassdoorJobData = () => {
                    return {
                        jobTitle: getElementText(".heading_Heading__BqX5J.heading_Level1__soLZs"),
                        companyName: getElementText(".heading_Heading__BqX5J.heading_Subhead__Ip1aW"),
                        workplaceType: "On-site",
                        easyApply: document.querySelector(".button_ButtonContent__a4TUW")?.querySelector('.EasyApplyButton_content__1cGPo') !== null || false,
                        location: getElementText(".JobDetails_location__mSg5h").toLowerCase(),
                        publishDate: ""
                    };
                }

                let jobData = {};
                if (pageMode === "LinkedIn") {
                    jobData = getLinkedinJobData();
                } else if (pageMode === "Glassdoor") {
                    jobData = getGlassdoorJobData();
                }


                const city = Object.values(cities).flat()
                    .find(ct => jobData.location.includes(ct.toLowerCase())) || "-";

                let country = countries.find(ct => jobData.location.includes(ct.toLowerCase())) || "-";

                if (country === "-" && city !== "-") {
                    country = Object.entries(cities)
                        .find(([country, cities]) => cities.includes(city))?.[0] || "-";
                }

                return { ...jobData, city, country };
            }
        });

        const today = new Date();
        const formattedDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;
        const clean = str => (str || '').replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();

        const textToWrite = [
            clean(resp.result.jobTitle),
            clean(resp.result.companyName),
            formattedDate,
            `=HYPERLINK("${tab.url}","Link")`,
            resp.result.easyApply ? 'Easy Apply' : 'Applied',
            CONFIG.defaultStatus,
            CONFIG.defaultStatus,
            CONFIG.defaultEmptyValue,
            CONFIG.defaultEmptyValue,
            CONFIG.defaultEmptyValue,
            clean(resp.result.country),
            clean(resp.result.city),
            clean(resp.result.workplaceType),
            clean(resp.result.publishDate),
            ''
        ].join('\t');

        const jobInfo = {
            jobTitle: clean(resp.result.jobTitle),
            companyName: clean(resp.result.companyName),
            date: formattedDate,
            link: tab.url,
            easyApply: resp.result.easyApply,
            status1: CONFIG.defaultStatus,
            lastStatus: CONFIG.defaultStatus,
            interviewDates: CONFIG.defaultEmptyValue,
            followUpDate: CONFIG.defaultEmptyValue,
            salaryOffered: CONFIG.defaultEmptyValue,
            country: clean(resp.result.country),
            city: clean(resp.result.city),
            workplaceType: clean(resp.result.workplaceType),
            publishDate: clean(resp.result.publishDate),
            coverLetter: '',
            details: '',
        };


        navigator.clipboard.writeText(textToWrite).then(() => {
            TabInfo.textContent = `✅ Job data copied to clipboard`;
        }).catch(err => {
            console.error("❌ Failed to copy:", err);
        });

        if (document.getElementById('saveToSheet').checked) {
            if (appUrl != "Your-App-URL" && appUrl != "") {
                TabInfo.textContent = "🔄 Saving to Google Sheets...";

                await new Promise(resolve => setTimeout(resolve, 500));

                TabInfo.textContent = "🔄 Sending...";
                try {
                    const response = await fetch(appUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        mode: "cors",
                        body: JSON.stringify(jobInfo)
                    });

                    const responseText = await response.text();

                    if (response.ok) {
                        TabInfo.textContent = "✅ Saved & Copied!";
                    } else {
                        throw new Error(`Calling Google Sheets API error with status: ${response.status}`);
                    }
                } catch (e) {
                    TabInfo.textContent = `❌ Error: ${e.message}`;
                }
            } else {
                TabInfo.textContent = "❌ Please set your App link";
            }
        } else {
            TabInfo.textContent = "✅ Copied to clipboard!";
        }

    } catch (error) {
        console.error("❌ Script execution failed:", error);
        TabInfo.textContent = "Error occurred while scanning job details";
    }
});



document.getElementById('saveConfigBtn').addEventListener('click', (event) => {
    const appUrlInput = document.getElementById('appUrlInput').value;
    if (appUrlInput.trim() !== '') {
        localStorage.setItem('appUrl', appUrlInput);
        const toggleElement = document.querySelector('.c-form__toggle');
        const originalTitle = toggleElement.getAttribute('data-title');
        toggleElement.setAttribute('data-title', '✅ Saved!');
        setTimeout(() => {
            toggleElement.setAttribute('data-title', originalTitle);
        }, 2000);
    } 
});
