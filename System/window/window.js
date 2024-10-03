"use strict";
//sturcts
function /*Struct_Window*/ Struct_Window() {
    this.Int_handle = undefined;
    this.DOMobj_frame = undefined;
    this.DOMobj_navigator = undefined;
    this.DOMobj_dragBox = undefined;
    this.DOMobj_maximizeButton = undefined;
    this.DOMobj_closeButton = undefined;
    this.DOMobj_cover = undefined;
    this.DOMobj_locator = undefined;
    this.Bool_isMaximized = undefined;

    this.Arr_Int_positionRestore/*[4]*/ = undefined; //old
    this.Struct_StdWindowRect_windowRect = new Struct_StdWindowRect();//new

    this.Int_indexOfPileIndex = undefined;
    this.Int_pileIndex = undefined;
}

function /*Struct_StdWindowRect*/ Struct_StdWindowRect() {//代替Arr_Int[4]型的窗口坐标，那玩意可读性有点低了，而且目前仅有V8有优化，还是侧重一下语义吧 24.8.24
    this.Int_top = undefined;
    this.Int_left = undefined;
    this.Int_width = undefined;
    this.Int_height = undefined;
}
//global variables
var Arr_Struct_Window_allWindows/*for system only*/ = new Array();
var Arr_Int_globalWindowOverlapTable/*for system only*/ = new Array();
var DOMobj_windowBase/*for system only*/ = undefined;//调用initDesktop后才赋值

//functions
function /*void*/ initDesktop(/*void*/) {
    DOMobj_windowBase = document.getElementsByClassName("windowBase")[0];//get windowbase
    DOMobj_windowBase.style.left = 0;
    DOMobj_windowBase.style.top = 0;
    let DOMobj_windowBaseDragHandle = document.getElementsByClassName("windowBaseDragHandle")[0];
    DOMobj_windowBaseDragHandle.onpointerdown = function (event) { dragDesktop(DOMobj_windowBaseDragHandle, DOMobj_windowBase, event); };
}

function /*DOMobj*/ initWindow(Int_left, Int_right, Int_width, Int_height) {
    let DOMobj_windowBase = document.getElementsByClassName("windowBase")[0];//get windowbase

    let Struct_Window_newWindow = new Struct_Window();

    let DOMobj_windowLocator = document.createElement("div");//locator
    DOMobj_windowLocator.setAttribute("class", "windowLocator");
    DOMobj_windowBase.appendChild(DOMobj_windowLocator);
    Struct_Window_newWindow.DOMobj_locator = DOMobj_windowLocator;

    let DOMobj_newWindow = document.createElement("div");//window
    DOMobj_newWindow.setAttribute("class", "window");
    DOMobj_windowLocator.appendChild(DOMobj_newWindow);
    Struct_Window_newWindow.DOMobj_frame = DOMobj_newWindow;

    let DOMobj_navigator = document.createElement("div");//navigator
    DOMobj_navigator.setAttribute("class", "nav");
    DOMobj_newWindow.appendChild(DOMobj_navigator);
    Struct_Window_newWindow.DOMobj_navigator = DOMobj_navigator;

    let DOMobj_dragBox = document.createElement("div");//dragBox
    DOMobj_dragBox.setAttribute("class", "windowDragBox");
    DOMobj_navigator.appendChild(DOMobj_dragBox);
    Struct_Window_newWindow.DOMobj_dragBox = DOMobj_dragBox;

    let DOMobj_closeButton = document.createElement("div");//closeButton
    DOMobj_closeButton.setAttribute("class", "closeButton");
    DOMobj_navigator.appendChild(DOMobj_closeButton);
    Struct_Window_newWindow.DOMobj_closeButton = DOMobj_closeButton;

    let DOMobj_maximizeButton = document.createElement("div");//maximizeButton
    DOMobj_maximizeButton.setAttribute("class", "maximizeButton");
    DOMobj_navigator.appendChild(DOMobj_maximizeButton);
    Struct_Window_newWindow.DOMobj_maximizeButton = DOMobj_maximizeButton;

    let DOMobj_cover = document.createElement("div");//cover
    DOMobj_cover.setAttribute("class", "windowCover");
    DOMobj_newWindow.appendChild(DOMobj_cover);
    Struct_Window_newWindow.DOMobj_cover = DOMobj_cover;

    DOMobj_cover.setAttribute("style", "top:-100%;left:-100%;");
    DOMobj_windowLocator.setAttribute("style", "top:0;left:0;");

    Struct_Window_newWindow.Bool_isMaximized = false;
    DOMobj_newWindow.onpointerdown = function () { if (Struct_Window_newWindow.Int_pileIndex !== 1) moveWindowToTheTopOfItsIndexGroup(Struct_Window_newWindow); };//2024.4.11 tip:if not judge the pileindex then every time "moveWindow...Top" will deny any other process
    DOMobj_maximizeButton.onclick = function () { changeMaximizeStatus(Struct_Window_newWindow); };
    DOMobj_dragBox.onpointerdown = function (event) { if (!Struct_Window_newWindow.Bool_isMaximized) dragWindow(Struct_Window_newWindow, event); };//windowDrag
    DOMobj_closeButton.onclick = function () { closeWindow(Struct_Window_newWindow) };

    Struct_Window_newWindow.Struct_StdWindowRect_windowRect.Int_top = parseInt(Struct_Window_newWindow.DOMobj_locator.style.top);
    Struct_Window_newWindow.Struct_StdWindowRect_windowRect.Int_left = parseInt(Struct_Window_newWindow.DOMobj_locator.style.left);
    Struct_Window_newWindow.Struct_StdWindowRect_windowRect.Int_width = 60;/*bug fixed 2024.6.4 YCH (auto cover window uses function "isWindowOverlap" to detect overlap, it needs to check the attribute "positionRestore")*/
    Struct_Window_newWindow.Struct_StdWindowRect_windowRect.Int_height = 30;//save attributes for the first time

    Struct_Window_newWindow.Int_handle = distributeWindowHandle();
    addWindowToGWOP(Struct_Window_newWindow.Int_handle);
    Arr_Struct_Window_allWindows.push(Struct_Window_newWindow);
    Struct_Window_newWindow.Int_indexOfPileIndex = 1;//Debug Config
    DOMobj_maximizeButton.innerHTML = String(Struct_Window_newWindow.Int_handle);//Debug Config

    moveWindowToTheTopOfItsIndexGroup(Struct_Window_newWindow);

    return Struct_Window_newWindow;
}//2024.4.2

