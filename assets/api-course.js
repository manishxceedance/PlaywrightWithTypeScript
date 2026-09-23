(function () {
  const weeks = [
    {
      title: 'Week 1: API and Playwright Foundations',
      days: [
        {
          title: 'API and HTTP Fundamentals',
          level: 'Beginner',
          outcome: 'Read an HTTP exchange and turn an API contract into testable conditions.',
          concepts: [
            ['API', 'An Application Programming Interface is a contract through which software systems exchange data or trigger behavior. A web API usually exposes resources through HTTP endpoints.'],
            ['HTTP request', 'A request contains a method, URL, headers, and optionally a body. The method expresses intent: GET reads, POST creates or triggers, PUT replaces, PATCH partially updates, and DELETE removes.'],
            ['HTTP response', 'A response contains a status code, headers, and usually a body. Status families communicate outcome: 2xx success, 3xx redirection, 4xx client error, and 5xx server error.'],
            ['Contract and idempotency', 'The contract defines accepted input and promised output. An idempotent operation has the same intended server state after repeated identical calls; GET, PUT, and DELETE should normally be idempotent, while POST often is not.']
          ],
          example: `GET /customers/42 HTTP/1.1\nAccept: application/json\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{"id":42,"status":"active"}`,
          exercise: ['Choose one API endpoint from an approved specification.', 'Label its method, path, query parameters, headers, body, status, and response fields.', 'Write one positive and two negative test conditions.', 'Explain whether the operation should be idempotent.'],
          deliverable: 'A one-page request/response map with three test conditions.',
          questions: [
            ['Which request part expresses the intended action?', ['HTTP method', 'Response body', 'Status family'], 'a'],
            ['What does a 4xx status normally indicate?', ['A successful write', 'A client-side request problem', 'A server outage only'], 'b'],
            ['Which method normally retrieves a resource?', ['GET', 'POST', 'PATCH'], 'a'],
            ['What is an API contract?', ['Only a server hostname', 'Agreed input and output behavior', 'A test execution report'], 'b'],
            ['What does idempotent mean?', ['Repeated identical calls have the same intended state effect', 'Every response is cached', 'The request has no headers'], 'a']
          ]
        },
        {
          title: 'Project Setup and First Playwright API Test',
          level: 'Beginner',
          outcome: 'Create and execute a typed Playwright API test with an isolated request context.',
          concepts: [
            ['APIRequestContext', 'Playwright uses APIRequestContext to send HTTP requests without opening a browser. A context can hold a base URL, default headers, authentication, and cookies.'],
            ['Test fixture', 'The built-in request fixture gives each Playwright test a managed API client. Use playwright.request.newContext when setup must be shared outside the normal test fixture lifecycle.'],
            ['Configuration', 'playwright.config.ts centralizes baseURL, retries, timeouts, reporters, and projects. Environment-specific values should come from configuration or environment variables, never hard-coded secrets.'],
            ['First assertion', 'A useful first test checks transport success and contract content. A status-only check can miss a 200 response containing the wrong business result.']
          ],
          example: `import { test, expect } from '@playwright/test';\n\ntest('returns a known customer', async ({ request }) => {\n  const response = await request.get('/customers/42');\n  expect(response.status()).toBe(200);\n  expect(response.headers()['content-type']).toContain('application/json');\n  await expect(response).toBeOK();\n  expect(await response.json()).toMatchObject({ id: 42 });\n});`,
          exercise: ['Install dependencies in a training project.', 'Configure baseURL for an approved API.', 'Create one GET test using the request fixture.', 'Assert status, content type, and one business field.', 'Run only that test and retain the result.'],
          deliverable: 'One passing Playwright API test and its command output.',
          questions: [
            ['Which Playwright type sends API calls?', ['Locator', 'APIRequestContext', 'BrowserType'], 'b'],
            ['Where should baseURL normally be centralized?', ['playwright.config.ts', 'Every assertion', 'The response body'], 'a'],
            ['What does the request fixture provide?', ['A managed API client', 'A visible browser only', 'A Gherkin parser'], 'a'],
            ['Why assert response content as well as status?', ['Status alone does not prove business correctness', 'It changes the endpoint', 'It disables retries'], 'a'],
            ['Where should secrets be stored?', ['Committed feature files', 'Environment or approved secret storage', 'Test titles'], 'b']
          ]
        },
        {
          title: 'CRUD Operations',
          level: 'Beginner',
          outcome: 'Automate a complete create, read, update, and delete resource lifecycle.',
          concepts: [
            ['Create', 'POST commonly creates a resource. Validate the creation status, response schema, generated identifier, and observable persisted state.'],
            ['Read', 'GET retrieves a resource or collection. Validate filtering, pagination, field values, and behavior for missing identifiers.'],
            ['Update', 'PUT normally replaces a representation while PATCH changes selected fields. Verify both the immediate response and a later GET so persistence is proven.'],
            ['Delete and cleanup', 'DELETE removes or deactivates a resource. Cleanup belongs in a finally block or fixture so failed assertions do not leave test data behind.']
          ],
          example: `const created = await request.post('/customers', { data: { name: 'API Trainee' } });\nexpect(created.status()).toBe(201);\nconst { id } = await created.json();\n\nawait expect(request.get(\`/customers/\${id}\`)).resolves.toBeTruthy();\nexpect((await request.patch(\`/customers/\${id}\`, { data: { status: 'active' } })).ok()).toBeTruthy();\nexpect((await request.delete(\`/customers/\${id}\`)).status()).toBe(204);`,
          exercise: ['Create a uniquely named training resource.', 'Capture its generated ID and retrieve it.', 'Update one field and prove persistence with GET.', 'Delete the resource and verify the documented missing-resource behavior.'],
          deliverable: 'A deterministic CRUD test that cleans up its own data.',
          questions: [
            ['Which method commonly creates a resource?', ['POST', 'GET', 'HEAD'], 'a'],
            ['What is the usual distinction between PUT and PATCH?', ['PUT replaces; PATCH partially changes', 'PATCH only reads', 'There is never a distinction'], 'a'],
            ['Why perform GET after an update?', ['To prove persisted state', 'To compile TypeScript', 'To create a token'], 'a'],
            ['Where should cleanup be protected?', ['A finally block or fixture', 'Only in a test title', 'Inside the API response'], 'a'],
            ['What value usually chains CRUD calls?', ['Generated resource ID', 'Reporter name', 'Worker count'], 'a']
          ]
        },
        {
          title: 'Assertions and Negative Testing',
          level: 'Intermediate',
          outcome: 'Validate status, headers, body, timing, and stable error contracts.',
          concepts: [
            ['Layered assertions', 'Transport assertions check status and headers; schema assertions check shape and types; business assertions check rules and relationships. Strong tests use all applicable layers.'],
            ['Negative test', 'A negative test deliberately sends invalid, missing, unauthorized, or conflicting input and verifies that the API rejects it safely with the documented error contract.'],
            ['Soft versus hard assertions', 'A hard assertion stops the test immediately. Soft assertions collect several failures before ending, which can improve contract diagnostics but must still fail the test.'],
            ['Stable validation', 'Assert contractual fields rather than volatile timestamps, request IDs, or complete response snapshots. Exact full-body equality is appropriate only when every field is deterministic.']
          ],
          example: `const response = await request.post('/customers', { data: { email: 'not-an-email' } });\nexpect(response.status()).toBe(400);\nexpect(response.headers()['content-type']).toContain('application/json');\nexpect(await response.json()).toMatchObject({\n  code: 'VALIDATION_ERROR',\n  field: 'email'\n});`,
          exercise: ['Select one create or update endpoint.', 'Test missing required data, malformed data, and an unknown resource.', 'Assert the documented status and stable error code for each.', 'Confirm no invalid resource was persisted.'],
          deliverable: 'Three negative tests with evidence of no unintended state change.',
          questions: [
            ['What does a business assertion validate?', ['Domain behavior', 'Only TCP connectivity', 'The editor theme'], 'a'],
            ['What should a negative test prove?', ['Invalid input is rejected according to contract', 'Every request returns 200', 'Retries hide errors'], 'a'],
            ['Why avoid asserting volatile request IDs?', ['They change between runs', 'They are always secrets', 'They disable JSON'], 'a'],
            ['What happens after a hard assertion fails?', ['The current test stops', 'All suites pass', 'The endpoint is deleted'], 'a'],
            ['Which is the strongest validation?', ['Status only', 'Status plus schema and business rules', 'Response size only'], 'b']
          ]
        },
        {
          title: 'Authentication',
          level: 'Intermediate',
          outcome: 'Test authenticated APIs without exposing credentials or confusing authentication with authorization.',
          concepts: [
            ['Authentication', 'Authentication proves who or what the caller is. Common mechanisms include API keys, Basic authentication, OAuth 2.0 access tokens, mutual TLS, and session cookies.'],
            ['Authorization', 'Authorization determines what an authenticated identity may do. Tests should distinguish unauthenticated (often 401) from authenticated but forbidden (often 403).'],
            ['Token lifecycle', 'Tokens have issuer, audience, scopes, and expiry. Acquire them through an approved flow, keep them in scenario or worker state, and never print them in reports.'],
            ['Least privilege', 'Use non-production test identities with only the permissions required by the scenario. Include expired, missing, malformed, and insufficient-scope cases when supported.']
          ],
          example: `const tokenResponse = await request.post('/oauth/token', {\n  form: { grant_type: 'client_credentials' },\n  headers: { Authorization: \`Basic \${process.env.API_BASIC_AUTH}\` }\n});\nconst { access_token: accessToken } = await tokenResponse.json();\nconst response = await request.get('/protected/rates', {\n  headers: { Authorization: \`Bearer \${accessToken}\` }\n});\nexpect(response.status()).toBe(200);`,
          exercise: ['Call one protected endpoint without a credential.', 'Call it with an approved valid credential.', 'If available, call it with insufficient scope.', 'Compare 401 and 403 behavior and check reports for secret leakage.'],
          deliverable: 'An authentication matrix covering valid, missing, and unauthorized access.',
          questions: [
            ['What does authentication establish?', ['Caller identity', 'Response schema only', 'Worker count'], 'a'],
            ['What does authorization establish?', ['Permitted actions', 'JSON formatting', 'DNS lookup'], 'a'],
            ['Which status often means authenticated but forbidden?', ['201', '403', '500'], 'b'],
            ['Where should a token be printed?', ['Nowhere in normal logs or reports', 'Every scenario title', 'Committed config'], 'a'],
            ['What is least privilege?', ['Only required permissions are granted', 'Every test is administrator', 'No negative tests'], 'a']
          ]
        }
      ]
    },
    {
      title: 'Week 2: BDD with Cucumber',
      days: [
        {
          title: 'BDD and Gherkin Fundamentals',
          level: 'Beginner',
          outcome: 'Describe API behavior as business-readable examples before implementing automation.',
          concepts: [
            ['BDD', 'Behaviour Driven Development is a collaborative practice for discovering and describing expected behavior through concrete examples. Automation supports BDD but does not replace the conversation.'],
            ['Gherkin', 'Gherkin is the structured language used by Cucumber. Feature states a capability, Scenario states one example, Given establishes context, When performs behavior, and Then observes outcome.'],
            ['Declarative scenario', 'A declarative scenario explains business intent instead of HTTP implementation detail. Keep methods, payload internals, and parser mechanics in reusable step definitions where practical.'],
            ['Example mapping', 'Teams discuss rules, examples, questions, and assumptions before coding. Each scenario should expose one meaningful rule or variation.']
          ],
          example: `Feature: Customer registration\n\n  Scenario: Reject a registration with an invalid email\n    Given a prospective customer has an invalid email address\n    When the customer submits the registration\n    Then the registration should be rejected\n    And the email validation reason should be returned`,
          reference: '../cucumber/00-introduction.html',
          exercise: ['Choose one API business rule.', 'Write one happy-path and one negative Gherkin scenario.', 'Remove low-level implementation details from the wording.', 'Review the examples with a teammate acting as product owner.'],
          deliverable: 'Two reviewed scenarios that each demonstrate one business rule.',
          questions: [
            ['What is BDD primarily?', ['A collaboration and specification practice', 'An HTTP client', 'A report format'], 'a'],
            ['What does Given describe?', ['Starting context', 'Observed outcome only', 'Test cleanup only'], 'a'],
            ['What does Then describe?', ['Observable outcome', 'Build installation', 'A random implementation'], 'a'],
            ['What makes a scenario declarative?', ['It emphasizes intent over mechanics', 'It lists every TypeScript line', 'It contains secrets'], 'a'],
            ['How many rules should a focused scenario usually demonstrate?', ['One meaningful rule or variation', 'Every system rule', 'None'], 'a']
          ]
        },
        {
          title: 'Cucumber Setup and Step Definitions',
          level: 'Beginner',
          outcome: 'Connect Gherkin steps to asynchronous TypeScript while reusing framework steps first.',
          concepts: [
            ['Step definition', 'A step definition is a TypeScript function matched to Gherkin text. It translates readable behavior into automation and must return or await asynchronous work.'],
            ['Cucumber expression', 'Expressions such as {string} and {int} capture typed parameters. Prefer a small stable vocabulary over many near-duplicate regex steps.'],
            ['World', 'World is scenario-scoped state. It safely carries request context, response, generated IDs, and business values between steps in the same scenario.'],
            ['Framework-first reuse', 'In project-kernal, package steps are loaded from @bhsi-architecture/kernal-automation. Use an exact package step before adding a project step, and never duplicate shared steps.']
          ],
          example: `import { Then } from '@cucumber/cucumber';\nimport { expect } from '@playwright/test';\nimport { ProjectWorld } from '../hooks/world';\n\nThen('the customer status is {string}', async function (this: ProjectWorld, status: string) {\n  const body = await this.response?.json();\n  expect(body.status).toBe(status);\n});`,
          reference: '../cucumber/03-step-definitions.html',
          exercise: ['Create a feature with Given, When, and Then.', 'Reuse one shared API step from the framework.', 'Implement only one missing business assertion step.', 'Run the feature and remove any duplicate or ambiguous step text.'],
          deliverable: 'A passing feature with shared setup/actions and one project-owned assertion.',
          questions: [
            ['What connects Gherkin text to TypeScript?', ['Step definition', 'Reporter', 'Profile JSON'], 'a'],
            ['Why await asynchronous work?', ['So Cucumber waits for completion and failures', 'To rename a feature', 'To create a browser UI'], 'a'],
            ['What scope does World have?', ['One scenario', 'All repositories forever', 'One HTTP header'], 'a'],
            ['What should be checked before creating a step?', ['Existing package and project steps', 'Only the test title', 'CSS selectors'], 'a'],
            ['What captures a quoted value in a Cucumber expression?', ['{string}', '{report}', '{worker}'], 'a']
          ]
        },
        {
          title: 'Hooks and Sharing Test Data Between Steps',
          level: 'Intermediate',
          outcome: 'Manage lifecycle and scenario state without leaking data across tests.',
          concepts: [
            ['Hook', 'Before and After hooks run setup and teardown around scenarios. Use hooks for cross-cutting lifecycle concerns, not hidden business actions required to understand a scenario.'],
            ['Scenario state', 'Store generated IDs, response objects, and runtime variables on World. A fresh World per scenario prevents accidental coupling and supports parallel execution.'],
            ['Hook ordering and tags', 'Tagged hooks apply only to matching scenarios. Ordering should be explicit when one setup depends on another, and teardown should tolerate partially completed setup.'],
            ['Evidence and cleanup', 'After hooks can attach sanitized evidence and remove created data. They must not mask the original failure or expose tokens and personal data.']
          ],
          example: `Before({ tags: '@api' }, async function (this: ProjectWorld) {\n  this.recordId = '';\n});\n\nAfter({ tags: '@createsCustomer' }, async function (this: ProjectWorld) {\n  if (this.recordId) {\n    await this.requestContext?.delete(\`/customers/\${this.recordId}\`);\n  }\n});`,
          reference: '../cucumber/04-hooks-and-tags.html',
          exercise: ['Capture a created ID on ProjectWorld.', 'Use it in a later validation step.', 'Add tagged cleanup that runs after the scenario.', 'Run two scenarios in either order and prove they do not share IDs.'],
          deliverable: 'Two order-independent scenarios with tagged cleanup.',
          questions: [
            ['What belongs in a hook?', ['Cross-cutting setup or teardown', 'Hidden core business behavior', 'Feature descriptions'], 'a'],
            ['Where should an ID shared by steps be stored?', ['Scenario World', 'A global variable', 'The reporter name'], 'a'],
            ['Why avoid global mutable test data?', ['It leaks across scenarios and workers', 'It improves isolation', 'It validates schemas'], 'a'],
            ['What does a tagged hook do?', ['Runs only for matching scenarios', 'Changes every endpoint', 'Skips TypeScript'], 'a'],
            ['What must teardown preserve?', ['The original test failure', 'A printed access token', 'Global state'], 'a']
          ]
        },
        {
          title: 'Data-Driven BDD Tests',
          level: 'Intermediate',
          outcome: 'Choose Scenario Outlines, DataTables, or runtime data according to the kind of variation.',
          concepts: [
            ['Scenario Outline', 'An outline runs the same behavior once for each Examples row. Use it for deterministic business variations with the same flow and assertions.'],
            ['DataTable', 'A DataTable passes structured input to one step. It is suitable for headers, query parameters, field-value sets, or expected details.'],
            ['Runtime data', 'Generate unique references and dates during execution when collisions or time sensitivity matter. Store values in scenario state and assert their relationship to the response.'],
            ['Data quality', 'Examples should remain readable, minimal, and representative. Avoid duplicating every combination when boundary analysis or pairwise coverage better addresses risk.']
          ],
          example: `Scenario Outline: Retrieve supported currency pairs\n  Given I set the following query parameters\n    | name   | value    |\n    | base   | <base>   |\n    | target | <target> |\n  When I send the request\n  Then the response status code should be <status>\n\n  Examples:\n    | base | target | status |\n    | USD  | EUR    | 200    |\n    | GBP  | JPY    | 200    |`,
          reference: '../cucumber/05-data-tables-and-outlines.html',
          exercise: ['Convert two duplicated scenarios into one Scenario Outline.', 'Use a DataTable for query parameters.', 'Add one boundary or invalid Examples row.', 'Explain which values should instead be generated at runtime.'],
          deliverable: 'A concise outline covering valid and invalid deterministic variations.',
          questions: [
            ['When should a Scenario Outline be used?', ['Same behavior with deterministic data variations', 'Every unrelated workflow', 'Only browser tests'], 'a'],
            ['What does a DataTable provide?', ['Structured step input', 'A new worker process', 'OAuth scope'], 'a'],
            ['Where should generated values live?', ['Scenario-scoped state', 'Committed Examples rows', 'Global static variables'], 'a'],
            ['What should Examples contain?', ['Business-relevant deterministic values', 'Access tokens', 'Random expressions'], 'a'],
            ['Why reduce duplicate scenarios?', ['To keep intent and maintenance clear', 'To remove coverage', 'To hide outcomes'], 'a']
          ]
        },
        {
          title: 'Partial Execution',
          level: 'Intermediate',
          outcome: 'Select purposeful test subsets by tag, feature, scenario, and profile.',
          concepts: [
            ['Tag expression', 'Tags classify scenarios by purpose or capability. Expressions combine them with and, or, and not, such as @api and @smoke and not @wip.'],
            ['Feature selection', 'A file path selects one feature while tags select semantic groups across files. Use stable business or execution tags rather than personal labels.'],
            ['Profile', 'A Cucumber profile groups runner options such as required modules, formats, and parallel workers. Environment configuration should remain separate from business selection.'],
            ['Traceability', 'Test-case tags can connect automation to requirements. A partial run must report exactly what was selected, skipped, and failed.']
          ],
          example: `# One feature\nnpm run test:feature -- feature/FxRates.feature\n\n# PowerShell: quote the tag expression\nnpm test -- --tags '@api and @smoke and not @wip'\n\n# Parallel framework runner\nnpm run test:parallel:6`,
          reference: '../cucumber/04-hooks-and-tags.html',
          exercise: ['Tag scenarios as @api, @smoke, @negative, and @wip where appropriate.', 'Run one feature by path.', 'Run smoke API tests excluding work in progress.', 'Record the selected scenario count for each command.'],
          deliverable: 'A tag strategy and evidence from two correctly scoped runs.',
          questions: [
            ['What selects a semantic group across feature files?', ['Tag expression', 'Response header', 'JSON path'], 'a'],
            ['How should tags be passed in PowerShell?', ['Quoted', 'As an unquoted @ token', 'Inside a response body'], 'a'],
            ['What does not @wip do?', ['Excludes work-in-progress scenarios', 'Retries them', 'Changes their endpoint'], 'a'],
            ['What does a profile group?', ['Runner options', 'API resources', 'Status codes'], 'a'],
            ['What should a partial-run report make clear?', ['What was selected, skipped, and failed', 'Only the fastest test', 'Secrets used'], 'a']
          ]
        }
      ]
    },
    {
      title: 'Week 3: Framework and API Implementation',
      days: [
        {
          title: 'Framework Architecture',
          level: 'Intermediate',
          outcome: 'Explain ownership boundaries and trace a scenario from feature to package runner and report.',
          concepts: [
            ['Parent package', '@bhsi-architecture/kernal-automation owns shared hooks, shared steps, configuration helpers, execution utilities, and reporting behavior. Consumers use its public contract and do not modify package internals.'],
            ['Child project', 'project-kernal owns business features, profiles, project World extensions, project-specific steps, test data, and pipeline configuration.'],
            ['Execution path', 'cucumber.cjs loads package hooks and steps before project hooks and steps. The package run-tests utility applies selection, parallel settings, and report generation.'],
            ['Extension decision', 'Use an exact package step first, then a compatible package step, then an existing consumer step. Add a thin consumer adapter only after proving a framework gap.']
          ],
          example: `Feature (.feature)\n  -> shared or project step definition\n  -> ProjectWorld / CustomWorld\n  -> Playwright APIRequestContext\n  -> API under test\n  -> Cucumber JSON\n  -> kernal-automation HTML report`,
          exercise: ['Open package.json, cucumber.cjs, cucumber.config.ts, and src/hooks/world.ts.', 'Draw the execution path from one Gherkin step to the report.', 'Classify five example changes as parent-package or child-project ownership.', 'Identify one extension that would be duplication.'],
          deliverable: 'An annotated architecture diagram and ownership decision table.',
          questions: [
            ['Who owns shared API steps?', ['The kernal-automation package', 'Each feature file', 'The API server'], 'a'],
            ['Who owns business feature files?', ['The child project', 'Node.js itself', 'The browser'], 'a'],
            ['What loads package and project steps?', ['Cucumber configuration', 'HTTP status', 'JSON schema'], 'a'],
            ['When should a consumer step be added?', ['After a real framework gap is proven', 'Before searching shared steps', 'For every scenario'], 'a'],
            ['Should child projects modify node_modules package internals?', ['No', 'Yes, for every test', 'Only during reporting'], 'a']
          ]
        },
        {
          title: 'Environment and Test-Data Management',
          level: 'Intermediate',
          outcome: 'Separate configuration, secrets, payloads, and runtime state for repeatable tests.',
          concepts: [
            ['Environment profile', 'config/profiles/{env}.json holds environment-specific non-secret settings such as baseUrl. app.config.json selects the profile and application type.'],
            ['Secret management', 'Credentials and tokens belong in environment variables or approved CI secret stores. Features, payloads, reports, and source control must contain placeholders or sanitized evidence.'],
            ['Test-data layers', 'Static payload templates belong under test-data; deterministic variations belong in Examples; generated IDs and dates belong in scenario World state.'],
            ['Isolation and cleanup', 'Each scenario must own its data. Use unique references, avoid dependencies on execution order, and remove created records or use disposable environments.']
          ],
          example: `// config/app.config.json\n{ "env": "qa", "appType": "api" }\n\n// config/profiles/qa.json\n{ "baseUrl": "https://api.qa.example.test" }\n\n# Runtime only\n$env:API_CLIENT_SECRET = '<from-approved-secret-store>'`,
          exercise: ['Create a sample staging profile with a non-secret base URL.', 'Classify ten values as config, secret, payload, Examples data, or runtime state.', 'Create a sanitized JSON payload template.', 'Describe cleanup and collision prevention for parallel workers.'],
          deliverable: 'A data-classification table and sanitized environment profile.',
          questions: [
            ['Where should a non-secret environment base URL live?', ['Environment profile', 'Every Gherkin Then step', 'A token log'], 'a'],
            ['Where should client secrets live?', ['Approved secret storage or environment variables', 'Git history', 'Examples tables'], 'a'],
            ['Where should a reusable static JSON body live?', ['test-data', 'A scenario title', 'The report filename'], 'a'],
            ['What prevents parallel data collisions?', ['Unique scenario-owned data', 'Global mutable IDs', 'Execution order'], 'a'],
            ['Should reports contain bearer tokens?', ['No', 'Yes, always', 'Only on passing tests'], 'a']
          ]
        },
        {
          title: 'CRUD Operations Using the Framework',
          level: 'Intermediate',
          outcome: 'Implement GET, POST, PUT, PATCH, and DELETE workflows with the package-provided Gherkin steps.',
          concepts: [
            ['Built-in request setup', 'The package provides steps for client initialization, URL components, path and query parameters, headers, URL-encoded form data, inline bodies, file-backed bodies, runtime variables, sending, and response checks.'],
            ['Method dispatch', 'Use I send the {string} request for explicit methods such as GET, POST, PUT, PATCH, and DELETE. Use I send the {string} request with the file request body when a payload has been loaded from test-data.'],
            ['Request composition', 'Split an endpoint into base URI, base path, endpoint, and parameter tables. This keeps environment configuration and business variation visible without hard-coded complete URLs.'],
            ['CRUD orchestration', 'Store created response data as scenario variables, substitute it into later path parameters or payloads, and validate state after each operation. Keep HTTP mechanics out of business scenario names.']
          ],
          example: `Background:\n  Given the API client is initialized\n\nScenario: Create and retrieve a customer\n  Given I set the base URI, base path and endpoint with the following parameters\n    | baseUri | {{baseUrl}} |\n    | basePath | /api |\n    | endpoint | /customers |\n  And I set the request body from file "test-data/Customer/create.json"\n    | key  | value       |\n    | name | API Trainee |\n  When I send the "POST" request with the file request body\n  Then the response status code should be\n    | statusCode |\n    | 201        |\n  And I store response data from "$.id" as "customerId"`,
          exercise: ['Open the dedicated Package Step Reference and inventory the request steps.', 'Implement create and read operations entirely with shared steps.', 'Add update and delete using the explicit method step.', 'Chain the created ID through a scenario variable and verify the final state.'],
          deliverable: 'One passing package-step CRUD workflow with no duplicate consumer HTTP steps.',
          questions: [
            ['Which step sends an explicit HTTP method?', ['I send the {string} request', 'I send the request', 'The API client is closed'], 'a'],
            ['Which step loads a reusable payload template?', ['I set the request body from file {string}', 'The response should be a list', 'I set the browser title'], 'a'],
            ['What should happen before adding a consumer HTTP step?', ['Prove the package lacks the capability', 'Modify node_modules', 'Duplicate all package steps'], 'a'],
            ['Where should a created ID be retained?', ['Scenario World', 'A global process variable', 'The feature title'], 'a'],
            ['What should scenario names emphasize?', ['Business behavior', 'HTTP implementation mechanics', 'File-system paths'], 'a']
          ]
        },
        {
          title: 'Advanced API Scenarios',
          level: 'Advanced',
          outcome: 'Automate chained, paginated, asynchronous, and multi-format workflows safely.',
          concepts: [
            ['Request chaining', 'A later request consumes a value from an earlier response, such as a token, resource ID, or version. Extract it, type it, store it in World, and assert the relationship.'],
            ['Pagination', 'Collection tests validate page size, cursors or offsets, ordering, duplicate prevention, and termination. Do not assume the first page represents the complete dataset.'],
            ['Asynchronous workflow', 'A 202 response often means processing has started. Poll a documented status resource with a bounded timeout and interval; do not use arbitrary fixed sleeps.'],
            ['Content and transport variants', 'Advanced contracts may use multipart, XML, binary downloads, compression, or conditional headers. Validate media type, encoding, checksums, and protocol-specific semantics.']
          ],
          example: `const deadline = Date.now() + 30_000;\nlet state = 'PENDING';\nwhile (state === 'PENDING' && Date.now() < deadline) {\n  const statusResponse = await request.get(\`/jobs/\${jobId}\`);\n  state = (await statusResponse.json()).state;\n}\nexpect(state).toBe('COMPLETED');`,
          exercise: ['Create a resource and chain its ID into a dependent request.', 'Choose pagination or asynchronous processing as a second scenario.', 'Define a bounded completion condition and failure evidence.', 'List sensitive fields that must be sanitized in attachments.'],
          deliverable: 'One chained workflow and one advanced scenario design with timeout rules.',
          questions: [
            ['What is request chaining?', ['Using earlier response data in a later request', 'Running unrelated tests', 'Changing a report color'], 'a'],
            ['What should replace fixed sleeps for async APIs?', ['Bounded condition polling', 'Infinite loops', 'No timeout'], 'a'],
            ['What must pagination tests detect?', ['Missing or duplicate records across pages', 'Only HTTP method spelling', 'Browser viewport'], 'a'],
            ['What does 202 commonly indicate?', ['Accepted for processing', 'Permanent completion proof', 'Authentication success only'], 'a'],
            ['What should multipart tests validate?', ['Part names, content types, and resulting behavior', 'Only filename color', 'Worker count'], 'a']
          ]
        },
        {
          title: 'Test Report Validation and Assertions',
          level: 'Advanced',
          outcome: 'Make reports trustworthy by validating both test outcomes and attached evidence.',
          concepts: [
            ['Report integrity', 'A report must show scenario identity, steps, duration, status, errors, and attachments consistently. A green report is useful only when assertions genuinely executed.'],
            ['Evidence', 'Attach sanitized request metadata, response status, selected headers, and body excerpts. Evidence should diagnose the failure without leaking credentials or unnecessary personal data.'],
            ['Framework reporting', 'Use package reporting helpers such as reportInfo, reportPass, and reportFail for structured framework events. Keep Playwright expect assertions in Then steps.'],
            ['Report validation', 'Deliberately run one pass and one controlled failure. Confirm the report preserves the failure message, expected/actual context, tags, timing, and any safe attachment.']
          ],
          example: `Then('the returned rate is positive', async function (this: ProjectWorld) {\n  const body = await this.response?.json();\n  expect(body.rate, 'rate should be greater than zero').toBeGreaterThan(0);\n  reportPass('Validated a positive exchange rate');\n});\n\n# Open the latest framework report\nnpm run test:report`,
          exercise: ['Run one passing scenario.', 'Create and run one temporary controlled assertion failure.', 'Open the latest report and verify status, error, tags, duration, and sanitized evidence.', 'Restore the intended assertion and rerun green.'],
          deliverable: 'A report-validation checklist with pass and controlled-failure evidence.',
          questions: [
            ['Where should business assertions remain?', ['Then steps', 'Report styling only', 'The package lock'], 'a'],
            ['What should evidence exclude?', ['Secrets and unnecessary personal data', 'Status code', 'Scenario name'], 'a'],
            ['Why run a controlled failure?', ['To prove failure reporting works', 'To weaken assertions', 'To create production data'], 'a'],
            ['What command opens the latest framework report?', ['npm run test:report', 'npm uninstall', 'git reset --hard'], 'a'],
            ['What makes a green report trustworthy?', ['Relevant assertions actually executed', 'No assertions exist', 'Errors were hidden'], 'a']
          ]
        }
      ]
    },
    {
      title: 'Week 4: Advanced Validation and Reporting',
      days: [
        {
          title: 'Parallel Execution and Reliability',
          level: 'Advanced',
          outcome: 'Run API scenarios concurrently without shared-state failures and diagnose flakiness correctly.',
          concepts: [
            ['Parallel worker', 'Each worker executes scenarios independently. Test code must not depend on order, shared mutable globals, fixed record names, or one worker cleaning another worker\'s data.'],
            ['Reliability', 'A reliable test produces the same result under the same contract and environment. Control data, time, dependencies, cleanup, and bounded waits before considering retries.'],
            ['Retry', 'A retry can gather evidence for genuinely transient failures, but it must not conceal deterministic defects. Track first-attempt failures and use retries sparingly.'],
            ['Rate limiting', 'Parallel API tests can exceed service quotas. Recognize 429 and Retry-After, size worker counts responsibly, and coordinate test traffic with environment capacity.']
          ],
          example: `# Framework scripts already expose worker choices\nnpm run test:parallel:6\nnpm run test:parallel:8\n\n# Or configure the environment before the runner\n$env:CUCUMBER_PARALLEL_WORKERS = '4'\nnpm run test:parallel`,
          exercise: ['Run a stable tagged subset serially and record duration.', 'Run the same subset with a safe worker count.', 'Investigate collisions, 429 responses, and first-attempt failures.', 'Remove any order dependency or shared mutable test data.'],
          deliverable: 'A serial-versus-parallel result table and one reliability improvement.',
          questions: [
            ['What must parallel scenarios avoid?', ['Shared mutable global state', 'Unique data', 'Independent cleanup'], 'a'],
            ['What does 429 indicate?', ['Too many requests', 'Created resource', 'Schema success'], 'a'],
            ['What should happen before adding retries?', ['Find and control the failure cause', 'Hide every failure', 'Remove assertions'], 'a'],
            ['What should determine worker count?', ['Environment capacity and test isolation', 'The longest test title', 'A random value'], 'a'],
            ['What should be tracked when retries are enabled?', ['First-attempt failures', 'Only final passes', 'No timing'], 'a']
          ]
        },
        {
          title: 'Advanced Reporting',
          level: 'Advanced',
          outcome: 'Design reports for debugging, traceability, trend analysis, and CI decisions.',
          concepts: [
            ['Audience', 'Engineers need request and failure diagnostics; leads need coverage, trends, and risk; CI needs machine-readable status. One report can expose layers without overwhelming every reader.'],
            ['Formats', 'Cucumber JSON supports rich post-processing, JUnit XML integrates with CI test views, and HTML supports human investigation. Preserve raw results as pipeline artifacts.'],
            ['Traceability and trends', 'Stable test IDs and tags connect scenarios to requirements. Trend data distinguishes a new regression from recurring flakiness or environmental instability.'],
            ['Safe observability', 'Correlation IDs, endpoint names, durations, and sanitized excerpts aid diagnosis. Apply allowlists or redaction to headers and bodies before attachment.']
          ],
          example: `Useful report layers:\n1. Executive: pass rate, blocked tests, risk by capability\n2. Test: feature, scenario, tags, duration, attempts\n3. Diagnostic: sanitized request/response, assertion difference, correlation ID\n4. Pipeline: JSON/JUnit artifacts and exit code`,
          exercise: ['Inspect the generated JSON and HTML outputs.', 'Define information needed by an engineer, test lead, and CI pipeline.', 'Add or propose stable traceability tags.', 'Create a redaction checklist for headers and payload fields.'],
          deliverable: 'A reporting standard covering audience, artifacts, retention, and redaction.',
          questions: [
            ['Which format commonly integrates with CI test views?', ['JUnit XML', 'JPEG only', 'CSS'], 'a'],
            ['Why preserve raw result files?', ['For post-processing and audit evidence', 'To store secrets', 'To replace tests'], 'a'],
            ['What enables requirement traceability?', ['Stable IDs or tags', 'Random scenario names', 'Worker count'], 'a'],
            ['What helps diagnose one request across systems?', ['Correlation ID', 'Font choice', 'Feature filename only'], 'a'],
            ['What must happen before attaching headers?', ['Redact or allowlist sensitive values', 'Print every token', 'Remove status codes'], 'a']
          ]
        },
        {
          title: 'Advanced Response Validation',
          level: 'Advanced',
          outcome: 'Validate schemas, invariants, collections, precision, and cross-response consistency.',
          concepts: [
            ['Schema validation', 'A schema verifies required fields, types, formats, enums, and additional-property rules. It catches structural drift but does not prove business correctness.'],
            ['Business invariant', 'An invariant is a rule that must remain true, such as total equaling the sum of line items, dates being ordered, or returned currency matching the request.'],
            ['Collection validation', 'Validate uniqueness, ordering, filters, pagination metadata, and every relevant item. Avoid checking only the first element unless the contract makes it special.'],
            ['Precision and time', 'Money and rates require explicit decimal tolerance and rounding rules. Dates require format, timezone, and boundary expectations; string equality alone is often insufficient.']
          ],
          example: `const body = await response.json();\nexpect(body.currency).toBe(requestedCurrency);\nexpect(body.items).toEqual(expect.arrayContaining([\n  expect.objectContaining({ id: expect.any(String) })\n]));\nexpect(new Set(body.items.map((item: { id: string }) => item.id)).size).toBe(body.items.length);\nexpect(Math.abs(body.total - expectedTotal)).toBeLessThanOrEqual(0.01);`,
          exercise: ['Select a representative JSON response.', 'Define structural checks and three business invariants.', 'Add uniqueness or ordering validation for a collection.', 'Document tolerance and timezone rules for numeric or date fields.'],
          deliverable: 'A response-validation specification and automated assertions for its highest-risk rules.',
          questions: [
            ['What does schema validation primarily prove?', ['Response structure', 'All business rules', 'Server capacity'], 'a'],
            ['What is a business invariant?', ['A rule that must remain true', 'A random response field', 'A report theme'], 'a'],
            ['What should collection validation include?', ['Uniqueness, ordering, filtering, and item rules', 'Only the first item always', 'No metadata'], 'a'],
            ['Why define numeric tolerance?', ['Floating-point and rounding contracts need explicit bounds', 'To remove assertions', 'To create tokens'], 'a'],
            ['What must date validation specify?', ['Format and timezone semantics', 'Only string length', 'Worker count'], 'a']
          ]
        },
        {
          title: 'Final Assignment',
          level: 'Capstone',
          outcome: 'Design, implement, execute, and defend a production-quality API automation slice.',
          concepts: [
            ['Assignment scope', 'Choose one approved business capability with authentication and at least one resource lifecycle. Define contract risks, assumptions, exclusions, and success criteria before implementation.'],
            ['Required coverage', 'Include positive and negative scenarios, data variation, authentication or authorization, chained state, advanced response validation, cleanup, and safe parallel execution.'],
            ['Framework compliance', 'Use package steps first, keep child extensions thin, store configuration and data in their owned locations, and document any proven package gap.'],
            ['Definition of done', 'The suite passes from a clean setup, produces sanitized reports, runs by tag and in parallel, and includes a concise technical walkthrough explaining design decisions and residual risks.']
          ],
          example: `Capstone evidence pack:\n- Feature file(s) with traceability and risk-based scenarios\n- Minimal TypeScript extension code, if required\n- Environment profile and sanitized payloads\n- Serial and parallel execution evidence\n- HTML plus machine-readable report artifacts\n- README with setup, commands, architecture, and known risks`,
          exercise: ['Select and document the API capability and risks.', 'Implement the required scenarios using framework-first reuse.', 'Run a focused, negative, and safe parallel execution.', 'Review reports for assertion quality and secret leakage.', 'Present a ten-minute architecture and results walkthrough.'],
          deliverable: 'A review-ready API automation feature and evidence pack assessed against the rubric below.',
          rubric: [
            ['Contract and risk coverage', '25%'],
            ['Framework architecture and code quality', '20%'],
            ['Assertions, negative tests, and data isolation', '25%'],
            ['Reliability, parallel execution, and cleanup', '15%'],
            ['Reporting, security, and technical walkthrough', '15%']
          ],
          questions: [
            ['What should drive capstone scope?', ['Business contract risk', 'Maximum file count', 'UI styling'], 'a'],
            ['What is the first implementation preference?', ['Existing package steps', 'Duplicated consumer steps', 'Modified node_modules'], 'a'],
            ['What must parallel evidence demonstrate?', ['Isolation and reliable cleanup', 'Shared IDs', 'Execution-order dependency'], 'a'],
            ['What must reports be checked for?', ['Useful evidence and no secret leakage', 'Only bright colors', 'No assertions'], 'a'],
            ['What completes the assignment?', ['Working suite, evidence, and defensible design decisions', 'A feature title only', 'One unverified status check'], 'a']
          ]
        }
      ]
    }
  ];

  const lessons = weeks.flatMap((week, weekIndex) => week.days.map((day, dayIndex) => ({
    ...day,
    week: weekIndex + 1,
    dayInWeek: dayIndex + 1,
    weekTitle: week.title
  })));

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderSidebar(currentDay) {
    let globalDay = 0;
    const weekMenus = weeks.map((week) => {
      const links = week.days.map((day) => {
        globalDay += 1;
        const active = globalDay === currentDay ? ' class="active"' : '';
        return `<li><a${active} href="day-${String(globalDay).padStart(2, '0')}.html">${globalDay}. ${day.title}</a></li>`;
      }).join('');
      return `<div class="menu-group"><p class="menu-group-title">${week.title.split(':')[0]}</p><ul>${links}</ul></div>`;
    }).join('');

    return `<div class="menu-group"><p class="menu-group-title">Package guide</p><ul><li><a href="../../pages/kernal-api-step-reference.html">All 54 framework steps</a></li></ul></div>${weekMenus}`;
  }

  function renderQuestions(questions, dayNumber) {
    return questions.map((question, questionIndex) => {
      const options = question[1].map((option, optionIndex) => {
        const value = String.fromCharCode(97 + optionIndex);
        return `<label><input type="radio" name="api-${dayNumber}-q${questionIndex}" value="${value}" /> ${option}</label>`;
      }).join('');
      return `<div class="question" data-answer="${question[2]}"><p>${questionIndex + 1}. ${question[0]}</p>${options}</div>`;
    }).join('');
  }

  function renderLesson(dayNumber) {
    const lesson = lessons[dayNumber - 1];
    const root = document.querySelector('[data-api-lesson]');
    const sidebar = document.querySelector('[data-api-sidebar]');
    if (!lesson || !root || !sidebar) return;

    document.title = `Playwright API Day ${dayNumber} - ${lesson.title}`;
    sidebar.innerHTML = `<h2>Playwright API</h2>${renderSidebar(dayNumber)}`;

    const concepts = lesson.concepts.map((concept) => `<h3>${concept[0]}</h3><p>${concept[1]}</p>`).join('');
    const exercise = lesson.exercise.map((step) => `<li>${step}</li>`).join('');
    const reference = lesson.reference
      ? `<p><strong>Recommended deep dive:</strong> <a href="${lesson.reference}">Open the existing Cucumber lesson</a>.</p>`
      : '';
    const rubric = lesson.rubric
      ? `<h2>Assessment rubric</h2><table><thead><tr><th>Area</th><th>Weight</th></tr></thead><tbody>${lesson.rubric.map((row) => `<tr><td>${row[0]}</td><td>${row[1]}</td></tr>`).join('')}</tbody></table>`
      : '';
    const previous = dayNumber > 1 ? `<a href="day-${String(dayNumber - 1).padStart(2, '0')}.html">&larr; Previous</a>` : '<span></span>';
    const next = dayNumber < lessons.length ? `<a href="day-${String(dayNumber + 1).padStart(2, '0')}.html">Next &rarr;</a>` : '<a href="../../pages/playwright-api.html">Course overview</a>';

    root.innerHTML = `
      <p class="course-kicker">${lesson.weekTitle} / Session ${lesson.dayInWeek}</p>
      <h1>Day ${dayNumber}: ${lesson.title}</h1>
      <p class="lesson-meta"><span class="difficulty-badge">${lesson.level}</span>${lesson.outcome}</p>
      <section class="session-plan" aria-label="60-minute session plan">
        <h2>60-minute session plan</h2>
        <ol><li><strong>0-10 min:</strong> Review and learning objective</li><li><strong>10-30 min:</strong> Concepts and definitions</li><li><strong>30-42 min:</strong> Instructor walkthrough</li><li><strong>42-55 min:</strong> Hands-on exercise</li><li><strong>55-60 min:</strong> MCQ knowledge check</li></ol>
      </section>
      <h2>Concepts and definitions</h2>
      ${concepts}
      <h2>Worked example</h2>
      <pre><code>${escapeHtml(lesson.example)}</code></pre>
      ${reference}
      ${rubric}
      <section class="exercise"><h2>End-of-session exercise</h2><ol>${exercise}</ol><p><strong>Deliverable:</strong> ${lesson.deliverable}</p></section>
      <section class="quiz" data-quiz><h2>Knowledge check</h2>${renderQuestions(lesson.questions, dayNumber)}<button class="grade-btn" type="button" data-grade>Grade Me</button><p class="quiz-result" data-result aria-live="polite"></p></section>
      <nav class="lesson-pager" aria-label="Lesson navigation">${previous}${next}</nav>`;
  }

  const dayNumber = Number(document.body.dataset.apiDay);
  renderLesson(dayNumber);
})();