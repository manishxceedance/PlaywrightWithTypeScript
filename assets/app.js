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

  if (/\/lessons\/neoload\/day-\d{2}\.html$/.test(path)) {
    return '../../pages/neoload.html';
  }

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

function setupNeoLoadPracticeAndSelfCheck() {
  const lesson = document.querySelector('main.lesson');
  const match = window.location.pathname.match(/\/lessons\/neoload\/day-(\d{2})\.html$/);

  if (!lesson || !match || lesson.querySelector('[data-neoload-self-check]')) {
    return;
  }

  const day = Number(match[1]);
  const content = {
    1: {
      practice: ['Open the approved HRMS training URL.', 'Record the login journey as UP_HRMS_Login.', 'Replay it with one virtual user and note response time, throughput, and errors.'],
      questions: [
        ['What is the safest first execution level?', ['Peak load', 'One virtual user', 'Unlimited users'], 'b'],
        ['What does response time measure?', ['Time taken by a request or transaction', 'Number of users', 'Number of test files'], 'a'],
        ['What does throughput measure?', ['Failed requests only', 'Completed work per time unit', 'Browser memory'], 'b'],
        ['Why use an HTTPS training endpoint?', ['It can be recorded as a web journey', 'It disables all assertions', 'It creates production data'], 'a'],
        ['What should be saved after the first replay?', ['Only the browser history', 'The project and replay evidence', 'A production credential'], 'b']
      ]
    },
    2: {
      practice: ['Choose one business risk.', 'Select the matching test type.', 'Write the workload, duration, and success criteria that would investigate it.'],
      questions: [
        ['Which test studies expected business demand?', ['Load test', 'Syntax test', 'Unit test'], 'a'],
        ['Which test increases demand beyond expected capacity?', ['Stress test', 'Smoke test', 'Code review'], 'a'],
        ['What should a test type be based on?', ['The business question', 'The shortest name', 'Random user count'], 'a'],
        ['What makes a test result useful?', ['Clear workload and success criteria', 'No recorded scope', 'Changing goals during the run'], 'a'],
        ['What does an endurance test emphasize?', ['Stability over an extended duration', 'One request only', 'Installer size'], 'a']
      ]
    },
    3: {
      practice: ['Open NeoLoad and confirm the approved version.', 'Create a training project.', 'Map the plan, design, validate, execute, analyze, and report stages.'],
      questions: [
        ['Which activity belongs in the design stage?', ['Create user paths and workload structure', 'Publish production code', 'Delete test evidence'], 'a'],
        ['Why confirm the NeoLoad version?', ['To make execution reproducible', 'To increase CPU automatically', 'To bypass approvals'], 'a'],
        ['What is the purpose of project organization?', ['Keep scripts and results reviewable', 'Hide errors', 'Remove all monitoring'], 'a'],
        ['Which stage reviews measured results?', ['Analyze', 'Install', 'Record password'], 'a'],
        ['What should be documented with the project?', ['Environment and version assumptions', 'Private secrets in plain text', 'Unrelated files'], 'a']
      ]
    },
    4: {
      practice: ['Open the approved target with a safe account.', 'Record one short user journey.', 'Replay it with one virtual user and remove obvious noise.'],
      questions: [
        ['What should be recorded first?', ['A short valid business journey', 'A full production outage', 'Random browser tabs'], 'a'],
        ['Why use a safe test account?', ['To avoid unsafe data and side effects', 'To bypass the target', 'To increase errors'], 'a'],
        ['What should happen after recording?', ['Replay and validate the journey', 'Immediately run peak load', 'Delete the project'], 'a'],
        ['What is recording noise?', ['Requests unrelated to the business journey', 'A successful assertion', 'A test objective'], 'a'],
        ['What is the first replay goal?', ['Functional validity with one user', 'Maximum throughput', 'Stress beyond capacity'], 'a']
      ]
    },
    5: {
      practice: ['Open the recorded user path.', 'Group requests into pages and business transactions.', 'Rename them consistently and verify the names in results.'],
      questions: [
        ['Why group requests into transactions?', ['To report business steps clearly', 'To hide response times', 'To remove all requests'], 'a'],
        ['What makes a transaction name useful?', ['It describes the business action', 'It is random', 'It contains a secret'], 'a'],
        ['What should be checked after renaming?', ['The names appear correctly in results', 'The browser is closed forever', 'The environment is changed'], 'a'],
        ['A page usually represents what?', ['A logical part of a user journey', 'A license key', 'A server reboot'], 'a'],
        ['What is a poor naming practice?', ['Using inconsistent or vague labels', 'Using business language', 'Keeping names stable'], 'a']
      ]
    },
    6: {
      practice: ['Review every recorded request.', 'Mark each request keep, remove, or investigate.', 'Add realistic think time and save a clean project version.'],
      questions: [
        ['What should be removed from a user path?', ['Irrelevant recording noise', 'Required business requests', 'Assertions'], 'a'],
        ['What does think time model?', ['User decision or reading time', 'Server CPU', 'A database schema'], 'a'],
        ['Why document filtering decisions?', ['To make the script reviewable', 'To conceal changes', 'To disable replay'], 'a'],
        ['What should be checked after cleanup?', ['The journey still replays correctly', 'All requests fail', 'The test has no timing'], 'a'],
        ['Why save a clean project version?', ['To preserve a known test state', 'To overwrite evidence', 'To avoid naming files'], 'a']
      ]
    },
    7: {
      practice: ['Create approved data with multiple records.', 'Parameterize username, search term, and an identifier.', 'Run multiple iterations and verify that records change as intended.'],
      questions: [
        ['What does parameterization provide?', ['Controlled variation in test data', 'Automatic production access', 'Permanent static values'], 'a'],
        ['Which value is usually per-user?', ['A session-specific username', 'A shared base URL', 'A page title'], 'a'],
        ['What is a data dictionary for?', ['Documenting source, scope, lifetime, and masking', 'Storing production secrets', 'Deleting variables'], 'a'],
        ['What should happen when a value changes per iteration?', ['Use a suitable variable source', 'Hard-code it permanently', 'Ignore it'], 'a'],
        ['Why mask sensitive values?', ['To prevent exposure in logs and reports', 'To increase load', 'To disable replay'], 'a']
      ]
    },
    8: {
      practice: ['Find a server-generated token or ID.', 'Create an extractor with a clear variable name.', 'Replace the hard-coded value and prove the next request uses it.'],
      questions: [
        ['What is correlation used for?', ['Capturing dynamic server values', 'Renaming pages', 'Increasing browser zoom'], 'a'],
        ['Which value commonly requires extraction?', ['A session token', 'A static heading', 'A CSS color'], 'a'],
        ['What should replace a hard-coded dynamic value?', ['The extracted variable', 'A random constant', 'An empty string'], 'a'],
        ['How do you validate correlation?', ['Replay and inspect the dependent request', 'Only read the script name', 'Skip the next request'], 'a'],
        ['What is a useful extractor name?', ['A name describing the captured value', 'temp1 for every value', 'A password'], 'a']
      ]
    },
    9: {
      practice: ['Add one business success assertion.', 'Add one technical assertion.', 'Run a valid and invalid case and compare the results.'],
      questions: [
        ['What does an assertion verify?', ['That a response meets an expected condition', 'That a file is renamed', 'That users are deleted'], 'a'],
        ['Why include a negative case?', ['To prove expected failures are recognized', 'To avoid validation', 'To increase static data'], 'a'],
        ['Which is a business assertion?', ['A confirmation that an employee was saved', 'A browser color', 'A project filename'], 'a'],
        ['What is a false success?', ['A request passes technically but the business action failed', 'A correct assertion', 'A valid test account'], 'a'],
        ['When should assertions be reviewed?', ['After replay and result analysis', 'Never', 'Only after deleting logs'], 'a']
      ]
    },
    10: {
      practice: ['Choose an approved API contract.', 'Create a GET and a write request with headers and body.', 'Validate status, content type, and a business field.'],
      questions: [
        ['Which method normally retrieves a resource?', ['GET', 'DELETE', 'PATCH-only'], 'a'],
        ['What does a 2xx response generally indicate?', ['Successful processing', 'A client syntax error', 'A server crash'], 'a'],
        ['Why define Content-Type?', ['It describes the request or response representation', 'It sets user count', 'It replaces authentication'], 'a'],
        ['What should an API test validate beyond status?', ['The expected business content', 'Only the URL color', 'The installer'], 'a'],
        ['What is a request body used for?', ['Sending data with methods that create or update', 'Changing the browser theme', 'Naming a population'], 'a']
      ]
    },
    11: {
      practice: ['Call the approved authentication endpoint.', 'Extract the returned token.', 'Pass it into a protected request and chain an entity ID into the next step.'],
      questions: [
        ['What usually comes before a protected API call?', ['Authentication', 'Reporting', 'Ramp-down'], 'a'],
        ['What should be done with a returned token?', ['Pass it through the approved auth header or mechanism', 'Print it publicly', 'Replace it with a title'], 'a'],
        ['Why chain an entity ID?', ['The next request depends on the created or retrieved entity', 'To remove correlation', 'To change the SLA'], 'a'],
        ['What should credentials be?', ['Approved and safe for testing', 'Production secrets in source', 'Shared publicly'], 'a'],
        ['What does request chaining model?', ['A dependent business workflow', 'An unrelated page layout', 'A static screenshot'], 'a']
      ]
    },
    12: {
      practice: ['Identify JSON paths for a token, ID, and business field.', 'Add positive checks for valid data.', 'Add negative checks and retain the response evidence.'],
      questions: [
        ['What does a JSON path identify?', ['A value inside a JSON response', 'A browser tab', 'A load generator name'], 'a'],
        ['What should positive checks confirm?', ['Valid responses contain expected data', 'Invalid data always passes', 'No response is received'], 'a'],
        ['Why test negative cases?', ['To validate the error contract', 'To avoid status checks', 'To hide failures'], 'a'],
        ['What evidence belongs in the result?', ['Status, response, assertion, and data checks', 'Only a screenshot of the menu', 'No timestamps'], 'a'],
        ['What is a stable JSON path?', ['A path that reliably identifies the intended field', 'A random array index', 'A password'], 'a']
      ]
    },
    13: {
      practice: ['Write the target business volume and time unit.', 'Calculate an initial concurrency or arrival-rate model.', 'Compare configured load with observed throughput.'],
      questions: [
        ['What does concurrency describe?', ['Active overlapping users or requests', 'Completed work only', 'A file format'], 'a'],
        ['What does arrival rate describe?', ['How quickly new users or requests begin', 'How many pages exist', 'A response assertion'], 'a'],
        ['What does pacing control?', ['Delay between iterations', 'The HTTP status code', 'The project license'], 'a'],
        ['What does throughput measure?', ['Completed work per time unit', 'Only active users', 'The test title'], 'a'],
        ['Why document workload assumptions?', ['To make the model repeatable and defensible', 'To hide the load', 'To remove metrics'], 'a']
      ]
    },
    14: {
      practice: ['Define at least two user populations.', 'Assign journeys and traffic weights.', 'Run a small mixed workload and compare observed and configured mix.'],
      questions: [
        ['What does a population represent?', ['Users sharing a meaningful behavior pattern', 'A single response header', 'A browser button'], 'a'],
        ['Why use path weights?', ['To model the real action mix', 'To make every path identical', 'To remove user roles'], 'a'],
        ['What should weights be based on?', ['Observed traffic or documented assumptions', 'Convenience only', 'Random numbers'], 'a'],
        ['What can differ between populations?', ['Role, data, pacing, and user path', 'Only the page title', 'Nothing'], 'a'],
        ['What should a mixed run verify?', ['Observed behavior is close to the configured mix', 'Every user performs one path', 'All requests fail'], 'a']
      ]
    },
    15: {
      practice: ['Choose small, medium, and target zones.', 'Define ramp-up, hold, ramp-down, and abort thresholds.', 'Record entry and exit decisions for each zone.'],
      questions: [
        ['What does a ramp pattern define?', ['How load changes over time', 'How a token is extracted', 'How a report is named'], 'a'],
        ['Why hold at a load level?', ['To observe stability and behavior', 'To skip monitoring', 'To delete results'], 'a'],
        ['What is a stop condition?', ['A predefined reason to end a run safely', 'A random comment', 'A page link'], 'a'],
        ['Why ramp down cleanly?', ['To finish in a controlled way and preserve interpretation', 'To increase errors', 'To change the workload model'], 'a'],
        ['What does a zone help organize?', ['Load stage or execution segment', 'JSON syntax', 'Credential storage'], 'a']
      ]
    },
    16: {
      practice: ['Complete a go/no-go checklist.', 'Run a low-volume smoke test.', 'Record environment, data, script, monitor, and approval status.'],
      questions: [
        ['What is the purpose of a readiness check?', ['Confirm the test is valid before execution', 'Guarantee zero latency', 'Remove approvals'], 'a'],
        ['Why run a smoke test?', ['To catch setup and functional issues early', 'To replace the target run', 'To maximize stress'], 'a'],
        ['What should be confirmed before load?', ['Environment, data, script, monitors, and capacity', 'Only the browser theme', 'Nothing'], 'a'],
        ['What does go/no-go mean?', ['Proceed or stop based on readiness evidence', 'Change the API method', 'Delete the project'], 'a'],
        ['Why record the build and project version?', ['To make results comparable and traceable', 'To hide changes', 'To disable logging'], 'a']
      ]
    },
    17: {
      practice: ['Capture runtime metrics at start, steady state, and peak.', 'Compare response time and error changes with CPU, memory, database, and network signals.', 'Write observations with timestamps.'],
      questions: [
        ['Why correlate metrics by time?', ['To connect system behavior to the workload phase', 'To avoid evidence', 'To rename users'], 'a'],
        ['Which is a server-health metric?', ['CPU utilization', 'Lesson title', 'File extension'], 'a'],
        ['What does a rising error rate indicate?', ['More requests or business checks are failing', 'Guaranteed success', 'A new population'], 'a'],
        ['Is one high metric enough to prove a bottleneck?', ['No, it is a clue requiring correlation', 'Yes, always', 'Only if unrecorded'], 'a'],
        ['Why capture multiple snapshots?', ['To compare behavior across run phases', 'To remove timestamps', 'To avoid monitoring'], 'a']
      ]
    },
    18: {
      practice: ['Write approved abort triggers.', 'Perform a controlled stop in a safe environment.', 'Retain logs, configuration, monitoring, timestamps, and the stop reason.'],
      questions: [
        ['When should a run be aborted?', ['When it becomes unsafe or invalid under an approved trigger', 'Only after data corruption', 'Never'], 'a'],
        ['What should be recorded at abort time?', ['Timestamp and reason', 'Only a guess', 'Nothing'], 'a'],
        ['Why retain an aborted run?', ['It may contain useful evidence about the failure threshold', 'It has no value', 'To hide errors'], 'a'],
        ['Who should authorize an abort?', ['The responsible person named in the runbook', 'Any unknown user', 'No one'], 'a'],
        ['How should an incomplete run be reported?', ['Clearly marked as partial or invalid with its reason', 'As a successful full run', 'Deleted without note'], 'a']
      ]
    },
    19: {
      practice: ['Record p50, p90, p95, p99, throughput, errors, and active users.', 'Compare low-load and peak-load windows.', 'Explain what changed as user count increased.'],
      questions: [
        ['What does p50 represent?', ['The median response time', 'The slowest request', 'The user count'], 'a'],
        ['Why is p95 useful?', ['It describes slower tail experience', 'It removes all errors', 'It measures licenses'], 'a'],
        ['What does throughput show?', ['Completed work per time unit', 'Only failed users', 'The page heading'], 'a'],
        ['What does active user count provide?', ['Context for the applied load', 'The JSON path', 'The SLA name'], 'a'],
        ['Why compare matching time windows?', ['To avoid misleading metric comparisons', 'To hide peaks', 'To remove users'], 'a']
      ]
    },
    20: {
      practice: ['Write three SLA rows with transaction, percentile, workload, and threshold.', 'Compare baseline and target results.', 'Mark each row pass, fail, or inconclusive with evidence.'],
      questions: [
        ['What must an SLA identify?', ['Transaction, percentile, window, workload, and threshold', 'Only a page title', 'Only a user name'], 'a'],
        ['When is a result a pass?', ['The target metric meets the approved threshold', 'Any request succeeds', 'No evidence exists'], 'a'],
        ['When is a result inconclusive?', ['Conditions or evidence are not comparable or complete', 'The target passes clearly', 'The script has a name'], 'a'],
        ['Why compare against a baseline?', ['To identify change under comparable conditions', 'To avoid measuring load', 'To delete history'], 'a'],
        ['What can invalidate a comparison?', ['Different environment, data, workload, or measurement method', 'A matching script', 'Recorded timestamps'], 'a']
      ]
    },
    21: {
      practice: ['Choose one slow transaction.', 'Write three bottleneck hypotheses.', 'List one confirming and one disconfirming signal for each.'],
      questions: [
        ['What is a bottleneck hypothesis?', ['A testable explanation for observed degradation', 'A proven fact without evidence', 'A page label'], 'a'],
        ['What should confirm a hypothesis?', ['Aligned metrics, logs, or targeted evidence', 'A random assumption', 'No measurement'], 'a'],
        ['Why include a disconfirming signal?', ['To test whether the explanation is wrong', 'To guarantee the answer', 'To remove alternatives'], 'a'],
        ['What should be aligned with a slowdown?', ['Load, errors, logs, and server metrics', 'Only the lesson title', 'Only a screenshot'], 'a'],
        ['Which is a possible bottleneck category?', ['Database saturation', 'HTML indentation', 'File naming'], 'a']
      ]
    },
    22: {
      practice: ['Choose one journey and the decision it supports.', 'Document scope, objectives, assumptions, risks, workload, SLAs, data, and stop conditions.', 'Ask a reviewer to approve the plan.'],
      questions: [
        ['What should a capstone objective support?', ['A specific engineering or business decision', 'A vague impression', 'A random user count'], 'a'],
        ['What does scope define?', ['What is included and excluded', 'Only the result color', 'Only the license'], 'a'],
        ['Why document assumptions?', ['To expose conditions behind the model', 'To hide uncertainty', 'To avoid review'], 'a'],
        ['What is a test risk?', ['A factor that may affect validity or execution', 'A successful assertion', 'A page heading'], 'a'],
        ['Why get plan approval?', ['To confirm the test is understood and authorized', 'To skip readiness', 'To remove evidence'], 'a']
      ]
    },
    23: {
      practice: ['Run the approved smoke test.', 'Execute and label the baseline.', 'Execute the target load and retain both result sets with the execution log.'],
      questions: [
        ['What is a baseline?', ['A comparable control run', 'The highest possible load', 'A deleted result'], 'a'],
        ['Why keep the same script between runs?', ['To make comparison meaningful', 'To hide regressions', 'To remove assertions'], 'a'],
        ['What should the execution log capture?', ['Workload, environment, versions, warnings, and decisions', 'Only a title', 'No timestamps'], 'a'],
        ['What should happen before target load?', ['A valid smoke and baseline check', 'An unapproved production run', 'No validation'], 'a'],
        ['Why retain monitoring evidence?', ['To explain system behavior during the result', 'To replace the workload', 'To hide errors'], 'a']
      ]
    },
    24: {
      practice: ['Build a report from the retained evidence.', 'Separate observed facts, interpretations, limitations, and recommendations.', 'Submit the project, result sets, monitoring evidence, and final report.'],
      questions: [
        ['What should a final report include?', ['Objective, workload, evidence, results, limitations, and recommendations', 'Only one average', 'Only screenshots'], 'a'],
        ['What is an observed fact?', ['A statement directly supported by measured evidence', 'An unsupported cause', 'A future guess'], 'a'],
        ['Why state limitations?', ['To show how much confidence the evidence deserves', 'To weaken every result', 'To hide missing data'], 'a'],
        ['What makes a recommendation useful?', ['It is specific, actionable, and evidence-based', 'It is generic and unrelated', 'It has no owner'], 'a'],
        ['What should be submitted for assessment?', ['Project, logs, results, monitoring evidence, and report', 'Only a blank page', 'Only credentials'], 'a']
      ]
    }
  };

  const dayContent = content[day];
  if (!dayContent) {
    return;
  }

  const section = document.createElement('section');
  section.className = 'exercise';
  section.setAttribute('data-neoload-self-check', 'true');
  section.innerHTML = `<h2>Practice exercise</h2>
    <p>Complete these steps using the approved training environment and record the evidence requested in the lesson.</p>
    <ol>${dayContent.practice.map((step) => `<li>${step}</li>`).join('')}</ol>
    <div class="quiz" data-quiz>
      <h2>Self-check: 5 MCQs</h2>
      ${dayContent.questions.map((question, questionIndex) => `<div class="question" data-answer="${question[2]}">
        <p>${questionIndex + 1}. ${question[0]}</p>
        ${question[1].map((option, optionIndex) => `<label><input type="radio" name="neoload-day-${day}-q-${questionIndex}" value="${String.fromCharCode(97 + optionIndex)}" /> ${option}</label>`).join('')}
      </div>`).join('')}
      <button type="button" data-grade>Check answers</button>
      <p data-result aria-live="polite"></p>
    </div>`;

  const footer = lesson.querySelector('.footer-note');
  if (footer) {
    footer.parentElement.insertBefore(section, footer);
  } else {
    lesson.appendChild(section);
  }
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
  setupNeoLoadPracticeAndSelfCheck();
  setupQuizAutoGrader();
});
