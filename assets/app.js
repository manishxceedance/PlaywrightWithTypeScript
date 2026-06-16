function toggleMenu() {
  const button = document.querySelector('[data-menu-toggle]');
  const sidebar = document.querySelector('[data-sidebar]');

  if (!button || !sidebar) {
    return;
  }

  button.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
}

function resolveMainHomeHref() {
  const path = window.location.pathname.replace(/\\/g, '/');
  const segments = path.split('/').filter(Boolean);
  const markers = ['lessons', 'pages'];

  for (const marker of markers) {
    const markerIndex = segments.lastIndexOf(marker);
    if (markerIndex === -1) {
      continue;
    }

    const depth = segments.length - markerIndex - 1;
    return `${'../'.repeat(depth)}index.html`;
  }

  return 'index.html';
}

function injectHomeButton() {
  if (document.querySelector('[data-home-button]')) {
    return;
  }

  const homeLink = document.createElement('a');
  homeLink.href = resolveMainHomeHref();
  homeLink.textContent = 'Home';
  homeLink.className = 'home-btn';
  homeLink.setAttribute('data-home-button', 'true');
  homeLink.setAttribute('aria-label', 'Go to main homepage');

  const topbar = document.querySelector('.topbar');
  if (topbar) {
    const menuButton = topbar.querySelector('[data-menu-toggle]');
    if (menuButton) {
      topbar.insertBefore(homeLink, menuButton);
      return;
    }

    topbar.appendChild(homeLink);
    return;
  }

  homeLink.classList.add('floating-home-btn');
  document.body.appendChild(homeLink);
}

function setupQuizAutoGrader() {
  const quizzes = document.querySelectorAll('[data-quiz]');

  quizzes.forEach((quiz, quizIndex) => {
    const button = quiz.querySelector('[data-grade]');
    const result = quiz.querySelector('[data-result]');
    const questions = quiz.querySelectorAll('[data-answer]');

    if (!button || !result || questions.length === 0) {
      return;
    }

    button.addEventListener('click', () => {
      let score = 0;

      questions.forEach((question, questionIndex) => {
        const expected = question.getAttribute('data-answer');
        const expectedInput = question.querySelector(`input[value="${expected}"]`);
        const expectedLabel = expectedInput ? expectedInput.closest('label') : null;
        const expectedText = expectedLabel
          ? expectedLabel.textContent.replace(/^\s+|\s+$/g, '')
          : 'Correct option unavailable';
        const selected = question.querySelector('input:checked');

        let feedback = question.querySelector('[data-feedback]');
        if (!feedback) {
          feedback = document.createElement('p');
          feedback.setAttribute('data-feedback', 'true');
          feedback.className = 'answer-feedback';
          question.appendChild(feedback);
        }

        if (selected && selected.value === expected) {
          score += 1;
          question.classList.remove('incorrect');
          question.classList.add('correct');
          feedback.textContent = `Correct. Right answer: ${expectedText}`;
        } else {
          question.classList.remove('correct');
          question.classList.add('incorrect');
          feedback.textContent = `Not correct. Right answer: ${expectedText}`;
        }
      });

      result.textContent = `Your score: ${score}/${questions.length}. Keep practicing until you hit full score.`;
    });
  });
}

function normalizePlaywrightSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) {
    return;
  }

  const links = Array.from(sidebar.querySelectorAll('a'));
  const isPlaywrightPage = links.some((link) => {
    const href = link.getAttribute('href') || '';
    return href.includes('playwright');
  });

  if (!isPlaywrightPage) {
    return;
  }

  const currentPath = window.location.pathname.replace(/\\/g, '/');
  const inModulePage = currentPath.includes('/lessons/playwright/modules/');
  const capstoneHref = inModulePage
    ? '../99-playwright-capstone-50-mcq.html'
    : '99-playwright-capstone-50-mcq.html';

  sidebar
    .querySelectorAll('a[href="$199-playwright-capstone-50-mcq.html"]')
    .forEach((anchor) => {
      anchor.setAttribute('href', capstoneHref);
    });

  // Remove duplicate list entries created by accidental repeated replacements.
  sidebar.querySelectorAll('ul').forEach((list) => {
    const seen = new Set();

    list.querySelectorAll('li > a').forEach((anchor) => {
      const href = anchor.getAttribute('href') || '';
      const key = `${anchor.textContent.trim()}|${href}`;

      if (seen.has(key)) {
        if (anchor.parentElement) {
          anchor.parentElement.remove();
        }
        return;
      }

      seen.add(key);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  injectHomeButton();
  normalizePlaywrightSidebar();
  toggleMenu();
  setupQuizAutoGrader();
});
