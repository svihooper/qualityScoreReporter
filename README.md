# Quality Score Listings Reporter
Used to generate a detailed report of quality score totals for listings.

## Example output
https://www.screencast.com/t/2VJk98h1rf0v

### Instructions:
1. Create new blank google spreadsheet (https://docs.google.com/spreadsheets)
2. Copy the unique ID from the URL once the sheet has been created, it looks something like this "15D3nPJZLTAHLQhXo4MSTw4WV3rYbwXlSfX8cTONWD6I" https://www.screencast.com/t/g6BJuIb1
3. Take the script: https://github.com/sv-jschwarz/qualityScoreReporter/blob/master/qualityScoreReporter.js and find the phrase "INSERT YOUR SHEET ID HERE", replace that text with your sheetid.
4. Click the green share button in the top right corner of the Google sheet window.
5. Click "Skip" when asked to name the sheet.
6. On the new popup, click "Advanced" in the bottom right corner.
7. Click "Change...", and select the "On - Anyone with the link", then "Save": https://www.screencast.com/t/jQ4pwT7jvX
8. Then invite this email: "743184255003-2tbvikqou0c38ruhrmddno3kc7hnsmfr@developer.gserviceaccount.com": https://www.screencast.com/t/uPBeGgZwG
9. When asked "Are you sure?" that you want to share with the email above, click "Yes".
10. Once you've opened the doc to anyone with a link and invited the email above, click "Done".
11. Run the qualityScoreReporter.js script in your repl (make sure you updated your sheet id).
12. Switch back to your Google sheet page and view your results.
13. Share that sheet url with whoever needs to view the results.

#### QualityScore Factors:
The script comes with default qualityScore factors for testing. If you wish to use the real factors from the client's clientConfig.json make sure to set `const useTestConfig = true;` to `const useTestConfig = false;`.
