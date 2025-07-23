# 🧠 LLM-Powered Competitive Intelligence Dashboard

A Next.js application that uses LLMs (via [Together API](https://platform.together.xyz)) and news data (via [NewsAPI](https://newsapi.org)) to analyze top company trends, product releases, and more — with source validation and confidence scoring.

---

## 🚀 Features

- Analyze companies across focus areas like AI initiatives, product launches, earnings, hiring trends
- Summary generation using open-source LLMs (Mixtral or LLaMA)
- Confidence score and inline citations with verified sources
- Modern React/Next.js UI with Tailwind CSS

---

## 🛠️ Prerequisites (Windows & macOS)

Ensure the following are installed:

| Tool    | Install Link                          |
| ------- | ------------------------------------- |
| Node.js | https://nodejs.org (v18+ recommended) |
| Git     | https://git-scm.com/downloads         |
| VS Code | https://code.visualstudio.com/        |

Verify installations:

```bash
node -v
npm -v
git --version
```

📦 Setup Instructions

1. Clone the Repository
   If you haven't already:

bash
Copy
git clone https://github.com/your-username/llm-competitive-intel-app.git
cd llm-competitive-intel-app 2. Install Dependencies
bash
Copy
npm install 3. Create .env.local
Create a file called .env.local in the root of the project:

macOS/Linux:
bash
Copy
touch .env.local
Windows:
Create it manually or run:

bash
Copy
echo > .env.local
Inside the file, add:

env
Copy
TOGETHER_API_KEY=your_together_api_key_here
NEWSAPI_KEY=your_newsapi_key_here
🔑 API Keys Setup
✅ Together API (for LLMs)
Visit https://platform.together.xyz/

Sign up (GitHub login is fine)

Go to https://platform.together.xyz/settings/api-keys

Click “Create Key”

Paste it into .env.local as TOGETHER_API_KEY

✅ NewsAPI (for Articles)
Visit https://newsapi.org/register

Sign up and verify your email

Copy your API key

Paste it into .env.local as NEWSAPI_KEY

🧪 Run the App Locally
bash
Copy
npm run dev
Then open your browser to:

👉 http://localhost:3000

🌐 Deploy to GitHub
If not initialized already:

bash
Copy
git init
git remote add origin https://github.com/your-username/llm-competitive-intel-app.git
Make sure .env.local is in .gitignore (do not commit secrets)

Commit and push:

bash
Copy
git add .
git commit -m "Initial commit"
git push -u origin main
🧼 Troubleshooting: GitHub Push Blocked
If GitHub blocks your push due to secrets:

Option A: Remove the file
bash
Copy
git rm --cached openAIKey.txt
git commit --amend
git push --force
Option B: Rewrite commit history
bash
Copy
git filter-branch --force --index-filter \
 "git rm --cached --ignore-unmatch openAIKey.txt" \
 --prune-empty --tag-name-filter cat -- --all

git push origin --force --all
📚 Tech Stack
Next.js 14 (App Router)

React 18+

Tailwind CSS

TypeScript

Together.ai API (LLM Summarization)

NewsAPI (Real-time articles)

Vercel (for deployment)

✅ Coming Soon
Batch company comparison

PDF export

Annotated analyst comments

Role-based admin dashboard

🧠 Learn More
Together API Docs

NewsAPI Docs

Next.js Docs

🎉 License
MIT — feel free to use, extend, or fork this project.

yaml
Copy

---

Let me know if you'd like this turned into an actual file download or if you want me to inclu
