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
6. **NO BROWSER VERIFICATION:** NEVER open the browser to check Vercel preview deployments. The GM verifies all previews. Push code to the `preview` branch and report what was changed — the GM handles all visual QA. This avoids excessive screen recording data and wasted compute.

---

### Journal Log
*   **(April 19, 2026)** - Initial project setup. Created scaffolding for Next.js MVP focusing on the 6-step wizard and 4000x5333 output requirement.
*   **(April 19, 2026)** - [Vercel Build Fix] Missing `autoprefixer` module caused remote build to fail. Hand-injected into package.json and pushed alongside the core 6-step MVP UI skeleton.
*   **(April 19, 2026)** - [AI & JPG Update] Integrated Gemini AI for image scanning and "WTF Style" text rewording. Switched final output to JPG (4000x5333). Added API validation warning and loading spinners for all AI actions.
*   **(April 21, 2026)** - [Code Audit & Theme Overhaul] Full codebase audit: fixed 5 bugs (state declaration ordering, genAI module-scope init in reword route, hardcoded MIME type in vision route, GraphicTemplate remounting). Added Photo Upload Toggle (raw vs AI generate) in Step 3. Complete WTF Sports brand theme overhaul — navy (#3b3b6d) and crimson (#b42434) across entire UI: sidebar, nav, buttons, sliders, scrollbar, inputs, preview stage. Updated Tailwind config with brand color tokens.
*   **(April 21, 2026)** - [Clay Figurine Style] Rewrote generate API prompt to produce 3D clay figurine style images — faceless smooth matte clay figures with blank oval heads, realistic proportions, team-colored uniforms. Embedded full 32-team NFL color reference dataset (hex codes from GM's Google Sheet) directly into the route. Reference image upload also supported for richer context.
