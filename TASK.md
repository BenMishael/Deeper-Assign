# 🧩 DeeperDive Publisher Config Tool — Candidate Test

## 🎯 The Problem

**Taboola Support engineers** need to view and edit publisher configurations regularly. They're technical users who can work with simple CSS/JS and understand JSON, but have **limited expertise** — editing raw JSON files directly leads to syntax errors and frustration.

Currently, they struggle with:
- Finding the right configuration files
- Avoiding JSON syntax mistakes (commas, brackets, quotes)
- Understanding nested structures and arrays
- Keeping track of what changed

---

## 👥 Your Users

**Taboola Support Engineers:**
- Technical and data-savvy
- Comfortable with dashboards and tools
- Can create simple CSS/JS solutions when needed
- Understand JSON structure but have **limited knowledge** — they know what it is, but syntax errors, nested structures, and complex edits can trip them up
- Need to work quickly and confidently
- Shouldn't worry about breaking JSON syntax or structure

**Your goal:** Design and build a tool that makes configuration editing **safe, visual, and intuitive** for them. They understand the data, but need protection from common mistakes.

---

## 📊 The Data

You have publisher configuration data in JSON format:

- `publishers.json` — registry of all publishers  
- `publisher-aurora.json`  
- `publisher-borealis.json`  
- `publisher-cascade.json`  
- `publisher-summit.json`

Each publisher configuration contains fields like:
- Basic info: `publisherId`, `aliasName`, `isActive`
- Page configurations: array of pages with `pageType`, `selector`, `position`
- Dashboard URLs: `publisherDashboard`, `monitorDashboard`, `qaStatusDashboard`
- Optional fields: `customCss`, `tags`, `allowedDomains`, `notes`, etc.

**Note:** Configurations have slightly different fields — your tool should handle this gracefully.

---

## 🎨 Your Mission

Build a web-based tool that helps Support engineers:

- **Browse and select** publishers
- **View and edit** configurations
- **See changes** in real-time
- **Export or save** updated configurations

**How you do this is up to you.** Think about:
- What's the best way to present this data?
- How do you make editing safe and error-proof?
- What visual design helps Support work efficiently?
- Should it be a form? A structured editor? Something else?

**Design it for your users** — consider their needs, workflow, and what would make them confident and productive.

---

## 🛠️ Technical Context

**Technology Requirements:**
- **TypeScript** — Write your solution in TypeScript (no frameworks like React, Vue, Angular, etc.)
- Plain HTML, CSS, and TypeScript — build it from scratch
- ESLint is configured and ready to use

**Available:**
- Basic `index.html` in `/public/`
- Data files in `/data/`: JSON configuration files
- Express server in `/src/server.ts` (optional — if you have time)
- TypeScript compiler and ESLint configured

**Running the tool:**

```bash
npm install
npm run dev    # Runs on http://localhost:3000
```

**Two approaches:**
- **Client-side only:** Load JSON files directly using `fetch('/data/publishers.json')`
- **With server:** Use API endpoints (`GET /api/publishers`, `GET /api/publisher/:filename`, `PUT /api/publisher/:filename`)

Choose what makes sense for your design.

**Using AI/Tools:**
- You can use AI, Cursor, or any tools you want
- **Important:** You must understand all the code in your solution — we will review the code flow together

---

## 📦 Deliverables

**Required:**
- Working tool with your UI/UX design
- TypeScript source code in `/public/` (HTML, CSS, TypeScript files)
- Server code in `/src/` (optional, if using server)
- **Documentation** explaining how the system works

**Optional (but valued):**
- Server-side implementation (`/src/server.ts`)
- Tests (unit tests, integration tests, etc.)
- Additional polish and features

**Documentation & Presentation:**
Think about how you would **present this system to Support engineers** as if you're introducing it in a team meeting. Consider:
- How would you explain the tool to them?
- What's the best way to show them how to use it?
- What documentation would help them understand and use it effectively?

You'll present your solution in a meeting where we'll review the code together.

---

## 📊 Evaluation Criteria

**What we're looking for:**
- **Functionality**: Does it work? Can users achieve their goals?
- **Design & UX**: Is it intuitive for Support engineers? Is it well-designed?
- **Code Quality**: Clean, readable, maintainable TypeScript
- **Documentation & Presentation**: Can you explain it clearly? Is it well-documented?

**Optional (bonus):**
- Server-side implementation
- Tests
- Additional features and polish

---

## 📅 The Meeting

After you submit your solution, we'll have a meeting where you'll:

1. **15 minutes:** Present your system to us (as if we're the Support team)
   - Explain how it works
   - Show how Support engineers would use it
   - Walk through key features

2. **30 minutes:** Deep code review together
   - We'll review the code flow
   - Discuss your implementation decisions
   - You should be able to explain any part of your code

3. **30 minutes:** Get to know each other

4. **Q&A:** Open discussion

**Prepare to explain your code** — we'll review it together, so make sure you understand everything you built.
