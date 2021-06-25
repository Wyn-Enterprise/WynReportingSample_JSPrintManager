export const concatUrls = (...urls) => {
	const skipNullOrEmpty = (value) => !!value;
	const trimLeft = (value, char) => (value.substr(0, 1) === char ? value.substr(1) : value);
	const trimRight = (value, char) => (value.substr(value.length - 1) === char ? value.substr(0, value.length - 1) : value);
	return urls
		.map(x => x && x.trim())
		.filter(skipNullOrEmpty)
		.map((x, i) => (i > 0 ? trimLeft(x, '/') : x))
		.map((x, i, arr) => (i < arr.length - 1 ? trimRight(x, '/') : x))
		.join('/');
};

const noCacheHeaders = {
	'Cache-Control': 'no-cache, no-store, must-revalidate',
	'Expires': '0',
	'Pragma': 'no-cache',
};

const sendRequest = async (url, referenceToken, method, requestPayload) => {
	const init = {
		headers: {
			...noCacheHeaders,
			Accept: 'application/json',
			'content-type': 'application/json',
			'Reference-Token': referenceToken,
		},
		method,
	};

	if (requestPayload) init.body = JSON.stringify(requestPayload);

	const response = await fetch(url, init);
	if (!response.ok) throw new Error(`${url} status code ${response.status}`);
	return response;
}

export const postGraphQlRequest = async (portalUrl, referenceToken, requestPayload) => {
	const url = concatUrls(portalUrl, 'api/graphql');
	const response = await sendRequest(url, referenceToken, 'post', requestPayload);
	const result = await response.json();
	return result;
};

export const postJsonRequest = async (url, referenceToken, requestPayload) => {
	const response = await sendRequest(url, referenceToken, 'post', requestPayload);
	const result = await response.json();
	return result;
};

export const getRequest = async (url, referenceToken, requestPayload) => {
	return await sendRequest(url, referenceToken, 'get', requestPayload);
}

export const getReportList = async (portalUrl, referenceToken) => {
	const result = await postGraphQlRequest(portalUrl, referenceToken, {
		query: 'query { documenttypes(key:"rdl") { documents { id, title } } }',
	});
	const { documents } = result.data.documenttypes[0];
	const list = documents.map(x => ({ id: x.id, name: x.title }));
	list.sort((x, y) => x.name.localeCompare(y.name));
	return list;
};

export const getReportingInfo = async (portalUrl, referenceToken) => {
	const result = await postGraphQlRequest(portalUrl, referenceToken, {
		query: 'query { me { language, themeName }, reportingInfo { version } }',
	});
	const { data: { me: { language, themeName }, reportingInfo: { version } } } = result;
	return {
		pluginVersion: version,
		theme: themeName,
		locale: language,
	};
};

export const exportReport = async (portalUrl, referenceToken, reportId, format, parameters, settings) => {
	const requestPayload = { parameters, settings };
	const url = concatUrls(portalUrl, `api/reporting/export/${reportId}/${format}`);
	const startExportResponse = await postJsonRequest(url, referenceToken, requestPayload);
	const exportResultUrl = concatUrls(portalUrl, startExportResponse.resultUrl);
	const exportResponse = await getRequest(exportResultUrl, referenceToken);
	const blob = await exportResponse.blob();
	return blob;
}

export const getReferenceToken = async (portalUrl, username, password) => {
	const url = concatUrls(portalUrl, 'connect/token');

	const requestInit = {
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Accept: '*/*',
		},
		method: 'post',
		body: `grant_type=password&username=${username}&password=${password}&client_id=integration&client_secret=eunGKas3Pqd6FMwx9eUpdS7xmz`,
	};

	const response = await fetch(url, requestInit);
	if (!response.ok) throw new Error(`${url} status code ${response.status}`);
	const jsonResponse = await response.json();
	if (jsonResponse.error) throw new Error(jsonResponse.error);
	return jsonResponse.access_token;
}
