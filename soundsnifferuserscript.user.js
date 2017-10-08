// ==UserScript==
// @name           SoundSnifferUserscript
// @description    Find the track id of a track on soundcloud.
// @author         cortex42 (https://github.com/cortex42)
// @include        https://soundcloud.com/*
// @version        1.0
// @grant          GM_xmlhttpRequest
// @grant          GM_notification
// @require        https://code.jquery.com/jquery-3.2.1.js
// @require        https://gist.github.com/raw/2625891/waitForKeyElements.js
// @run-at         document-idle
// ==/UserScript==


waitForKeyElements("div.fullHero__title", addButton);

function addButton() {
    console.log("[SoundSnifferUserscript] Change detected!");
    if(document.getElementsByClassName("soundTitle__playButton soundTitle__playButtonHero").length > 0) {
        var getTrackIdButton = document.createElement("input");
        getTrackIdButton.type = "button";
        getTrackIdButton.value = "Get Track ID";
        getTrackIdButton.onclick = getTrackId;
        getTrackIdButton.classList.add("sc-button");
        getTrackIdButton.classList.add("sc-button-medium");
        getTrackIdButton.classList.add("sc-button-responsive");
        getTrackIdButton.setAttribute("role", "button");
        getTrackIdButton.setAttribute("role", "button");
        var buttonGroup = document.getElementsByClassName("sc-button-group sc-button-group-medium");
        if(buttonGroup.length > 0) {
            buttonGroup[0].appendChild(getTrackIdButton);
        }
    }
}



function getTrackId() {
    var url = window.location.href;
    console.log("[SoundSnifferUserscript] Url: " + url);
    var playbackTimeElements = document.getElementsByClassName("playbackTimeline__timePassed");

    if(playbackTimeElements.length == 1) {
        var playbackTimeDiv = playbackTimeElements[0];
        var playbackSpans = playbackTimeDiv.getElementsByTagName("span");

        if(playbackSpans.length == 2) {
            var playbackSpan = playbackSpans[1];
            var time = playbackSpan.innerHTML;
            console.log("[SoundSnifferUserscript] Time: " + time);
            GM_notification("Trying to find the track id of the current track at minute " + time);
            sendRequest(url, time);
        }
    }

}

function sendRequest(url, time) {
    console.log("[SoundSnifferUserscript] Sending request ...");
    GM_xmlhttpRequest({
        method: "GET",
        url: "http://35.193.197.105/api/recognise?url="+url+"&t="+time,
        onload: function(response) {
            if(response.status == 200) {
                responseText = response.responseText;
                console.log("[SoundSnifferUserscript] ResponseText: " + responseText);

                if(responseText.indexOf("Track could not be recognised.") !== -1) {
                    GM_notification("Track could not be recognised.");
                    return;
                }

                if(responseText.indexOf("Error") !== -1) {
                    GM_notification("An Error occured.");
                    return;
                }

                if(responseText.indexOf("redirected") === -1) {
                    var firstIndex = responseText.indexOf("<h1>");
                    var lastIndex = responseText.lastIndexOf("<h1>");
                    var trackId = responseText.substring(firstIndex+4, lastIndex);
                    console.log("[SoundSnifferUserscript] Track id: " + trackId);
                    GM_notification("Track ID found: " + trackId);
                }else{
                    console.log("[SoundSnifferUserscript] Waiting for five seconds ...");
                    sleep(5000).then(() => {
                        sendRequest(url, time);
                    });
                }
            }
        }
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
