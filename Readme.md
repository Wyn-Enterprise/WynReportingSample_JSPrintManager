# Wyn Reporting Printing Sample

This sample demonstrates the use of GrapeCity ActiveReports WynPrinting connected to the Wyn portal.

## System requirements - Server Side
 * [Node.js](https://nodejs.org/en/download/) 14.17.0 or newer
 * JSPrintManager Client App Version 3 (jspm-3.0.21.425-win64.exe)
   * This executable can be found within the zip
   * This sample is compatible and tested with this JSPM  
  
## System Requirements - Client Side
* JSPrintManager Client App Version 3 (jspm-3.0.21.425-win64.exe)
   * This executable can be found within the zip
   * This sample is compatible and tested with this JSPM  
### Installing JSPrintManager Client App

Open dialog of background JSPrintManager application in System Tray for Windows 10. Click 'Reconfigure SSL Certificates...'. Allow permissions and get dialog "certificate installed".

## About

The application is a website. All printing can be executed from code that integrates Wyn Portal with JSPrintManager Client App. JSPrintManager Client App works in the background mode and processes requests to wss://localhost:23443/ address.

The application  presents a minimal simple demo. You can select a report, preview it and call printing. Exceptions do not break the application, but its output can only be seen in browser console. Calling print opens dialogs from JSPrintManager Client App. It is possible to avoid dialogs by setting up printing from the code by JSPM.JSPrintManager.

JSPM.JSPrintManager documentation:
https://www.neodynamic.com/Products/Help/JSPrintManager2.0/apiref/modules/jspm.html

## Build and run the sample

### Before running the sample

* In the **index.js**, change the *portalUrl*, *username*, *password* to fit your environment
   ```js
    const portalUrl = 'http://localhost:51980/';
    const username = 'admin';
    const password ='admin';
    ```
* In the **webpack.config.js**, you can change the host, http://localhost:3000, to fit your environment

### Steps
1. Execute `run-yarn.cmd` ( or `run-npm.cmd` )
2. Open http://localhost:3000 by browser

or manually yarn

1. Open cmd.exe and go to the root of the directory WynReportingPrintingSample
2. Enter `yarn`
3. Enter `yarn dev`
4. Open http://localhost:3000 by browser

or manually npm

1. Open cmd.exe and go to the root of the directory WynReportingPrintingSample
2. Enter `npm install`
4. Enter `npm run dev`
5. Open http://localhost:3000 by browser