function /*void*/ dragWindow(Struct_Window_targetWindow, event) {//2024.4.11 copied from function “dragObject” and customized for desktop QwQ
    let DOMobj_SVGfilterEffect = document.getElementById("SVGfilterEffect-window").firstElementChild;
    let Int_moveOriginX = parseInt(Struct_Window_targetWindow.DOMobj_locator.style.left);
    let Int_moveOriginY = parseInt(Struct_Window_targetWindow.DOMobj_locator.style.top);
    let Int_cursorX = event.clientX;
    let Int_cursorY = event.clientY;

    let Int_lastTop = Int_moveOriginY;//24.8.18 update motionBlur
    let Int_lastLeft = Int_moveOriginX;
    document.onpointermove = function (event) {
        let Int_left = Int_moveOriginX + event.clientX - Int_cursorX;
        let Int_top = Int_moveOriginY + event.clientY - Int_cursorY;
        Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_top = Int_top;
        Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_left = Int_left;
        if (isWindowInScreen(Struct_Window_targetWindow)) {//在窗口内才更新运动模糊
            Struct_Window_targetWindow.DOMobj_locator.style.left = ((Int_left + Int_lastLeft) / 2) + "px";
            Struct_Window_targetWindow.DOMobj_locator.style.top = ((Int_top + Int_lastTop) / 2) + "px";

            Struct_Window_targetWindow.DOMobj_locator.style.filter = "url(#SVGfilterEffect-window)";
            updateWindowMotionBlur(Struct_Window_targetWindow, DOMobj_SVGfilterEffect, Int_lastLeft, Int_lastTop, Int_left, Int_top);
        }
        else {
            Struct_Window_targetWindow.DOMobj_locator.style.left = Int_left + "px";
            Struct_Window_targetWindow.DOMobj_locator.style.top = Int_top + "px";

            updateWindowMotionBlur(Struct_Window_targetWindow, DOMobj_SVGfilterEffect, 0, 0, 0, 0);
            Struct_Window_targetWindow.DOMobj_locator.style.transform = "";
            Struct_Window_targetWindow.DOMobj_frame.style.transform = "";
            Struct_Window_targetWindow.DOMobj_locator.style.filter = "";
        }

        Int_lastTop = Int_top;
        Int_lastLeft = Int_left;
    };
    document.onpointerup = function (event) {
        Struct_Window_targetWindow.DOMobj_locator.style.left = Int_lastLeft + "px";
        Struct_Window_targetWindow.DOMobj_locator.style.top = Int_lastTop + "px";
        updateWindowMotionBlur(Struct_Window_targetWindow, DOMobj_SVGfilterEffect, 0, 0, 0, 0);
        Struct_Window_targetWindow.DOMobj_locator.style.transform = "";
        Struct_Window_targetWindow.DOMobj_frame.style.transform = "";

        Struct_Window_targetWindow.DOMobj_locator.style.filter = "";
        Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_top = parseInt(Struct_Window_targetWindow.DOMobj_locator.style.top);
        Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_left = parseInt(Struct_Window_targetWindow.DOMobj_locator.style.left);
        Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_width = parseInt(Struct_Window_targetWindow.DOMobj_frame.style.width);
        Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_height = parseInt(Struct_Window_targetWindow.DOMobj_frame.style.height);
        /*save attribute copied from function "maximizeWindow" 2024.4.11 */
        //save restore attributes
        moveWindowToTheTopOfItsIndexGroup(Struct_Window_targetWindow);//adjust window cover status (added by YCH 2024.6.4)
        //why movewindowtothetopofitsindecxgrooup... is useless? bug report 2024.6.4
        document.onpointerup = null;
        document.onpointermove = null;
        if (typeof (Struct_Window_targetWindow.DOMobj_dragBox.releasePointerCapture) != "undefined") {
            Struct_Window_targetWindow.DOMobj_dragBox.releasePointerCapture(event.pointerId);
        };
    };
    document.ondragstart = function (event) { event.preventDefault(); };
    document.ondragend = function (event) { event.preventDefault(); };
}

