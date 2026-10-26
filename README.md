# Project Manager AI

**Legacy Project Client Onboarding Planner**

A frontend-only React application that helps project managers prepare professional client onboarding and takeover plans for existing legacy software projects.

## Important limitations

- **Frontend only.** There is no backend, API server, database, authentication, or cloud functions.
- **No persistent storage.** Data lives in React state while the page is open. Refreshing the browser clears everything.
- **No automatic AI calls.** The plan is produced by a deterministic frontend template that uses the form fields you fill in. Pasted “Previous Context” is stored for reference and is **not** parsed or analysed automatically.
- **No retrieval of prior chats.** You must paste any meeting notes, prior prompts, or discussion text yourself.
- To add real AI generation later, you would need a separately configured service and API key (not included).

## Tech stack

- React 19 + TypeScript
- Vite
- Standard CSS (no UI library required)

## Getting started

```bash
cd project-manager-ai
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

### Production build

```bash
npm run build
npm run preview
```

### Type check

```bash
npx tsc -b --noEmit
```

## How to use

1. Enter project details (name, domain, stack, team, contacts, status, known issues).
2. Optionally paste previous context (notes, prior AI responses, meeting summaries).
3. Adjust the Project Management Prompt if desired (a sensible default is pre-filled).
4. Click **Generate Plan**.
5. Review the structured plan in **Onboarding View** (client takeover phases).
6. Open **SDLC View** for Requirements → Design → Implementation → Testing → Deployment → Maintenance stages adapted for legacy systems.
7. Switch to **JSON View** to edit, validate, format, or copy the full JSON object (includes both onboarding and SDLC sections).
8. Use **Reset** to clear form and result (with confirmation when data exists).

## Plan structure

Generated output follows a consistent schema including:

- Project overview
- Six onboarding phases (Discovery → Technical Assessment → Codebase Review → Scope Validation → Pilot Change → Governance)
- SDLC-aligned stages (Requirements, Design, Implementation, Testing, Deployment, Maintenance) with entry/exit criteria, artefacts, and legacy focus
- Risks, dependencies, assumptions, open questions, and next actions
- Metadata stating that generation used a frontend template

Unknown or missing inputs are marked as “To be confirmed” or listed under assumptions / open questions. The app does not invent client commitments, deadlines, or budgets.

## Project layout

```
src/
  App.tsx              # Main shell, tabs, state
  App.css              # Dashboard styles
  components/
    ProjectForm.tsx    # Input form
    PlanView.tsx       # Onboarding View of the plan
    SdlcView.tsx       # SDLC-aligned stage views
    JsonView.tsx       # JSON editor + validate/copy
  types/plan.ts        # TypeScript types and defaults
  utils/generatePlan.ts # Template-based plan generator
```

## Live demo

Hosted on GitHub Pages: https://allanvarghese567-lab.github.io/project-manager-ai/

## Licence

Use and adapt freely for internal project-management tooling.
