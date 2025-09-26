"use strict";

function /*void*/ suspendScreen(/*void*/) {
    let DOMobj_startCover = document.createElement("div");//locator
    DOMobj_startCover.setAttribute("class", "startCover");
    DOMobj_startCover.setAttribute("style", "animation: startCover-display 1s 0s linear infinite;");
    document.body.appendChild(DOMobj_startCover);

    DOMobj_startCover.onclick = function () {
        DOMobj_startCover.onclick = null;
        DOMobj_startCover.setAttribute("style", "animation: startCover-disappear 0.25s 0s cubic-bezier(0.01, 1.03, 0.53, 0.98) 1;");
        let Int_timeoutID = setTimeout(function () {
            DOMobj_startCover.remove();
            DOMobj_startCover = null;
            clearTimeout(Int_timeoutID);
            demoWindow();//debug
        }, 250);
        silenceAudioLoop();
    }
}

function /*void*/ silenceAudioLoop(/*void*/) {
    const DOMobj_aud = document.createElement("audio");
    document.body.appendChild(DOMobj_aud);
    DOMobj_aud.src = "./System/anti-suspend/silence.wav";
    DOMobj_aud.type = "audio/wav";
    DOMobj_aud.volume = 0.002;
    DOMobj_aud.loop = true;
    DOMobj_aud.play();
}