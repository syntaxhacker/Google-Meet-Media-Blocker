let videoToggle = document.getElementById("videoControlBtn");
let audioToggle = document.getElementById("audioControlBtn");
const displayText = document.getElementById("meetId");
const meetInfo = document.getElementById("meetInfo");
const mediaControlWrapper = document.getElementById("mediaControlWrapper");
const warning = document.getElementById("warn");

let view = document.querySelector(".container");
(async () => {
	//render popup content
	let visitedMeets = await fetchVisitedSites();
	const tab = await fetchActiveTab();

	const meetID = fetchMeetId(tab.url);
	if (!meetID) {
		meetInfo.style.display = "none";
		mediaControlWrapper.style.display = "none";
	} else {
		warning.style.display = "none";
		displayText.innerHTML = meetID;

		const visitedMeet = visitedMeets.find(({ id }) => id === meetID);
		if (visitedMeet) {
			//if meet permission is visited load them
			const { allowVideo, allowAudio } = visitedMeet;
			videoToggle.checked = allowVideo;
			audioToggle.checked = allowAudio;
		} else {
			videoToggle.checked = false;
			audioToggle.checked = false;
		}
	}
})();

//send message to content script to toggle the specific media
const toggleMedia = async (tabId, mediaType) => {
	chrome.tabs.sendMessage(tabId, { type: mediaType }, function (response) {
		console.log({
			response,
		});
	});
};

//save permissions to chrome storage
const savePermissions = async (mediaCheckbox, currentMeet, mediaType) => {
	const visitedMeets = await fetchVisitedSites();
	let mediaPermission = {};
	if (mediaType === AUDIO) {
		mediaPermission = {
			allowAudio: mediaCheckbox.checked,
		};
	} else {
		mediaPermission = {
			allowVideo: mediaCheckbox.checked,
		};
	}

	if (mediaCheckbox.checked) {
		//allow video
		chrome.storage.sync.set({
			visitedSites: saveMedia(currentMeet, visitedMeets, mediaPermission),
		});
	} else {
		chrome.storage.sync.set({
			visitedSites: visitedMeets?.length
				? saveMedia(currentMeet, visitedMeets, mediaPermission)
				: [currentMeet],
		});
	}
};

audioToggle.addEventListener("click", async () => {
	const tab = await fetchActiveTab();
	await toggleMedia(tab.id, TOGGLE_AUDIO_CONTROL);
	const meetID = fetchMeetId(tab.url);
	const currentMeet = {
		id: meetID,
		allowVideo: true,
		allowAudio: false,
	};
	await savePermissions(audioToggle, currentMeet, AUDIO);
});

videoToggle.addEventListener("click", async () => {
	const tab = await fetchActiveTab();
	await toggleMedia(tab.id, TOGGLE_VIDEO_CONTROL);
	const meetID = fetchMeetId(tab.url);
	const currentMeet = {
		id: meetID,
		allowVideo: false,
		allowAudio: true,
	};
	await savePermissions(videoToggle, currentMeet, VIDEO);
});