function /*void*/ dragObject(DOMobj_dragBox, DOMobj_moveTarget) {
    let Int_moveOriginX = parseInt(DOMobj_moveTarget.style.left);
    let Int_moveOriginY = parseInt(DOMobj_moveTarget.style.top);
    let Int_cursorX = window.event.clientX;
    let Int_cursorY = window.event.clientY;
    document.onpointermove = function () {
        let Int_left = Int_moveOriginX + window.event.clientX - Int_cursorX;
        let Int_top = Int_moveOriginY + window.event.clientY - Int_cursorY;
        DOMobj_moveTarget.style.left = Int_left + "px";
        DOMobj_moveTarget.style.top = Int_top + "px";
    };
    document.onpointerup = function (event) {
        document.onpointerup = null;
        document.onpointermove = null;
        if (typeof (DOMobj_dragBox.releasePointerCapture) != "undefined") {
            DOMobj_dragBox.releasePointerCapture(event.pointerId);
        };
    };
    document.ondragstart = function (event) { event.preventDefault(); };
    document.ondragend = function (event) { event.preventDefault(); };
}

function /*void*/ changeMaximizeStatus(Struct_Window_window) {
    if (Struct_Window_window.Bool_isMaximized) {
        restoreWindow(Struct_Window_window);
    }
    else {
        maximizeWindow(Struct_Window_window);
    }
}

function /*void*/ maximizeWindow(Struct_Window_targetWindow) {
    let DOMobj_targetWindow = Struct_Window_targetWindow.DOMobj_frame;

    Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_top = parseInt(Struct_Window_targetWindow.DOMobj_locator.style.top);
    Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_left = parseInt(Struct_Window_targetWindow.DOMobj_locator.style.left);
    Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_width = parseInt(Struct_Window_targetWindow.DOMobj_frame.style.width);
    Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_height = parseInt(Struct_Window_targetWindow.DOMobj_frame.style.height);
    /*bug fixed 2024.4.11 style.something is ARRAY!!! not integer so use parseInt() to translate (YCH realized this bug in a dream last night :D  */
    //save restore attributes

    DOMobj_targetWindow.style.height = "";//clear attributes
    DOMobj_targetWindow.style.width = "";
    DOMobj_targetWindow.style.left = "";
    DOMobj_targetWindow.style.top = "";

    DOMobj_targetWindow.setAttribute("class", "maximizedWindow");
    Struct_Window_targetWindow.Bool_isMaximized = true;
}

function /*void*/ restoreWindow(Struct_Window_targetWindow) {
    let DOMobj_targetWindow = Struct_Window_targetWindow.DOMobj_frame;

    Struct_Window_targetWindow.DOMobj_frame.style.height = Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_height + "px";//restore attributes
    Struct_Window_targetWindow.DOMobj_frame.style.width = Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_width + "px";
    Struct_Window_targetWindow.DOMobj_locator.style.left = Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_left + "px";
    Struct_Window_targetWindow.DOMobj_locator.style.top = Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_top + "px";

    DOMobj_targetWindow.setAttribute("class", "window");
    Struct_Window_targetWindow.Bool_isMaximized = false;
}

function /*void*/ closeWindow(Struct_Window_targetWindow) {
    let Int_len = Arr_Struct_Window_allWindows.length;
    for (let Int_i = 0; Int_i < Int_len; Int_i++) {//adjust other windows' index
        if ((Arr_Struct_Window_allWindows[Int_i]).Int_indexOfPileIndex === Struct_Window_targetWindow.Int_indexOfPileIndex) {
            if ((Arr_Struct_Window_allWindows[Int_i]).Int_pileIndex >= Struct_Window_targetWindow.Int_pileIndex) {
                (Arr_Struct_Window_allWindows[Int_i]).Int_pileIndex--;//adjust the index
                (Arr_Struct_Window_allWindows[Int_i]).DOMobj_closeButton.innerHTML = "i=" + Arr_Struct_Window_allWindows[Int_i].Int_pileIndex;//Debug Config
                if ((Arr_Struct_Window_allWindows[Int_i]).Int_pileIndex === 1) {
                    (Arr_Struct_Window_allWindows[Int_i]).DOMobj_cover.setAttribute("style", "top:-100%;left:-100%;");//uncover the new top window
                }
            }
        }
    }//pileIndex display unfinish -4.7 By Gevin //finished by ych 2024.4.14
    removeWindowFromGWOP(Struct_Window_targetWindow.Int_handle);
    Arr_Struct_Window_allWindows.splice(Arr_Struct_Window_allWindows.indexOf(Struct_Window_targetWindow), 1);//remove from array
    Struct_Window_targetWindow.DOMobj_locator.remove();//remove from DOM
    Struct_Window_targetWindow = null;//free the memory
}

