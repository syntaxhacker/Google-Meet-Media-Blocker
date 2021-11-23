// https://groups.google.com/a/chromium.org/g/chromium-extensions/c/ca4zrEkDmy0/m/Gb5pDOraAgAJ

chrome.runtime.onInstalled.addListener(({ reason }) => {
	if (reason === "install")
		chrome.tabs.create({
			url: "onboarding/index.html",
		});
});
