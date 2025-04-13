document.getElementById('scanBtn').addEventListener('click', async () => {
    const TabInfo = document.getElementById('TabInfo');
    TabInfo.textContent = "Scanning job details...";
    
    const appUrl = "Your-App-URL"; // Just Replace Your App URL Here

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let mode = "";

    if (tab.url.includes("linkedin.com/jobs")) {
        mode = "LinkedIn";
    } else if (tab.url.includes("glassdoor.it/job-listing")) {
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
            args: [cityList, countryList, mode],
            function: (cities, countries, pageMode) => {
                const getElementText = (selector, defaultValue = "Not Found") => {
                    return document.querySelector(selector)?.innerText || defaultValue;
                };

                const getLinkedinJobData = () => {
                    const rawLocation = getElementText(".job-details-jobs-unified-top-card__primary-description-container div span").toLowerCase();
                    const cleanedLocation = rawLocation
                        .replace(/(remote|hybrid|on-site|in sede)/gi, '')
                        .replace(/matches.*$/i, '')
                        .trim();

                    const workplaceSpan = document.querySelector(".job-details-jobs-unified-top-card__job-insight span");
                    const workplaceText = workplaceSpan?.innerText?.toLowerCase() || "";
                    const workplaceTypeValue = 
                        workplaceText.includes("remote") ? "Remote" :
                        workplaceText.includes("hybrid") ? "Hybrid" :
                        workplaceText.includes("on-site") ? "On-site" : "Not Specified";

                    const publishDateSpans = [...document.querySelectorAll(".job-details-jobs-unified-top-card__tertiary-description-container span span")];
                    const publishDate = publishDateSpans.map(el => el.innerText).find(text => /\b(ago|fa)\b/i.test(text)) || "";

                    return {
                        jobTitle: getElementText("h1"),
                        companyName: getElementText(".job-details-jobs-unified-top-card__company-name a"),
                        workplaceType: workplaceTypeValue,
                        publishDate,
                        easyApply: document.querySelector(".jobs-apply-button--top-card button")?.ariaLabel?.includes('Easy Apply') || false,
                        location: cleanedLocation
                    };
                }

                const getGlassdoorJobData = () => ({
                    jobTitle: getElementText(".heading_Heading__BqX5J.heading_Level1__soLZs"),
                    companyName: getElementText(".heading_Heading__BqX5J.heading_Subhead__Ip1aW"),
                    workplaceType: "On-site",
                    easyApply: !!document.querySelector(".button_ButtonContent__a4TUW .EasyApplyButton_content__1cGPo"),
                    location: getElementText(".JobDetails_location__mSg5h").toLowerCase(),
                    publishDate: ""
                });

                const jobData = pageMode === "LinkedIn" ? getLinkedinJobData() : getGlassdoorJobData();

                const city = Object.values(cities).flat().find(ct => jobData.location.includes(ct.toLowerCase())) || "-";
                let country = countries.find(ct => jobData.location.includes(ct.toLowerCase())) || "-";

                if (country === "-" && city !== "-") {
                    country = Object.entries(cities).find(([countryName, cityArray]) => cityArray.includes(city))?.[0] || "-";
                }

                return { ...jobData, city, country };
            }
        });

        const today = new Date();
        const formattedDate = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

        const clean = str => (str || '').replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();

        const jobInfo = {
            jobTitle: clean(resp.result.jobTitle),
            companyName: clean(resp.result.companyName),
            date: formattedDate,
            link: tab.url,
            easyApply: resp.result.easyApply ? 'Easy Apply' : 'Applied',
            status1: 'Not Respond',
            status2: 'Not Respond',
            note1: '-',
            note2: '-',
            note3: '-',
            country: clean(resp.result.country),
            city: clean(resp.result.city),
            workplaceType: clean(resp.result.workplaceType),
            publishDate: clean(resp.result.publishDate)
        };

        const textToWrite = [
            jobInfo.jobTitle,
            jobInfo.companyName,
            jobInfo.date,
            `=HYPERLINK("${jobInfo.link}","Link")`,
            jobInfo.easyApply,
            jobInfo.status1,
            jobInfo.status2,
            jobInfo.note1,
            jobInfo.note2,
            jobInfo.note3,
            jobInfo.country,
            jobInfo.city,
            jobInfo.workplaceType,
            jobInfo.publishDate
        ].join('\t');

        // Copy to clipboard
        await navigator.clipboard.writeText(textToWrite);
        TabInfo.textContent = `✅ Job data copied to clipboard`;

        if (document.getElementById('saveToSheet').checked) {
            if(appUrl != "Your-App-URL" && appUrl != ""){
                TabInfo.textContent = "🔄 Saving to Google Sheets...";

            await new Promise(resolve => setTimeout(resolve, 500)); // Short delay

            TabInfo.textContent = "🔄 Sending...";
            try{
                const response = await fetch(appUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(jobInfo)
                    
                });
                await new Promise(resolve => setTimeout(resolve, 1)); // Short delay
            const result = await response.json();
           
            await new Promise(resolve => setTimeout(resolve, 1)); // Short delay
            if (response.ok && result.result === "Success") {
                TabInfo.textContent = "✅ Saved & Copied!";
            } else {
                throw new Error(result.error || "Unknown error");
            }
            }
            catch(e){TabInfo.textContent = "✅ Sended to Google Sheet"; }
            }else{
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