function /*void*/ dragDesktop(DOMobj_dragBox, DOMobj_moveTarget, event) {//copied from function “dragObject” and customized for desktop QwQ
    let DOMobj_SVGfilterEffect_desktop = document.getElementById("SVGfilterEffect-windowBaseDragHandle").firstElementChild;
    let DOMobj_SVGfilterEffect_window = document.getElementById("SVGfilterEffect-window").firstElementChild;
    let Int_moveOriginX = parseInt(DOMobj_moveTarget.style.left);
    let Int_moveOriginY = parseInt(DOMobj_moveTarget.style.top);
    let Int_cursorX = event.clientX;
    let Int_cursorY = event.clientY;

    let Int_lastTop = Int_moveOriginY;//24.8.17 update motionBlur
    let Int_lastLeft = Int_moveOriginX;

    let Int_len = Arr_Struct_Window_allWindows.length;//等会遍历窗口用

    for (let Int_i = 0; Int_i < Int_len; Int_i++) {
        //两次剔除需要分开,因为窗口机器大量的情况下,即使把下面的窗口全部不给模糊,也会卡,必须直接ban掉显示,并且上面模糊之后会透出下面不模糊的
        if (isWindowFullCoveredByOthers(Arr_Struct_Window_allWindows[Int_i])) {//第一次更新剔除:被其它窗口完全盖住就不更新 这个只要剔除一次,因为拖动桌面的时候窗口不会动
            Arr_Struct_Window_allWindows[Int_i].DOMobj_locator.style.display = "none";
        }
    }//有点离谱,1000窗口测试的时候拖动结束的时候会卡一下,貌似是因为要同时调整999个窗口,GPU吃不消,那么以后这个剔除得保持常驻了,估计为了提升计算效率还得打进GWOP里面,先这样吧 PR 2024.10.3

    document.onpointermove = function (event) {
        let Int_left = Int_moveOriginX + event.clientX - Int_cursorX;
        let Int_top = Int_moveOriginY + event.clientY - Int_cursorY;
        DOMobj_moveTarget.style.left = ((Int_left + Int_lastLeft) / 2) + "px";
        DOMobj_moveTarget.style.top = ((Int_top + Int_lastTop) / 2) + "px";//加完了，这下舒服了，真绕了好多弯子啊
        //写，必须写！不写偏移观感一坨史！24.8.18 
        //不写了，写的话还要套一层旋转，DOM元素不能再多了，比毕竟没人天天把屏幕拖来拖去，就这样吧 、、
        //原来是bug，我说呢，frame改之后加了旋转，我偏移得加在locator上啊 
        //我是sb吗，我加windowbase啊，加什么locator啊!
        updateWindowBackground(DOMobj_dragBox, (Int_left + Int_lastLeft) / 2, (Int_top + Int_lastTop) / 2);
        updateWindowBackgroundMotionBlur(DOMobj_SVGfilterEffect_desktop, Int_lastTop, Int_lastLeft, Int_top, Int_left);

        for (let Int_i = 0; Int_i < Int_len; Int_i++) {
            if (isWindowInScreen(Arr_Struct_Window_allWindows[Int_i])) {//第二次更新剔除:在屏幕内才更新 这个要每次更新剔除一次
                Arr_Struct_Window_allWindows[Int_i].DOMobj_locator.style.filter = "url(#SVGfilterEffect-window)";
                updateWindowMotionBlur(Arr_Struct_Window_allWindows[Int_i], DOMobj_SVGfilterEffect_window, Int_lastLeft, Int_lastTop, Int_left, Int_top);//update all windows' blur effect
            }
            else {
                Arr_Struct_Window_allWindows[Int_i].DOMobj_locator.style.transform = "";
                Arr_Struct_Window_allWindows[Int_i].DOMobj_frame.style.transform = "";
                Arr_Struct_Window_allWindows[Int_i].DOMobj_locator.style.filter = "";
            }
        }//这里因为把窗口位置放在两次移动点中间麻烦，就没写了，直接没有偏移窗口位置，看看观感再说吧 24.8.18YCH
        Int_lastTop = Int_top;
        Int_lastLeft = Int_left;
    };
    document.onpointerup = function (event) {
        updateWindowBackgroundMotionBlur(DOMobj_SVGfilterEffect_desktop, 0, 0, 0, 0);//clear blur
        let Int_left = Int_moveOriginX + event.clientX - Int_cursorX;
        let Int_top = Int_moveOriginY + event.clientY - Int_cursorY;
        DOMobj_moveTarget.style.left = Int_left + "px";
        DOMobj_moveTarget.style.top = Int_top + "px";//2024.8.17 update: to add feature "motionBlur" update the position at the end of the drag  YCH
        updateWindowBackground(DOMobj_dragBox, Int_left, Int_top);//let grid align with the pixels(int -> float 强制类型转换)
        for (let Int_i = 0; Int_i < Int_len; Int_i++) {//clear
            updateWindowMotionBlur(Arr_Struct_Window_allWindows[Int_i], DOMobj_SVGfilterEffect_window, 0, 0, 0, 0);
            Arr_Struct_Window_allWindows[Int_i].DOMobj_locator.style.transform = "";
            Arr_Struct_Window_allWindows[Int_i].DOMobj_frame.style.transform = "";
            Arr_Struct_Window_allWindows[Int_i].DOMobj_locator.style.left = Arr_Struct_Window_allWindows[Int_i].Struct_StdWindowRect_windowRect.Int_left + "px";
            Arr_Struct_Window_allWindows[Int_i].DOMobj_locator.style.top = Arr_Struct_Window_allWindows[Int_i].Struct_StdWindowRect_windowRect.Int_top + "px";
            Arr_Struct_Window_allWindows[Int_i].DOMobj_locator.style.filter = "";
            Arr_Struct_Window_allWindows[Int_i].DOMobj_locator.style.display = "";
        }

        document.onpointerup = null;
        document.onpointermove = null;
        if (typeof (DOMobj_dragBox.releasePointerCapture) != "undefined") {
            DOMobj_dragBox.releasePointerCapture(event.pointerId);
        };
    };
    document.ondragstart = function (event) { event.preventDefault(); };
    document.ondragend = function (event) { event.preventDefault(); };
}

