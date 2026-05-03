# Election Saathi 🗳️

**PromptWars Week 2 Challenge — Election Process Education**

An AI-powered, multilingual, WCAG 2.1 AA-compliant assistant that helps Indian citizens understand the entire election process through an interactive, step-by-step guide.

---

## 🎯 Chosen Vertical

**Election Process Education** — Create an assistant that helps users understand the election process, timelines, and steps in an interactive and easy-to-follow way.

---

## 🧠 Approach & Logic

### Architecture
- **Hash-based Single Page Application (SPA)** with client-side routing
- **JSON-driven i18n architecture** for English/Hindi language switching
- **Keyword-matching chatbot** with pre-defined accurate responses

### How It Works
1. **Router** reads `window.location.hash` and renders the appropriate view
2. **Home View** displays hero, timeline, eligibility checker, video hub, and quiz
3. **Phase Detail Views** provide rich, expanded content for each of the 6 election phases
4. **Chatbot** matches user queries against a keyword dictionary for safe, factual responses
5. **Language Toggle** re-renders the current view with translated content

### Technology Stack
- **Vanilla HTML/CSS/JavaScript** — no frameworks, zero dependencies
- **Node.js server** for production deployment
- **Google Cloud Run** for hosting
- **Google Antigravity** AI IDE for intent-driven development

---

## 📂 Project Structure
election-sathi/
- ├── index.html # Main app shell (header, footer, chatbot, router entry)
- ├── styles.css # All styling with CSS variables for theming
- ├── script.js # Router, views, quiz logic, chatbot logic, accessibility
- ├── i18n.js # Translations (EN/HI), timeline data, glossary, quiz questions
- ├── server.js # Node.js server for Cloud Run deployment
- ├── package.json # Node dependencies
- ├── Dockerfile # Container configuration
- └── README.md # You are here

---

## 🔑 Key Features

- **6-Phase Interactive Guide**: Registration → Announcement → Nominations → Campaigning → Polling Day → Counting & Results
- **"Am I Ready to Vote?" Eligibility Checker**
- **cVIGIL Reporting Guide** for election violations
- **Candidate Affidavit Lookup** via ECI portal
- **Interactive Quiz** — 5 questions with instant feedback
- **Video Learning Hub** — official ECI educational videos
- **AI Chatbot** — keyword-based Q&A for election queries
- **Glossary** — 10 key terms with live search
- **Full English/Hindi Support** with live language toggle
- **WCAG 2.1 AA Accessibility** — ARIA labels, keyboard navigation, screen reader support
- **Responsive Design** — works on mobile, tablet, and desktop

---

## 🚀 Live Demo

**[https://election-sathi-361877944088.europe-west1.run.app](https://election-sathi-361877944088.europe-west1.run.app)**

---

## 🛠️ How to Run Locally

1. Clone the repository
2. Open `index.html` in a browser
3. Or run with Node.js: `node server.js` and visit `http://localhost:8080`

---

## 📝 Assumptions Made

- User has basic familiarity with Indian democracy
- Information is based on official Election Commission of India (ECI) voter education material
- The chatbot uses keyword matching (not a live AI model) to ensure 100% factual accuracy
- Videos require internet connection (YouTube embeds)
- The app is educational and not an official ECI application

---

## 🔗 Resources

- [Election Commission of India](https://eci.gov.in)
- [National Voters' Services Portal](https://voters.eci.gov.in)
- [Voter Helpline App](https://play.google.com/store/apps/details?id=com.eci.citizen)

---

## ⚖️ Disclaimer

This application is created for educational purposes. All election information provided is based on official Voter Education material from the Election Commission of India. This is not an official ECI application.

---

## 👩‍💻 Built With

[Google Antigravity](https://antigravity.google.com/) — AI-powered intent-driven development
