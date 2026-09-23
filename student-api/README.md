# Student Records API Practice Project

A standalone local Node.js API for learning API testing with Postman, Swagger, Playwright, or any HTTP client. It provides authenticated CRUD operations for student records and stores data in a local CSV file.

This project runs only on your computer. It is deliberately not deployed to GitHub Pages.

## What You Need

- [Node.js 22 or later](https://nodejs.org/). Confirm with `node --version`.
- A terminal: PowerShell on Windows, or a terminal that can run Node.js on macOS/Linux.
- An internet connection for the one-time `npm install` dependency download.

## Start the API

1. Download or clone this `student-api` folder to your computer.
2. Open a terminal inside the folder.
3. Install the required packages:

```powershell
npm install
```

4. Start the API and enter your own practice credentials when prompted:

```powershell
npm run start:private
```

Both prompts hide what you type. Choose any non-empty user ID and password you can remember for this practice session. They are not saved to a file or command history.

5. Open [http://127.0.0.1:3100/docs/](http://127.0.0.1:3100/docs/) in a browser.

The terminal must remain open while you use the API. Stop it with `Ctrl+C` when finished.

## Use Swagger

1. Open the Swagger URL after starting the service.
2. Select **Authorize**.
3. Enter the same user ID and password used at startup, then select **Authorize** and close the dialog.
4. Expand an endpoint, select **Try it out**, supply values where needed, then select **Execute**.

Start by creating a student with this request body:

```json
{
  "name": "Taylor Morgan",
  "email": "taylor@example.test",
  "age": 21,
  "course": "API Testing"
}
```

Copy the `id` from the `201` response. You need it to get, update, or delete that student.

## API Reference

All `/api` endpoints require HTTP Basic authentication.

| Method | Endpoint | Purpose | Successful response |
| --- | --- | --- | --- |
| POST | `/api/students` | Create a student | `201` with student object and `Location` header |
| GET | `/api/students?page=1&limit=25` | List students, newest creation first | `200` with `data`, `total`, `page`, and `limit` |
| GET | `/api/students/{id}` | Get one student by UUID | `200` with student object |
| PUT | `/api/students/{id}` | Replace all editable student fields | `200` with updated student object |
| DELETE | `/api/students/{id}` | Permanently delete a student | `204` with no response body |

For `POST` and `PUT`, send every editable field: `name`, `email`, `age`, and `course`.

## Validation and Expected Errors

- `400`: Invalid request data, invalid UUID, invalid pagination, or invalid JSON.
- `401`: Missing or incorrect credentials.
- `404`: The requested student does not exist.
- `413`: Request body is larger than 16 KB.
- `429`: Too many failed authentication attempts; wait 15 minutes before trying again.

`name` and `course` must contain 1 to 100 characters. `email` must be a valid email address with at most 254 characters. `age` must be a whole number from 3 to 120. The server generates `id`, `createdAt`, and `updatedAt`; do not include them in a request body.

## Practice Ideas

- Create several students, then list them with different `page` and `limit` query values.
- Send a request without authorization and assert the `401` response.
- Send a POST request with `age` as a string, then verify the `400` response.
- Update the `course` for a saved ID and verify `createdAt` does not change.
- Delete a student and verify that a following GET returns `404`.

## Data Storage

The first start creates `data/students.csv`. The data remains after restarting the API, so delete that file only when you want a fresh practice database. The newest 1,000 created records are kept; creating record 1,001 removes the oldest creation. Do not edit the CSV while the service runs.

Only one running service can use a CSV file. After a forced stop, a `.lock` file might remain. Confirm the API is no longer running before deleting the matching `.lock` file.

## Configuration

The default address is `http://127.0.0.1:3100`, which is accessible only from your own computer.

To use a different port in the current PowerShell window:

```powershell
$env:STUDENT_API_PORT = '3101'
npm run start:private
```

Then use `http://127.0.0.1:3101/docs/`.

For automated or managed environments, provide credentials through secure environment-variable handling, then run:

```powershell
npm start
```

Required variables: `STUDENT_API_USER` and `STUDENT_API_PASSWORD`. Optional variables: `STUDENT_API_PORT` and `STUDENT_API_DATA_FILE`.

## Troubleshooting

| Problem | What to do |
| --- | --- |
| `node` is not recognized | Install Node.js 22 or later, then open a new terminal. |
| `npm install` fails | Confirm internet access and retry from this folder. |
| Port is in use | Set `STUDENT_API_PORT` to an unused port as shown above. |
| CSV is locked | Stop the other API process. Only remove a `.lock` file after confirming no process is running. |
| Swagger says `401` | Select **Authorize** and enter exactly the credentials supplied at startup. |

## Run Automated Checks

```powershell
npm test
```

Tests use temporary CSV files and random credentials. They do not change the practice data in `data/students.csv`.

## Security Note

Use this API for local learning only. Basic authentication does not encrypt credentials. Do not expose the service to a network or use real personal data or passwords.