function /*void*/ updateWindowBackground(DOMobj_target, Float_X, Float_Y) {//24.8.17 blur update: coord Int->Float
    let String_gridColor = "#2c2d6b";
    let Int_gridDistance = 100;//px
    Float_X = ((Float_X % Int_gridDistance) + Int_gridDistance) % Int_gridDistance;
    Float_Y = (((Int_gridDistance - Float_Y) % Int_gridDistance) + Int_gridDistance) % Int_gridDistance;
    DOMobj_target.style.background = "repeating-linear-gradient(90deg,transparent 0px,transparent " + Float_X + "px," + String_gridColor + " " + Float_X + "px," + String_gridColor + " " + (Float_X + 1) + "px,transparent " + (Float_X + 1) + "px,transparent " + Int_gridDistance + "px),repeating-linear-gradient(0deg,transparent 0px,transparent " + Float_Y + "px," + String_gridColor + " " + Float_Y + "px," + String_gridColor + " " + (Float_Y + 1) + "px,transparent " + (Float_Y + 1) + "px,transparent " + Int_gridDistance + "px)";
}

function /*Int*/ distributeWindowHandle() {//there are some bugs in this function //bugs fixed at 2024.4.8, originated from a miss 2nd argument "1" of native function "splice" in function "closeWindow" (window.js)
    let Int_len = Arr_Struct_Window_allWindows.length;
    let Int_finalIndex = Int_len + 1;
    let Arr_Int_flag/*variable*/ = new Array(Int_len);
    for (let Int_i = 0; Int_i < Int_len; Int_i++) {
        Arr_Int_flag[Int_i] = 0;
    }
    for (let Int_i = 0; Int_i < Int_len; Int_i++) {
        Arr_Int_flag[(Arr_Struct_Window_allWindows[Int_i]).Int_handle - 1]++;
    }
    for (let Int_i = 0; Int_i < Int_len; Int_i++) {
        if (Arr_Int_flag[Int_i] === 0) {
            Int_finalIndex = Int_i + 1;
            break;
        }
    }
    return Int_finalIndex;//find out the smallest missing number to distribute to the window as the handle
}

function /*Struct_Window*/ getWindowByHandle(Int_targetHandle) {
    let Struct_Window_targetWindow = undefined;
    for (let Int_len = Arr_Struct_Window_allWindows.length - 1; Int_len >= 0; Int_len--) {
        if ((Arr_Struct_Window_allWindows[Int_len]).Int_handle === Int_targetHandle) {
            Struct_Window_targetWindow = Arr_Struct_Window_allWindows[Int_len];
            break;
        }
    }
    return Struct_Window_targetWindow;
}//2024.4.8 

