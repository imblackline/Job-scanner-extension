document.getElementById('scanBtn').addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });
    const linkedinTabInfo = document.getElementById('linkedinTabInfo');


    if (tab.url.includes("linkedin.com/jobs")) {
        try {
            const [resp] = await chrome.scripting.executeScript({
                target: {
                    tabId: tab.id
                },
                function: () => {
                    let jobTitle = document.querySelector("h1")?.innerText || "Not Found";
                    let companyName = document.querySelector(".job-details-jobs-unified-top-card__company-name a")?.innerText || "Not Found";
                    return {
                        jobTitle,
                        companyName
                    };
                }
            });

            linkedinTabInfo.textContent = `Job: ${resp.result.jobTitle}, Company: ${resp.result.companyName}`;
            chrome.runtime.sendMessage(resp.result);
        } catch (error) {
            console.error("Script execution failed", error);
        }
    } else {
        alert("Please open a LinkedIn job page.");
    }
});
