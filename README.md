# Playwright/TypeScript Training Hub

This project is a static website designed for manual testers who want to learn TypeScript from scratch and become confident at an advanced level.

## What is included
- Two main tutorial menus: **TypeScript** and **Playwright**
- A full **Playwright Mastery Roadmap** split into 19 module pages, each with beginner-friendly notes and explanations
- A dedicated **Playwright Final Capstone (50 MCQ)** with score bands
- A new **Lesson 0** for absolute beginners in JavaScript basics (var, let, const, get, scope, loops, functions)
- Detailed internal pages for each topic
- Friendly, practical code examples on every page
- End-of-lesson practice exercises
- End-of-lesson MCQ quizzes with instant in-browser grading
- Mobile-friendly responsive layout
+ **Practice App**: Hands-on web playground with all major HTML controls, advanced custom controls (dropdown, multi-select, checkbox-dropdown), grid/table with embedded controls, iframe, and Shadow DOM demo
+ Modern, unified navigation across all learning and practice pages
+ Visually attractive, accessible, and automation-friendly UI

## Run locally
Since this is a static site, you can open `index.html` directly, or use a small static server.

## Free GitHub hosting (GitHub Pages)
1. Create a GitHub repository and push this project.
2. Open repository **Settings**.
3. Go to **Pages**.
4. Set **Source** to `Deploy from a branch`.
5. Select branch `main` and folder `/ (root)`.
6. Save and wait for publishing.
7. Your site will be available on `https://<your-username>.github.io/<repo-name>/`.

## Recommended structure
- `index.html`: Home page and learning roadmap
- `assets/`: Shared CSS and JS
- `lessons/`: Internal tutorial pages grouped by menu
+ `lessons/practice-app/`: Practice playground with all controls, grid, iframe, and custom elements
+ `lessons/practice-app/custom-controls.js`: Custom dropdown, multi-select, and checkbox-dropdown web components
+ `lessons/practice-app/style.css`: Modern, attractive styling for all practice-app pages
+ `lessons/practice-app/grid-controls.html`: Grid/table with embedded controls
+ `lessons/practice-app/shadow.html` & `shadow.js`: Shadow DOM custom element demo
+ `lessons/practice-app/grid-frame.html` & `mini-form.html`: Table/grid and iframe with mini-form