function /*void*/ swapWindowSequenceOfDOM(Struct_Window_window1, Struct_Window_window2) {
    Struct_Window_window2.DOMobj_frame.nextSibling === Struct_Window_window1.DOMobj_frame
        ? Struct_Window_window1.DOMobj_frame.parentNode.insertBefore(
            Struct_Window_window2.DOMobj_frame,
            Struct_Window_window1.DOMobj_frame.nextSibling)
        : Struct_Window_window1.DOMobj_frame.parentNode.insertBefore(
            Struct_Window_window2.DOMobj_frame,
            Struct_Window_window1.DOMobj_frame);
}//4.9 noon //THIS FUNCTION IS NOT USED AND WON'T BE USED(maybe ,20240414 ych)!!!

function /*void*/ moveWindowToTheTopOfItsIndexGroup(Struct_Window_targetWindow) {//move the window to the top(in its group: Struct_Window->Int_indexOfPileIndex),and set pileIndex(Struct_Window->Int_pileIndex) to the biggest
    let Int_len = Arr_Struct_Window_allWindows.length;
    let Struct_Window_lastTopWindow = undefined;
    for (let Int_i = 0; Int_i < Int_len; Int_i++) {
        if ((Arr_Struct_Window_allWindows[Int_i]).Int_indexOfPileIndex === Struct_Window_targetWindow.Int_indexOfPileIndex) {
            if ((Arr_Struct_Window_allWindows[Int_i]).Int_pileIndex === 1) {
                //bug fixed 2024.4.10 mistakingly spelled the "pileindex" as "indexOfPileIndex"
                Struct_Window_lastTopWindow = Arr_Struct_Window_allWindows[Int_i];
            }//find the last on-top window in the group
            if (Struct_Window_targetWindow.Int_pileIndex === undefined || (Arr_Struct_Window_allWindows[Int_i]).Int_pileIndex < Struct_Window_targetWindow.Int_pileIndex) {//to only adjust the index before the target (bug discovered and fixed on 2024.4.10)//initwindow dont have index(undefined) bug fixed on 2024.4.10
                (Arr_Struct_Window_allWindows[Int_i]).Int_pileIndex++;//adjust the index
                if (Struct_Window_targetWindow.Struct_StdWindowRect_windowRect !== undefined && isWindowOverlap(Arr_Struct_Window_allWindows[Int_i], Struct_Window_targetWindow)) {//if overlap then cover the beneath window
                    coverWindow(Arr_Struct_Window_allWindows[Int_i]);
                }
            }
            (Arr_Struct_Window_allWindows[Int_i]).DOMobj_closeButton.innerHTML = "i=" + String((Arr_Struct_Window_allWindows[Int_i]).Int_pileIndex);//Debug Config
        }
    }
    Struct_Window_targetWindow.Int_pileIndex = 1;//set top index

    uncoverWindow(Struct_Window_targetWindow);

    Struct_Window_targetWindow.DOMobj_closeButton.innerHTML = "i=" + Struct_Window_targetWindow.Int_pileIndex;//Debug Config


    if (Struct_Window_lastTopWindow !== undefined && Struct_Window_lastTopWindow.DOMobj_frame.nextSibling !== undefined) {//adjust the DOM sequence
        Struct_Window_targetWindow.DOMobj_locator.parentNode.insertBefore(
            Struct_Window_targetWindow.DOMobj_locator,
            Struct_Window_lastTopWindow.DOMobj_locator.nextSibling);//2024.8.18 运动模糊更新后，在frame父级插了个locator，这里的frame也就换成了locator
    }
    /*Bug report from Gevin:
        函数 moveWindowTotheTopofItsIndexGroup 运行无误
        建议检查窗口的图形绘制器
    */
    //--YCH  bug fixed 2024 10.11 we don't need a "insertBefore" but a "insertAfter" so finally resolved by "insertBefore" at the "nextSibling" of the target (for more information, please read the develop log)
}//2024.4.11

function /*Bool*/ isWindowOverlap(Struct_Window_window1, Struct_Window_window2) {//is there's a bug? 2024.6.4
    return (updateWindowOverlapStatus(Struct_Window_window1, Struct_Window_window2) < 0);
}//2024.4.15

function /*Bool*/ isWindowInScreen(Struct_Window_window) {
    let Int_screenLeft = parseInt(DOMobj_windowBase.style.left) + Struct_Window_window.Struct_StdWindowRect_windowRect.Int_left;
    let Int_screenRight = Int_screenLeft + Struct_Window_window.Struct_StdWindowRect_windowRect.Int_width;
    let Int_screenTop = parseInt(DOMobj_windowBase.style.top) + Struct_Window_window.Struct_StdWindowRect_windowRect.Int_top;
    let Int_screenBottom = Int_screenTop + Struct_Window_window.Struct_StdWindowRect_windowRect.Int_height;
    return !((Int_screenRight < 0 || Int_screenLeft > innerWidth) || (Int_screenBottom < 0 || Int_screenTop > innerHeight));
}

function /*void*/ coverWindow(Struct_Window_targetWindow) {
    Struct_Window_targetWindow.DOMobj_cover.style.left = "0";
    Struct_Window_targetWindow.DOMobj_cover.style.top = "0";
    //Struct_Window_targetWindow.DOMobj_cover.style.display = "";
}

