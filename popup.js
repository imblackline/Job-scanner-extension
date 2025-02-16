document.getElementById('scanBtn').addEventListener('click', async () => {
    
    const linkedinTabInfo = document.getElementById('linkedinTabInfo');
    linkedinTabInfo.textContent = "Scanning job details...";
    
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes("linkedin.com/jobs")) {
        alert("Please open a LinkedIn job page.");
        return;
    }
    const cityList = JSON.stringify(window.cityList);
    const countryList = JSON.stringify(window.countryList);
    if (!cityList || !countryList) {
        console.error("❌ cityList or countryList is not loaded!");
        linkedinTabInfo.textContent = `Error: City and Country data not found!${countryList}`;
        return;
    }

    try {
        const [resp] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            args: [window.cityList, window.countryList], // ✅ Pass data safely
            function: (cities, countries) => {
                // ✅ Ensure arguments are valid before using them
                if (!cities || !countries) {
                    throw new Error("cityList or countryList is missing!");
                }

                // ✅ Define helper function inside executeScript
                const getElementText = (selector, defaultValue = "Not Found") => {
                    return document.querySelector(selector)?.innerText || defaultValue;
                };

                const jobData = {
                    jobTitle: getElementText("h1"),
                    companyName: getElementText(".job-details-jobs-unified-top-card__company-name a"),
                    workplaceType: getElementText(".job-details-jobs-unified-top-card__job-insight span span span span"),
                    easyApply: document.querySelector(".jobs-apply-button--top-card button")?.ariaLabel.includes('Easy Apply') || false,
                    location: getElementText(".job-details-jobs-unified-top-card__primary-description-container div span").toLowerCase()
                };


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
            '-',
            '-',
            '-',
            resp.result.country,
            resp.result.city,
            resp.result.workplaceType
        ].join('\t');

        navigator.clipboard.writeText(textToWrite).then(() => {
            linkedinTabInfo.textContent = `✅ Job data copied to clipboard`;
        }).catch(err => {
            console.error("❌ Failed to copy:", err);
        });

    } catch (error) {
        console.error("❌ Script execution failed:", error);
        linkedinTabInfo.textContent = "Error occurred while scanning job details";
    }
});
