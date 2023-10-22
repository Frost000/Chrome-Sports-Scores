document.addEventListener('DOMContentLoaded', function() {
    buttonAddEventListener();
});
function buttonAddEventListener() {
    document.getElementById("flipX").addEventListener("click", flipHorizontal);
    document.getElementById("flipY").addEventListener("click", flipVertical);
    document.getElementById("openInNew").addEventListener("click", openInNewTabs)

    console.log("Extension DOM Loaded");
}
function injectedOpenInNewTabs() {
    const images = document.getElementsByTagName("img");
    for (const image of images) {
        const newUrl = image.currentSrc;
        window.open(newUrl);
    }
}
function openInNewTabs() {
    const activeTab = getCurrentTab();
    activeTab.then(activeTab => {
        chrome.scripting.executeScript({
            target: {tabId: activeTab.id},
            func: injectedOpenInNewTabs,
        }).then(() => console.log("Opened in new tabs"))
    });
}
function injectedHorizontalFlip(){
    const images = document.getElementsByTagName("img");
    for (const image of images) {
        image.style.transform += "scaleX(-1)";
    }
}
function flipHorizontal() {
    const activeTab = getCurrentTab();
    activeTab.then(activeTab => {
        chrome.scripting.executeScript({
            target: {tabId: activeTab.id},
            func: injectedHorizontalFlip,
        }).then(() => console.log("Flipped Horizontal"))
    });
}
function injectedVerticalFlip(){
    const images = document.getElementsByTagName("img");
    for (const image of images) {
        image.style.transform += "scaleY(-1)";
    }
}
function flipVertical() {
    const activeTab = getCurrentTab();
    activeTab.then(activeTab => {
        chrome.scripting.executeScript({
            target: {tabId: activeTab.id},
            func: injectedVerticalFlip,
        }).then(() => console.log("Flipped Vertical"))
    });
}
async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}