function /*void*/ uncoverWindow(Struct_Window_targetWindow) {
    Struct_Window_targetWindow.DOMobj_cover.style.top = "-100%";
    Struct_Window_targetWindow.DOMobj_cover.style.left = "-100%";//uncover the window
    //Struct_Window_targetWindow.DOMobj_cover.style.display = "none";
}

function /*int*/ queryWindowOverlapStatus(Struct_Window_window1, Struct_Window_window2) {
    if (Struct_Window_window1.Int_handle === Struct_Window_window2.Int_handle) { return 0; }
    let Int_HandleL = undefined;
    let Int_HandleS = undefined;
    if (Struct_Window_window1.Int_handle > Struct_Window_window2.Int_handle) {
        Int_HandleL = Struct_Window_window1.Int_handle;
        Int_HandleS = Struct_Window_window2.Int_handle;
    }
    else {
        Int_HandleL = Struct_Window_window2.Int_handle;
        Int_HandleS = Struct_Window_window1.Int_handle;
    }
    return Arr_Int_globalWindowOverlapTable[((Int_HandleL - 1) * (Int_HandleL - 2) >> 1) + Int_HandleL - 1];
}

function /*int*/ updateWindowOverlapStatus(Struct_Window_window1, Struct_Window_window2) {
    if (Struct_Window_window1.Int_handle === Struct_Window_window2.Int_handle) { return 0; }
    let Int_handleL = undefined;
    let Int_handleS = undefined;
    if (Struct_Window_window1.Int_handle > Struct_Window_window2.Int_handle) {
        Int_handleL = Struct_Window_window1.Int_handle;
        Int_handleS = Struct_Window_window2.Int_handle;
    }
    else {
        Int_handleL = Struct_Window_window2.Int_handle;
        Int_handleS = Struct_Window_window1.Int_handle;
    }
    return (Arr_Int_globalWindowOverlapTable[((Int_handleL - 1) * (Int_handleL - 2) >> 1) + Int_handleS - 1] = calculateWindowOverlapStatus(Struct_Window_window1, Struct_Window_window2));
}

function /*int*/ calculateWindowOverlapStatus(Struct_Window_window1, Struct_Window_window2) {
    let Struct_StdWindowRect_rect1 = Struct_Window_window1.Struct_StdWindowRect_windowRect;
    let Struct_StdWindowRect_rect2 = Struct_Window_window2.Struct_StdWindowRect_windowRect;
    let Int_right1 = Struct_StdWindowRect_rect1.Int_left + Struct_StdWindowRect_rect1.Int_width;
    let Int_right2 = Struct_StdWindowRect_rect2.Int_left + Struct_StdWindowRect_rect2.Int_width;
    let Int_bottom1 = Struct_StdWindowRect_rect1.Int_top + Struct_StdWindowRect_rect1.Int_height;
    let Int_bottom2 = Struct_StdWindowRect_rect2.Int_top + Struct_StdWindowRect_rect2.Int_height;
    let Int_dx = Math.max(Struct_StdWindowRect_rect1.Int_left - Int_right2, Struct_StdWindowRect_rect2.Int_left - Int_right1);
    let Int_dy = Math.max(Struct_StdWindowRect_rect1.Int_top - Int_bottom2, Struct_StdWindowRect_rect2.Int_top - Int_bottom1);
    if (Int_dx > 0 && Int_dy > 0) { return Int_dx + Int_dy; }
    return Math.max(Int_dx, Int_dy);
}

function /*void*/ updateWindowBackgroundMotionBlur(DOMobj_SVGfilterEffectContainer, Int_lastX, Int_lastY, Int_nextX, Int_nextY) {//window背景的运动模糊比较特殊，因为是只有横竖的方格图案，所以不用转换成单一方向再模糊（SVGfilter只支持横纵两个方向的模糊）
    DOMobj_SVGfilterEffectContainer.setAttribute("stdDeviation",
        (Math.abs((Int_nextY - Int_lastY) / 2)) + "," + (Math.abs((Int_nextX - Int_lastX) / 2)));//get <feGaussianBlur> and change status
}

function /*void*/ updateWindowMotionBlur(Struct_Window_targetWindow, DOMobj_SVGfilterEffectContainer, Int_lastX, Int_lastY, Int_nextX, Int_nextY) {//窗口的运动模糊更加泛用化，都是旋转，单一方向模糊，再旋转
    let Int_dx = Int_nextX - Int_lastX;
    let Int_dy = Int_nextY - Int_lastY;
    let Float_theta = Math.atan2(Int_dy, Int_dx) / Math.PI * 180;
    let Float_distance = Math.sqrt(Int_dx * Int_dx + Int_dy * Int_dy);
    Struct_Window_targetWindow.DOMobj_locator.style.transform = "rotate(" + Float_theta + "deg)";
    Struct_Window_targetWindow.DOMobj_frame.style.transform = "rotate(" + (-Float_theta) + "deg)";
    DOMobj_SVGfilterEffectContainer.setAttribute("stdDeviation", Float_distance / 2 + ",0");
}

