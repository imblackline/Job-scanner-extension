document.getElementById('scanBtn').addEventListener('click', async () => {
    
    const TabInfo = document.getElementById('TabInfo');
    TabInfo.textContent = "Scanning job details...";
    
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let mode = "";
    if (tab.url.includes("linkedin.com/jobs")) {
        mode = "LinkedIn";
    }else if (tab.url.includes("glassdoor.it/job-listing")) {
        mode = "Glassdoor";
    }else {
        alert("Please open a LinkedIn or Glassdoor job page.");
        return;
    }
    const cityList = JSON.stringify(window.cityList);
    const countryList = JSON.stringify(window.countryList);
    if (!cityList || !countryList) {
        console.error("❌ cityList or countryList is not loaded!");
        TabInfo.textContent = `Error: City and Country data not found!${countryList}`;
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
                    if(document.querySelector(".job-details-jobs-unified-top-card__job-insight span span")?.innerText){
                        workplaceTypeValue = document.querySelector(".job-details-jobs-unified-top-card__job-insight span span")?.innerText;
                    }else if (document.querySelector(".job-details-preferences-and-skills__pill span span")?.innerText){
                        workplaceTypeValue = document.querySelector(".job-details-preferences-and-skills__pill span span")?.innerText
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


                // ✅ Ensure `cities` is valid before using Object.values
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
        const formattedDate = `${(today.getMonth()+1).toString().padStart(2,'0')}/${today.getDate().toString().padStart(2,'0')}/${today.getFullYear()}`;

        const textToWrite = [
            resp.result.jobTitle,
            resp.result.companyName,
            formattedDate,
            `=HYPERLINK("${tab.url}","Link")`,
            resp.result.easyApply ? 'Easy Apply' : 'Applied',
            'Not Respond',
            'Not Respond',
            '-',
            '-',
            '-',
            resp.result.country,
            resp.result.city,
            resp.result.workplaceType,
            resp.result.publishDate
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
