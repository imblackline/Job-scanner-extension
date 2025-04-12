document.getElementById('scanBtn').addEventListener('click', async () => {
    const TabInfo = document.getElementById('TabInfo');
    TabInfo.textContent = "Scanning job details...";

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let mode = "";
    if (tab.url.includes("linkedin.com/jobs")) {
        mode = "LinkedIn";
    } else if (tab.url.includes("glassdoor.it/job-listing")) {
        mode = "Glassdoor";
    } else {
        alert("Please open a LinkedIn or Glassdoor job page.");
        return;
    }

    const cityList = JSON.stringify(window.cityList);
    const countryList = JSON.stringify(window.countryList);

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
    // Extracting information from HTML
    let rawLocation = getElementText(".job-details-jobs-unified-top-card__primary-description-container div span").toLowerCase();

    // Clean the location data
    let cleanedLocation = rawLocation
        .replace(/remote/i, '')
        .replace(/hybrid/i, '')
        .replace(/on-site/i, '')
        .replace(/in sede/i, '')
        .replace(/matches.*$/i, '')  // Remove unwanted sentences
        .trim();

    // Extract precise workplaceType from the HTML
    let workplaceTypeValue = "";
    const workplaceSpan = document.querySelector(".job-details-jobs-unified-top-card__job-insight span");
    if (workplaceSpan && workplaceSpan.innerText) {
        const workplaceText = workplaceSpan.innerText.toLowerCase();

        // Check for "Remote"
        if (workplaceText.includes("remote")) {
            workplaceTypeValue = "Remote";
        } else if (workplaceText.includes("hybrid")) {
            workplaceTypeValue = "Hybrid";
        } else if (workplaceText.includes("on-site")) {
            workplaceTypeValue = "On-site";
        } else {
            workplaceTypeValue = "Not Specified"; // If no specific type is found
        }
    }

    // Filter precise publish date
    const publishDateSpans = Array.from(document.querySelectorAll(".job-details-jobs-unified-top-card__tertiary-description-container span span"));
    const publishDate = publishDateSpans.map(el => el.innerText).find(text =>
        /\b(ago|fa)\b/i.test(text)
    ) || "";

    return {
        jobTitle: getElementText("h1"),
        companyName: getElementText(".job-details-jobs-unified-top-card__company-name a"),
        workplaceType: workplaceTypeValue,
        publishDate: publishDate,
        easyApply: document.querySelector(".jobs-apply-button--top-card button")?.ariaLabel?.includes('Easy Apply') || false,
        location: cleanedLocation
    };
};

                const getGlassdoorJobData = () => {
                    return {
                        jobTitle: getElementText(".heading_Heading__BqX5J.heading_Level1__soLZs"),
                        companyName: getElementText(".heading_Heading__BqX5J.heading_Subhead__Ip1aW"),
                        workplaceType: "On-site",
                        easyApply: document.querySelector(".button_ButtonContent__a4TUW")?.querySelector('.EasyApplyButton_content__1cGPo') !== null || false,
                        location: getElementText(".JobDetails_location__mSg5h").toLowerCase(),
                        publishDate: ""
                    };
                };

                let jobData = {};
                if (pageMode === "LinkedIn") {
                    jobData = getLinkedinJobData();
                } else if (pageMode === "Glassdoor") {
                    jobData = getGlassdoorJobData();
                }

                // Ensure `cities` is valid before using Object.values
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

        // Clean multi-line and extra spaces
        const clean = str => (str || '').replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();

        const textToWrite = [
            clean(resp.result.jobTitle),
            clean(resp.result.companyName),
            formattedDate,
            `=HYPERLINK("${tab.url}","Link")`,
            resp.result.easyApply ? 'Easy Apply' : 'Applied',
            'Not Respond',
            'Not Respond',
            '-',
            '-',
            '-',
            clean(resp.result.country),
            clean(resp.result.city),
            clean(resp.result.workplaceType),
            clean(resp.result.publishDate)
        ].join('\t');

        navigator.clipboard.writeText(textToWrite).then(() => {
            TabInfo.textContent = `✅ Job data copied to clipboard`;
        }).catch(err => {
            console.error("❌ Failed to copy:", err);
        });

    } catch (error) {
        console.error("❌ Script execution failed:", error);
        TabInfo.textContent = "Error occurred while scanning job details";
    }
});