function /*void*/ addWindowToGWOP(Int_targetHandle) {//请务必在把window添加到allWindows中之前先调用我，否则如果要添加的窗口刚好是最大handle则不会正确扩充表
    let Int_maxHandle = getMaxHandle();
    if (Int_targetHandle >= Int_maxHandle) {
        extendGWOP((Int_targetHandle * (Int_targetHandle - 1) >> 1) - (Int_maxHandle * (Int_maxHandle - 1) >> 1));
    }
}

function /*void*/ removeWindowFromGWOP(Int_targetHandle) {
    if (Int_targetHandle === getMaxHandle()) {
        shrinkGWOP(Int_targetHandle - 1);
    }
}

function /*void*/ extendGWOP(Int_n) {
    while (Int_n > 0) {
        Arr_Int_globalWindowOverlapTable.push(0);
        Int_n--;
    }
}

function /*void*/ shrinkGWOP(Int_n) {
    while (Int_n > 0) {
        Arr_Int_globalWindowOverlapTable.pop();
        Int_n--;
    }
}

function /*void*/ refreshGWOP(/*void*/) {

}

function /*void*/ updateAllOverlapStatusOfWindow(Int_targetHandle) {

}

function /*int*/ getMaxHandle(/*void*/) {
    if (Arr_Struct_Window_allWindows.length === 0) { return 0; }
    let Int_maxHandle = 1;
    for (let Int_i = Arr_Struct_Window_allWindows.length - 1; Int_i >= 0; Int_i--) {
        Int_maxHandle = Arr_Struct_Window_allWindows[Int_i].Int_handle > Int_maxHandle ? Arr_Struct_Window_allWindows[Int_i].Int_handle : Int_maxHandle;//math.max速度低于三目运算符，下次把calculateOverlapStatus那里的也换掉
    }
    return Int_maxHandle;
}

function /*int*/ isWindowFullCoveredByOthers(Struct_Window_targetWindow) {
    if (Arr_Struct_Window_allWindows.length === 0) { return false; }//防呆
    for (let Int_i = Arr_Struct_Window_allWindows.length - 1; Int_i >= 0; Int_i--) {
        if (Struct_Window_targetWindow.Int_handle !== (Arr_Struct_Window_allWindows[Int_i]).Int_handle) {
            if (isWindowCoveredByWindow(Struct_Window_targetWindow, Arr_Struct_Window_allWindows[Int_i])) { return true; }
        }
    }
    return false;
}

function /*int*/ isWindowCoveredByWindow(Struct_Window_targetWindow, Struct_Window_coverWindow) {
    if ((Struct_Window_coverWindow.Int_indexOfPileIndex < Struct_Window_targetWindow.Int_indexOfPileIndex/*组层级更高,通过*/
        || (Struct_Window_coverWindow.Int_indexOfPileIndex === Struct_Window_targetWindow.Int_indexOfPileIndex/*组层级一致,组内层级更高,通过*/
            && Struct_Window_coverWindow.Int_pileIndex < Struct_Window_targetWindow.Int_pileIndex))/*先确定窗口层级来短路,避免不必要计算,Cover一定会在target上面才能盖住,同时排除掉自己比自己的情况(即indexOfPileindex和pileIndex均相等)*/
    ) {//通过层级比较,接下来开始计算四边覆盖
        let Struct_StdWindowRect_rect1 = Struct_Window_targetWindow.Struct_StdWindowRect_windowRect;
        let Struct_StdWindowRect_rect2 = Struct_Window_coverWindow.Struct_StdWindowRect_windowRect;
        let Int_right1 = Struct_StdWindowRect_rect1.Int_left + Struct_StdWindowRect_rect1.Int_width;
        let Int_right2 = Struct_StdWindowRect_rect2.Int_left + Struct_StdWindowRect_rect2.Int_width;
        let Int_bottom1 = Struct_StdWindowRect_rect1.Int_top + Struct_StdWindowRect_rect1.Int_height;
        let Int_bottom2 = Struct_StdWindowRect_rect2.Int_top + Struct_StdWindowRect_rect2.Int_height;
        return (Int_bottom2 >= Int_bottom1
            && Int_right2 >= Int_right1
            && Struct_StdWindowRect_rect2.Int_left <= Struct_StdWindowRect_rect1.Int_left
            && Struct_StdWindowRect_rect2.Int_top <= Struct_StdWindowRect_rect1.Int_top
        );
    }
    return false;//未通过层级比较,直接否掉
}

//Debug Configs
var i = initWindow;
var a = getWindowByHandle;
var m = moveWindowToTheTopOfItsIndexGroup;
var r = function (r) { m(a(r)); };

