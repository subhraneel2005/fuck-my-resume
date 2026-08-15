PRD — FuckThisApplication MVP
1. Product

FuckThisApplication is a job-application copilot that removes repetitive work from applying to jobs.

Given a user's base resume + job description, it generates:

Tailored ATS-friendly resume
Personalized cold email
Personalized cold DM

The user brings their own AI API key, so the product doesn't need to pay for inference.

2. Core Value Proposition

Paste a JD. Get everything you need to apply.

No repeatedly opening ChatGPT/Claude, uploading your resume, editing LaTeX, opening Overleaf, downloading PDFs, and asking AI to write another cold email.

3. BYOK — Bring Your Own Key

This is part of the MVP.

Supported providers

Start with:

OpenAI
Anthropic
Google Gemini

Use Vercel AI SDK as the unified AI layer.

User API Key
     ↓
Provider selection
     ↓
Vercel AI SDK
     ↓
LLM
UX

Settings:

AI Provider


○ OpenAI
○ Anthropic
○ Google


API Key
[ sk-**************** ]


Model
[ Select model ]


[ Save ]

The user should be able to change:

Provider
API key
Model
Security

Do not store API keys in plaintext on the server.

Prefer:

Browser
   ↓
User's API key
   ↓
AI request
   ↓
Provider

If the architecture requires server-side calls, encrypt stored keys.

The product should clearly tell users:

Your API key is yours. We don't charge you for AI usage.

4. AI Architecture

Use Vercel AI SDK for all model interaction.

Do not build separate provider-specific AI logic throughout the application.

Create a single AI abstraction:

Application
     ↓
AI Service
     ↓
Vercel AI SDK
     ↓
┌─────────┬───────────┬─────────┐
│ OpenAI  │ Anthropic │ Gemini  │
└─────────┴───────────┴─────────┘

Different operations:

parseResume()
tailorResume()
generateEmail()
generateDM()

Each returns structured output where possible.

5. Base Resume

User uploads their resume PDF once.

PDF
 ↓
Text extraction
 ↓
Vercel AI SDK
 ↓
Structured Resume JSON
 ↓
User review
 ↓
Save Base Resume

The base resume becomes the user's source of truth.

6. Resume Tailoring

Input:

Base Resume
+
Job Description

AI determines:

Relevant experience
Relevant projects
Relevant skills
JD keywords
Which bullets should be rewritten
Which content should be emphasized
Which content should be deprioritized

AI may rewrite existing content but must never fabricate experience.

7. Resume Generation

Do not have the LLM regenerate the entire LaTeX file.

Use:

Base Resume JSON
       ↓
   AI Tailoring
       ↓
Tailored Resume JSON
       ↓
Jake's Resume LaTeX Template
       ↓
      PDF

This makes the resume output deterministic and much easier to maintain.

8. Cold Email

Input:

JD
Tailored resume
Company
Recipient name
Recipient role
Optional profile/post context

Output:

Short personalized email
~80–150 words
No generic corporate fluff
Clear reason for contacting them
Relevant proof
Simple CTA

Actions:

Copy
Edit
Regenerate
9. Cold DM

Input:

JD
Tailored resume
Recipient
Optional profile/post context

Output:

Short
Direct
Personalized
Human
No "I hope you're doing well"
No unnecessary introduction

Target:

~300 characters where possible.

Actions:

Copy
Edit
Regenerate
10. Application Workspace

Each application gets its own workspace.

Acme — AI Engineer


Job Description
─────────────────
...


[ Generate ]


─────────────────


Resume
[Preview]


[ Edit ] [Render PDF] [Download]


─────────────────


Cold Email
...


[Edit] [Copy] [Regenerate]


─────────────────


Cold DM
...


[Edit] [Copy] [Regenerate]
11. Pages
Landing

Simple explanation + CTA.

Base Resume

Upload and configure reusable resume.

Dashboard

List previous applications.

Application Workspace

The main product.

Settings

AI provider + BYOK configuration.

12. Tech Stack
Frontend
Next.js
TypeScript
Tailwind
shadcn/ui
AI

Vercel AI SDK

Providers:

@ai-sdk/openai
@ai-sdk/anthropic
@ai-sdk/google
Resume
PDF text extraction
Structured JSON
Jake's Resume LaTeX template
LaTeX → PDF rendering
Storage

For MVP:

PostgreSQL
Object storage for uploaded/generated files

Could even keep persistence extremely simple for the first local prototype.

13. Data Model
User
 ├── AISettings
 │     ├── provider
 │     ├── encryptedApiKey
 │     └── model
 │
 ├── BaseResume
 │     ├── rawText
 │     └── resumeJSON
 │
 └── Applications
       ├── company
       ├── jobTitle
       ├── jobDescription
       ├── recruiter
       ├── tailoredResumeJSON
       ├── latex
       ├── pdf
       ├── coldEmail
       ├── coldDM
       └── createdAt
14. MVP Generation Pipeline
                 ┌──────────────┐
                 │  Base Resume │
                 └──────┬───────┘
                        │
                        ▼
JD ──────────────→ Resume Tailor
                        │
                        ▼
                Tailored Resume JSON
                        │
                        ▼
                 Jake's LaTeX
                        │
                        ▼
                       PDF




JD + Resume + Recruiter Context
               │
               ▼
        ┌──────┴──────┐
        ▼             ▼
   Cold Email      Cold DM

All AI calls go through Vercel AI SDK + user's API key.

15. Non-MVP

Do not build:

LinkedIn scraping
Job scraping
Automatic applications
Automatic emailing
Gmail integration
LinkedIn integration
Browser extension
ATS scoring
Multiple resume templates
Payments
Job board integrations
RAG
Vector DB
Multi-agent architecture
Complex analytics
16. MVP Definition of Done

A user can:

 Upload their resume
 Convert it into a reusable base resume
 Configure their own AI provider/API key
 Select an AI model
 Paste a JD
 Generate a tailored resume
 Render it into PDF
 Download the PDF
 Generate a cold email
 Generate a cold DM
 Edit outputs
 Copy outputs
 Regenerate outputs
 Return later and see previous applications
The final experience
                 PASTE JD
                    │
                    ▼
             FuckThisApplication
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
     RESUME       EMAIL         DM
        │
        ▼
      PDF
        │
        ▼
   APPLY & MOVE ON

BYOK + Vercel AI SDK is a particularly good fit for this MVP because you avoid inference costs while keeping the provider/model layer flexible.