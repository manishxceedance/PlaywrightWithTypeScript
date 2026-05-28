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

# Playwright Lessons to Practice App Mapping

This document maps the Playwright lessons and modules to the relevant files in the `practice-app` folder. Use this mapping to practice the concepts taught in each module.

## Mapping

### Module 4: Locators
- **Lesson Focus**: Locating elements using CSS, XPath, and other strategies.
- **Practice App Files**:
  - `grid-controls.html` (Grid elements for practicing locators)
  - `mini-form.html` (Form elements for locator practice)

### Module 5: Actions and Elements
- **Lesson Focus**: Interacting with elements (click, type, etc.).
- **Practice App Files**:
  - `mini-form.html` (Form interactions)
  - `grid-controls.html` (Grid interactions)

### Module 6: Wait Handling
- **Lesson Focus**: Handling dynamic waits and synchronization.
- **Practice App Files**:
  - `grid-frame.html` (Dynamic content loading)
  - `mini-form.html` (Form submission waits)

### Module 7: Browser Handling
- **Lesson Focus**: Managing browser contexts, tabs, and navigation.
- **Practice App Files**:
  - `index.html` (Navigation scenarios)
  - `grid-frame.html` (Frame handling)

### Module 8: Validation
- **Lesson Focus**: Validating UI elements and states.
- **Practice App Files**:
  - `grid-controls.html` (Grid validation)
  - `mini-form.html` (Form validation)

### Module 9: Test Data
- **Lesson Focus**: Using test data for automation.
- **Practice App Files**:
  - `custom-controls.js` (Dynamic data handling)

### Module 10: Framework Design
- **Lesson Focus**: Structuring Playwright test frameworks.
- **Practice App Files**:
  - No direct mapping; focus on external framework setup.

### Module 11: API Testing
- **Lesson Focus**: API testing with Playwright.
- **Practice App Files**:
  - No direct mapping; focus on API tools.

### Module 12: Authentication
- **Lesson Focus**: Handling authentication flows.
- **Practice App Files**:
  - `index.html` (Login simulation)

### Module 13: Execution
- **Lesson Focus**: Running tests in different environments.
- **Practice App Files**:
  - No direct mapping; focus on execution strategies.

### Module 14: Reporting
- **Lesson Focus**: Generating test reports.
- **Practice App Files**:
  - No direct mapping; focus on reporting tools.

### Module 15: Debugging
- **Lesson Focus**: Debugging Playwright tests.
- **Practice App Files**:
  - `shadow.html` (Debugging shadow DOM issues)

### Module 16: CI/CD
- **Lesson Focus**: Integrating Playwright with CI/CD pipelines.
- **Practice App Files**:
  - No direct mapping; focus on CI/CD setup.

### Module 17: Advanced Topics
- **Lesson Focus**: Advanced Playwright features.
- **Practice App Files**:
  - `shadow.html` (Advanced shadow DOM handling)

### Module 18: Best Practices
- **Lesson Focus**: Playwright best practices.
- **Practice App Files**:
  - No direct mapping; focus on general practices.

### Module 19: Project Implementation
- **Lesson Focus**: Implementing a complete project.
- **Practice App Files**:
  - All files (Comprehensive practice)

### Module 20: DOM Challenges Lab
- **Lesson Focus**: Handling frames, shadow DOM, alerts, and duplicate locators.
- **Practice App Files**:
  - `grid-frame.html` (Frame handling)
  - `shadow.html` (Shadow DOM handling)
  - `mini-form.html` (Alerts and duplicate locators)
