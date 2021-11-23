function blockMedia(mediaType) {
	//https://thewebdev.info/2021/02/27/how-to-simulate-a-keypress-event-programmatically-with-javascript/
	switch (mediaType) {
		case "VIDEO":
			console.log("Video is 🚫");
			simulateKeyPress(ctrlE);
			break;
		case "AUDIO":
			console.log("Audio is 🚫");
			simulateKeyPress(ctrlD);
			break;
		default:
			break;
	}
}

const checkMutations = (mutations, visitedMeet, observer) => {
	mutations.forEach(function (mutation) {
		if (mutation.addedNodes) {
			[].slice.call(mutation.addedNodes).forEach(function (node) {
				if (node.nodeName === "VIDEO") {
					if (visitedMeet) {
						//  set the media permission
						!visitedMeet.allowVideo ? blockMedia("VIDEO") : "";
						!visitedMeet.allowAudio ? blockMedia("AUDIO") : "";
					} else {
						//block on default

						blockMedia("VIDEO");
						blockMedia("AUDIO");
					}
					observer.disconnect(); //disconnect after first load
				}
			});
		}
	});
};

let observer;
const observerConfig = {
	childList: true,
	subtree: true,
	attributes: false,
};

//main
document.addEventListener("DOMContentLoaded", async () => {
	try {
		const visitedMeets = await fetchVisitedSites();
		const meetId = fetchMeetId(window.location.href);
		const currentMeet = visitedMeets.find(({ id }) => id == meetId);
		observer = new MutationObserver((mutations) =>
			checkMutations(mutations, currentMeet, observer)
		);
		observer.observe(document.body, observerConfig);
		//respond to popup messages
		chrome.runtime.onMessage.addListener(function (
			request,
			sender,
			sendResponse
		) {
			if (request.type === TOGGLE_VIDEO_CONTROL) {
				blockMedia("VIDEO");
				sendResponse({ success: true });
			} else if (request.type === TOGGLE_AUDIO_CONTROL) {
				blockMedia("AUDIO");
				sendResponse({ success: true });
			}
		});
	} catch (error) {
		console.error(
			`Something went wrong, sorry... but here is a trace that could help to fix the problem`,
			error
		);
	}
});

window.onbeforeunload = function () {
	if (observer) observer.disconnect();
};
