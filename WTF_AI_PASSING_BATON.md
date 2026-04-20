# WTF AI Passing Baton

## 🎯 GOAL & PROJECT OUTLINE
**Goal:** Automate the creation of high-quality "WTF Stats" graphics for IG/X. The final output must be exactly 4000x5333 pixels, imitating the original WTF Stats style (fonts, layout, colors) perfectly. The long-term vision is full multi-platform automation, but currently relies on the GM (Grandmaster) to guide the training.
**Outline:** The app acts as a 6-step tool:
1. Stat Input (Manual text for MVP)
2. Text Editor (Context, visual spacing)
3. Photo Upload
4. Table Upload (Optional)
5. Visual Controls (Zooming, moving)
6. Export (Render DOM to 4000x5333 PNG)

## 🚨 STRICT PROTOCOL (PERMANENT INK - NEVER DELETE)
1. **REPEAT & CLARIFY BEFORE ACTING:** ALWAYS respond back simply repeating what the user asked you to do. Explain your proposed logic/why and *ask for confirmation* before changing code. 
2. **VERCEL PREVIEW PUSHES:** NEVER push to the `main` branch. The GM has limits on production deployments. ALWAYS explicitly checkout and push everything exclusively to the `preview` branch (`git push origin preview`). You do not need GM's permission to push to the preview branch, keep continually pushing your code iterations there.
3. **JOURNALING:** This document must be updated continuously. Treat it like permanent ink. Add new dates/entries to the bottom capturing what was built, what broke, and what the next agent needs to know. Do NOT delete old entries.
4. **STYLE TRAINING:** Keep adding to the `pbs_script.md` artifact to learn and mimic the exact phrasing/spacing stylistic choices of the Grandmaster over time.
5. **BRAND HEADER LOCK:** The top logo/header generation inside the Next.js `page.tsx` canvas utilizes raw, external static snapshots via `<img>` tag (e.g. `wtf-x-logo.jpg`). NEVER, under any circumstance, attempt to recreate these headers using HTML/CSS or React icons. The Brand Select dropdown seamlessly updates the `img` path. This mechanism is permanently locked.

---

### Journal Log
*   **(April 19, 2026)** - Initial project setup. Created scaffolding for Next.js MVP focusing on the 6-step wizard and 4000x5333 output requirement.
*   **(April 19, 2026)** - [Vercel Build Fix] Missing `autoprefixer` module caused remote build to fail. Hand-injected into package.json and pushed alongside the core 6-step MVP UI skeleton.
*   **(April 19, 2026)** - [AI & JPG Update] Integrated Gemini AI for image scanning and "WTF Style" text rewording. Switched final output to JPG (4000x5333). Added API validation warning and loading spinners for all AI actions.
