<div align="center">

# BizOS

**A business-centric operating system for Indian MSMEs.**
One connected view of your business, with people in control of every important decision.

[Live Demo](https://darahas476-ux.github.io/bizos/) · [Source Code](https://github.com/darahas476-ux/bizos)

<!-- Add a screenshot: <img src="assets/screenshots/bizos-home.png" alt="BizOS preview" width="900"> -->

</div>

---

## Overview

BizOS is a hackathon project that explores a shared layer connecting customers, invoices, tasks, documents, and business activity through a **Business Graph**, with AI agents envisioned on top to coordinate routine work.

> **Status:** This is a concept prototype. The public website presents the vision and design direction. WhatsApp, voice, accounting, GST/DPDP monitoring, and autonomous AI agents are **roadmap items**, not implemented features.

## Problem

Small businesses run on disconnected tools: conversations in WhatsApp, accounts in accounting software, tracking in spreadsheets, and follow-ups in someone's memory. The owner ends up being the integration layer, which doesn't scale.

## Concept

BizOS links every conversation, payment, and commitment back to the relevant business record, then uses that shared context to:

- **Answer questions**: "How much did we sell this month?" "Who needs a follow-up?"
- **Capture information**: turn invoices and conversations into structured records.
- **Prioritize the day**: surface overdue items, deadlines, and pending work.
- **Coordinate routine work**: propose reminders, finance checks, and tasks.
- **Keep humans in control**: require approval for sensitive actions.

## Architecture (planned)

```
Interfaces (Web · WhatsApp · Voice)
              ↓
   Business Graph (customers, vendors, invoices, tasks, documents)
              ↓
   Business Memory (history and searchable context)
              ↓
   AI Agents (finance, collections, compliance, communication)
              ↓
   Human Approval Gates
              ↓
   Outcomes and Feedback
```

This diagram shows the intended design, not the services currently deployed.

## Tech Stack

| Technology | Purpose |
|---|---|
| React + TypeScript | Frontend UI |
| Three.js | 3D and interactive visuals |
| Rust | Backend components |
| Python | Backend logic and AI experimentation |
| GitHub Pages | Demo hosting |

## Getting Started

```bash
git clone https://github.com/darahas476-ux/bizos.git
cd bizos
npm install
npm run dev
```

> Replace the commands above with the exact scripts from `package.json`. Backend components (Rust/Python) may have separate setup steps. Never commit API keys or secrets.

## Roadmap

- [ ] Business-record and document linking
- [ ] WhatsApp and voice interfaces
- [ ] AI-assisted collections and task coordination
- [ ] Compliance deadline tracking
- [ ] Human-approved workflow execution
- [ ] Outcome metrics (time saved, follow-through)

## Team

Built collaboratively during a hackathon. Contributions overlapped across the team.

| Name | Role | Contribution |
|---|---|---|
| **Darahas Thandra** | Full-stack developer | Led website implementation across frontend and backend using React, TypeScript, Three.js, Rust, and Python |
| **T. Vishwagnaya** | Project orchestration and development | Coordinated the team and played a key role in building the project and moving the work forward |
| **Ashraf** | Media and marketing | Created the product demo video and supported media and marketing presentation |
| **Abhijit** | presentation | Contributed to frontend UI, X (Twitter) design and content, and the project presentation |

<!-- Link each name to their GitHub/LinkedIn, e.g. [Darahas Thandra](https://github.com/darahas476-ux) -->

## License

This project is licensed under the [MIT License](LICENSE).

## Feedback

Feedback on the concept, UX, architecture, or implementation is welcome. Open an issue or start a discussion.

---

<div align="center">

*Built collaboratively during a hackathon.*

</div>
