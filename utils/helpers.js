const fetchVisitedSites = () => {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get(["visitedSites"], (result) => {
			if (result && result.visitedSites) resolve(result.visitedSites);
			else resolve([]);
		});
	});
};

const fetchMeetId = (url) => {
	const urlInfo = new URL(url);
	const regex = new RegExp(
		"https://meet.google.com/([a-zA-Z]){3,}-([a-zA-Z]){3,}-([a-zA-Z]){3,}=*"
	);
	if (regex.test(url)) {
		return urlInfo.pathname.substring(1);
	} else {
		return false;
	}
};

const ctrlPlusD = {
	key: "d",
	which: 68,
	keyCode: 68,
	shiftKey: false,
	ctrlKey: true,
	metaKey: false,
};

const ctrlPlusE = {
	key: "e",
	keyCode: 69,
	code: "KeyE",
	which: 69,
	shiftKey: false,
	ctrlKey: true,
	metaKey: false,
};

const simulateKeyPress = (key) => {
	let keyObj;
	switch (key) {
		case ctrlD:
			keyObj = ctrlPlusD;
			break;
		case ctrlE:
			keyObj = ctrlPlusE;
			break;
		default:
			break;
	}
	// check platform and simulate keypress for macOS
	if (navigator.userAgentData.platform.includes('macOS')	) {
		keyObj.metaKey = true;
		keyObj.ctrlKey = false;
	}
	const keyEvent = new KeyboardEvent("keydown", keyObj);
	document.dispatchEvent(keyEvent);
};

const fetchActiveTab = async () => {
	let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	return tab;
};

const saveMedia = (currentMeet, visitedMeets, mediaPermission) => {
	const { id: meetId } = currentMeet;
	const visitedMeet = visitedMeets.find(({ id }) => id == meetId);
	if (visitedMeet) {
		return visitedMeets.map((meet) => {
			if (meet.id == meetId) {
				return {
					...meet,
					...mediaPermission,
				};
			} else return meet;
		});
	} else {
		//if new meet id/site
		return [...visitedMeets, currentMeet];
	}
};
