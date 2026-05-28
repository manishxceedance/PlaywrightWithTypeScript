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
        const selected = quiz.querySelector(
          `input[name="quiz-${quizIndex}-q${questionIndex}"]:checked`
        );

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

document.addEventListener('DOMContentLoaded', () => {
  injectHomeButton();
  toggleMenu();
  setupQuizAutoGrader();
});
