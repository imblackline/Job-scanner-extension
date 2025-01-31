document.getElementById('scanBtn').addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });
    const linkedinTabInfo = document.getElementById('linkedinTabInfo');


    console.log("Access Token---------");
    // chrome.identity.launchWebAuthFlow({
    //         url: `https://accounts.google.com/o/oauth2/auth?client_id=467005267445-pib4vpi6mb00merus8rjtethfl8oq40a.apps.googleusercontent.com&response_type=token&redirect_uri=https://YOUR_EXTENSION_ID.chromiumapp.org/&scope=https://www.googleapis.com/auth/spreadsheets`,
    //         interactive: true
    //     },
    //     function (redirectUrl) {
    //         if (chrome.runtime.lastError) {
    //             console.error(chrome.runtime.lastError);
    //             return;
    //         }
    //         const urlParams = new URLSearchParams(new URL(redirectUrl).hash.substring(1));
    //         const accessToken = urlParams.get("access_token");
    //         console.log("🔑 Access Token:", accessToken);
    //         chrome.storage.local.set({
    //             accessToken: accessToken
    //         });
    //     }
    // );

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

// // Listen for update message from background.js
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.action === "updated") {
//         const updatedInfo = document.getElementById('updated');
//         if (updatedInfo) {
//             updatedInfo.textContent = `Job: ${message.jobTitle}, Company: ${message.companyName}`;
//         }
//     }
// });