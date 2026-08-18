# 🩺 Alafia AI

> **From uncertainty to appropriate care.**

Alafia AI is a voice-first, safety-controlled healthcare navigation platform designed for the Nigerian context.

It helps people move from **uncertain symptoms to clear next steps and appropriate care** by combining voice interaction, structured symptom understanding, deterministic triage, healthcare-facility matching, emergency guidance, navigation, and future provider coordination.

---

## 🚀 Hackathon

**Hackathon:** Hackaholics 7.0  
**Organizer:** Wema Bank  
**Location:** Lagos, Nigeria  
**Team:** Recursive R's  
**Product:** Alafia AI

---

# 📌 Table of Contents

- [Overview](#-overview)
- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [How Alafia Works](#-how-alafia-works)
- [Core Product Flow](#-core-product-flow)
- [Key Features](#-key-features)
- [MVP Scope](#-mvp-scope)
- [Real vs Prototype Features](#-real-vs-prototype-features)
- [Hospital Readiness](#-hospital-readiness)
- [Wema Bank Ecosystem](#-wema-bank-ecosystem)
- [Business Model](#-business-model)
- [Target Users](#-target-users)
- [Product Architecture](#-product-architecture)
- [Repository Structure](#-repository-structure)
- [Tech Stack](#-tech-stack)
- [Frontend](#-frontend)
- [Backend](#-backend)
- [API Structure](#-api-structure)
- [Environment Variables](#-environment-variables)
- [Local Development](#-local-development)
- [Running the Frontend](#-running-the-frontend)
- [Running the Backend](#-running-the-backend)
- [Health Check](#-health-check)
- [Development Workflow](#-development-workflow)
- [Team Roles](#-team-roles)
- [Safety & Responsible AI](#-safety--responsible-ai)
- [Privacy & Data Protection](#-privacy--data-protection)
- [Future Roadmap](#-future-roadmap)
- [Winning Demo](#-winning-demo)
- [Project Status](#-project-status)
- [Contributing](#-contributing)
- [License](#-license)

---

# 🌍 Overview

Healthcare emergencies often begin with uncertainty.

A person may experience:

- Chest pain
- Difficulty breathing
- Severe fever
- Sudden weakness
- Severe abdominal pain
- Loss of consciousness
- Other potentially serious symptoms

But the immediate question is often:

> **"How serious is this, and where should I go?"**

Alafia AI is designed to help answer that question safely.

Instead of functioning as another generic medical chatbot, Alafia focuses on:

1. Understanding what the user is experiencing.
2. Asking relevant follow-up questions.
3. Detecting potential red flags.
4. Classifying urgency using deterministic safety rules.
5. Providing appropriate next-step guidance.
6. Identifying suitable healthcare facilities.
7. Helping the user choose and navigate to a facility.
8. Preparing an emergency summary for potential provider handoff.

---

# 🚨 The Problem

In many healthcare situations, the biggest risk is not necessarily the illness itself.

It is **delay**.

People may:

- Ignore serious symptoms.
- Assume symptoms are minor.
- Self-medicate.
- Wait too long before seeking care.
- Struggle to explain symptoms.
- Face language barriers.
- Choose a hospital based only on distance.
- Not know which facility has the appropriate capability.
- Arrive at an unsuitable facility.
- Repeat the same information multiple times.

This creates a gap between:

**Symptom → Understanding → Decision → Appropriate Care**

Alafia is designed to reduce that gap.

---

# 💡 Our Solution

Alafia AI provides a single flow:

> **Speak → Understand → Triage → Guide → Route → Handoff**

A user can describe their symptoms naturally using their voice.

Alafia then:

1. Converts speech into structured information.
2. Asks targeted follow-up questions.
3. Identifies potential red flags.
4. Applies deterministic triage rules.
5. Assigns a severity level.
6. Provides appropriate safety guidance.
7. Finds relevant healthcare facilities.
8. Ranks facilities based on suitability.
9. Allows the user to select a facility.
10. Provides navigation.
11. Generates a structured emergency summary.

---

# 🧠 How Alafia Works

Alafia separates **AI language understanding** from **safety-critical decision-making**.

### AI handles:

- Speech-to-text
- Understanding natural language
- Multilingual interaction
- Extracting relevant information
- Generating understandable responses
- Text-to-speech where required

### Deterministic rules handle:

- Red-flag detection
- Severity classification
- Emergency escalation
- Safety-critical decisions

This creates an important principle:

> **AI understands. Rules protect.**

AI should not be allowed to freely decide whether a medical emergency is safe or unsafe.

---

# 🔄 Core Product Flow

```text
User
  │
  ▼
Voice Input
  │
  ▼
Speech-to-Text
  │
  ▼
Symptom Understanding
  │
  ▼
Follow-up Questions
  │
  ▼
Deterministic Triage Engine
  │
  ├── LOW
  ├── MEDIUM
  ├── HIGH
  └── CRITICAL
          │
          ▼
     Safety Guidance
          │
          ▼
   Healthcare Matching
          │
          ▼
   Hospital Recommendations
          │
          ▼
   User Selects Facility
          │
          ▼
      Navigation
          │
          ▼
 Emergency Summary / Handoff