# 🚀 Job Scanner - Chrome Extension

## 📌 Overview
The **Job Scanner** is a Chrome extension that helps you **automate job tracking** from various job listing websites. It extracts **job title, company name, job location, and application status** and pastes it into a **Google Sheet** for easy organization.

---

## 🎯 Features
- ✅ Extract **job details** from multiple job platforms (**LinkedIn, Indeed, Glassdoor**)  
- ✅ Detect **city & country** from job postings  
- ✅ Identify **Easy Apply or Quick Apply options**  
- ✅ **Auto-copy job details** to clipboard for quick pasting  
- ✅ **Google Sheets integration** for tracking applications  
- ✅ Lightweight and **privacy-friendly** (no external API usage)  

---

## 📂 Installation Guide
### 1️⃣ **Download & Install**
1. **Clone or Download the Repository**:
   ```bash
   git clone https://github.com/imblackline/job-scanner-extension.git
   cd job-scanner-extension
   ```
2. Open **Google Chrome** and go to:
   ```
   chrome://extensions/
   ```
3. Enable **Developer Mode** (toggle in the top right).
4. Click **"Load unpacked"** and select the extension folder.

---

## 🖥️ **How to Use**
1. Open any supported **job listing website** (**LinkedIn, Indeed, Glassdoor**).
2. Navigate to a job posting.
3. Click on the **Job Scanner** extension icon.
4. Click **"Scan Job"** to extract job details.
5. The data will be **copied to your clipboard**.
6. **Paste** the data into **Google Sheets**.
7. (Optional)  For setup Google Sheet Auto-Saver follow steps below

## ⚙️ **How to Setup Google Sheet Auto-Saver**
1. Log in to your Google account.
2. Open a new Google Sheet.
3. Go to **Extensions > Apps Script**.
4. Delete all existing code inside the `Code.gs` file and replace your new code.  
   Save the project with **Ctrl + S**.
5. Click on **Deploy > New deployment** at the top.
6. Set the deployment type to **Web App**.
7. Add a description (optional), then configure:
   - **Execute as** → **Me**
   - **Who has access** → **Anyone**
8. Click the **Authorize access** button and allow the required permissions.
9. After deployment, copy the **App URL** (e.g.,  
   `https://script.google.com/macros/s/AKfycbyV_Lz....NDXBOL0A/exec`).
10. Now add your copied App URL to the extension "Configure" section.
11. Use Google Sheet Template (Optional)
    
✅ Now you're ready to automatically save data to Google Sheets!

---

## 📋 **Google Sheets Template**
To **easily track your job applications**, use this **Google Sheets template**:

📎 [**Click Here to Access the Template**](https://docs.google.com/spreadsheets/d/14Yey1-kgFA9rhIdM7cM3k0PnsOYfOxLOwbpLfHnyvIY/edit?usp=sharing)

### ✅ **How to Use**:
1. Open the **Google Sheets link**.
2. Click **"File" > "Make a Copy"** to save it to your Google Drive.
3. Paste copied job details into the sheet.

---

## 💡 **Contributing**
Pull requests are welcome! If you have feature suggestions or bug fixes:
1. **Fork the repository**.
2. **Create a new branch**.
3. **Submit a pull request to the development branch**.

---

## 🏆 **Credits**
💡 Developed by **Amirhossein Yaghoubnezhad**  
📧 Contact: **yaghoubnezhad.amirhossein@gmail.com**  
🌎 GitHub: **[My GitHub Profile](https://github.com/imblackline)** 
 
---

## 🎖️ **Contributors**
🥇 **[Reza Javanmaqul](https://github.com/Rj2mcode)**


