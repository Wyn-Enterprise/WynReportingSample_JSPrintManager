JSPM = require('jsprintmanager');
zip = require('@zip.js/zip.js')
const { getReferenceToken, getReportList, exportReport } = require('./api');

const createPrintManager = () => {
    JSPM.JSPrintManager.license_url = "wss://localhost:23443/";
    JSPM.JSPrintManager.auto_reconnect = true;
  

    const printFile = async (blob) => {
        var fileUrl = URL.createObjectURL(blob);
        const url = new URL(fileUrl);
        const fileName = url.pathname.replace(url.origin + '/', '') + '.pdf';
        const cpj = new JSPM.ClientPrintJob();
        
        /* User Selected Printer option */
        //cpj.clientPrinter = new JSPM.UserSelectedPrinter();
        
        /* Default Printer option */
        cpj.clientPrinter =  new JSPM.DefaultPrinter();
        
        /* Installed Printer option */
        //cpj.clientPrinter =  new JSPM.InstalledPrinter('Microsoft Print to PDF');
        
        const printFile = new JSPM.PrintFile(fileUrl, JSPM.FileSourceType.URL, fileName, 1);
        cpj.files.push(printFile);
        await cpj.sendToClient();
    };
    const canPrint = async () => {
        if (JSPM.JSPrintManager.websocket_status != JSPM.WSStatus.Open) {
            await JSPM.JSPrintManager.start();
        }
        return JSPM.JSPrintManager.websocket_status == JSPM.WSStatus.Open;
    };

    return {
        canPrint,
        printFile,
    };
};

const createButton = (text, onClick) => {
    let disabled = false;
    let loading = false;

    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add('app-btn');

    const loader = document.createElement('div');
    loader.classList.add('loader');

    const refreshButton = () => {
        button.disabled = disabled || loading;
        if (loading) loader.style.display = '';
        else loader.style.display = 'none';
    }
    const setDisabled = (value) => {
        disabled = value;
        refreshButton();
    }
    const setLoading = (value) => {
        loading = value;
        refreshButton();
    }
    button.onclick = async () => {
        try {
            setLoading(true);
            await onClick();
        } finally {
            setLoading(false);
        }
    }

    const element = document.createElement('div');
    element.style.display = 'inline-block';
    element.appendChild(loader);
    element.appendChild(button);
    

    return [element, setDisabled];
};

const createPrint = (portalUrl, referenceToken) => {
    let report = undefined;
    const { canPrint, printFile } = createPrintManager();
    const print = async () => {
        const can = await canPrint();
        if (!can) throw Error('No permission to print');
        const file = await exportReport(portalUrl, referenceToken, report.id, 'pdf', undefined, undefined);
        printFile(file)
    };

    const [printElement, setDisabled] = createButton('Print', print);
    setDisabled(true);
   
    const onSelectPrintReport = (value) => {
        report = value;
        setDisabled(!value);
    };

    return {
        printElement,
        onSelectPrintReport,
    }
};

const createPreview = (portalUrl, referenceToken) => {
    let report = undefined;
    const preview = async () => {
        const file = await exportReport(portalUrl, referenceToken, report.id, 'pdf', undefined, undefined);
        var fileURL = URL.createObjectURL(file);
        window.open(fileURL);
    };

    const [previewElement, setDisabled] = createButton('Preview', preview);
    setDisabled(true);
   
    const onSelectPreviewReport = (value) => {
        report = value;
        setDisabled(!value);
    };

    return {
        previewElement,
        onSelectPreviewReport,
    }
};

const createReportList = (reports, onSelectReport) => {
    const reportList = document.createElement('ul');
    reportList.setAttribute('multiple', 'multiple');
    reportList.classList.add('wyn-report-list');
    reportList.innerHTML = '';
    reports.forEach(report => {
        const item = document.createElement('li');
        item.value = report.id;
        const text = document.createElement('span');
        text.innerHTML = report.name;
        item.title = report.name;
        item.appendChild(text);
        item.className = 'wyn-report-list-item';
        reportList.appendChild(item);
        item.onclick = () => {
            const items = reportList.children;
            for (let i = 0; i < items.length; i++) {
                items[i].classList.remove('active');
            }
            item.classList.add('active');
            onSelectReport(report);
        };
    });
    return reportList;
};

const createHeader = (portalUrl, username) => {
    const headerElement = document.createElement('div');
    headerElement.classList.add('app-header');

    const urlGroup = document.createElement('div');
    urlGroup.classList.add('app-header-group');
    headerElement.appendChild(urlGroup);
    
    const urlElement = document.createElement('div');
    urlElement.classList.add('app-portal-url');
    urlElement.innerHTML = (
		`<a href="${portalUrl}" target="_blank" rel="noopener noreferrer">${portalUrl}</a>`
	);
    urlGroup.appendChild(urlElement);

    const userInfoGroup = document.createElement('div');
    userInfoGroup.classList.add('app-header-group');
    userInfoGroup.classList.add('app-user-info');
   
    headerElement.appendChild(userInfoGroup);

    const usernameElement = document.createElement('div');
    usernameElement.classList.add('app-username');
    usernameElement.textContent = username;
    userInfoGroup.appendChild(usernameElement);

    const buttonsGroup = document.createElement('div');
    userInfoGroup.appendChild(buttonsGroup);

    const addElement = (element) => {
        buttonsGroup.appendChild(element);
    };

    return {
        headerElement,
        addElement,
    }
};

const init = async () => {
    /* Change the portalUrl, username, password to fit your environment */
    const portalUrl = 'http://localhost:51980/';
    const username = 'admin';
    const password ='admin';
    const referenceToken = await getReferenceToken(portalUrl, username, password);

    const root = document.createElement('div');
    root.classList.add('root');
    document.body.appendChild(root);

    const app = document.createElement('div');
    app.classList.add('app');
    root.appendChild(app);

    const { headerElement, addElement } = createHeader(portalUrl, username);
    app.appendChild(headerElement);

    const { previewElement, onSelectPreviewReport } = createPreview(portalUrl, referenceToken)
    addElement(previewElement);

    
    const { printElement, onSelectPrintReport } = createPrint(portalUrl, referenceToken)
    addElement(printElement);

    const onSelectReport = (report) => {
        onSelectPreviewReport(report);
        onSelectPrintReport(report);
    }

    const reports = await getReportList(portalUrl, referenceToken);
    const reportList = createReportList(reports, onSelectReport);
    app.appendChild(reportList);
};

init();
