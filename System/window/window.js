"use strict";

//sturctures
function /*Struct_Window*/ Struct_Window() {
    this.Int_handle = undefined;
    this.DOMobj_frame = undefined;
    this.DOMobj_navigator = undefined;
    this.DOMobj_dragBox = undefined;
    this.DOMobj_maximizeButton = undefined;
    this.DOMobj_closeButton = undefined;
    this.DOMobj_cover = undefined;
    this.DOMobj_locator = undefined;
    this.DOMobj_rotateBase = undefined;
    this.DOMobj_title = undefined;
    this.DOMobj_icon = undefined;
    this.Bool_needToBeUpdated = undefined;
    this.Bool_isMaximized = undefined;
    this.Bool_isHidden = undefined;
    this.Bool_isCovered = undefined;
    this.Bool_hasRecentlyChangedHiddenState = undefined;
    this.Bool_isClosed = undefined;
    this.Str_title = undefined;
    this.Struct_StdWindowRect_windowRect = new Struct_StdWindowRect();//new
    this.Int_indexOfPileIndex = undefined;
    this.Int_pileIndex = undefined;
    this.Float_timeStamp = undefined;
}

function /*Struct_StdWindowRect*/ Struct_StdWindowRect() {//代替Arr_Int[4]型的窗口坐标，那玩意可读性有点低了，而且目前仅有V8有优化，还是侧重一下语义吧 24.8.24
    this.Int_top = undefined;
    this.Int_left = undefined;
    this.Int_width = undefined;
    this.Int_height = undefined;
}
//global variables
var Arr_Struct_Window_allWindows/*for system only*/ = new Array();
var Arr_Int_globalWindowOverlapTable/*for system only*/ = new Array();//卧槽 写了这么久才发现以前全局窗口遮挡表的缩写所有的GWOT全打成了GWOP,一查有25个
var DOMobj_windowBase/*for system only*/ = undefined;//调用initDesktop()后才赋值
var Int_indexOfWindowToBeAsyncUpdated/*for system only*/ = 0;//仅被asyncUpdateAllWindow()使用
var Arr_Int_indexOfGWOTToBeAsyncUpdated/*for system only*/ = new Array(0, 0);//仅被asyncUpdateGWOT()使用 //[0]:外层循环位置,[1]:内层循环位置
var Bool_suspendAsyncUpdate/*for system only*/ = false;//仅被两个异步更新函数使用
var ROobj_windowBaseResizeObserver/*for system only*/ = undefined;

//functions
function /*void*/ initDesktop(/*void*/) {
    DOMobj_windowBase = document.getElementsByClassName("windowBase")[0];//get windowbase
    DOMobj_windowBase.style.left = 0;
    DOMobj_windowBase.style.top = 0;
    let DOMobj_windowBaseDragHandle = document.getElementsByClassName("windowBaseDragHandle")[0];
    DOMobj_windowBaseDragHandle.onpointerdown = function (event) { dragDesktop(DOMobj_windowBaseDragHandle, DOMobj_windowBase, event); };
}

function /*void*/ initWindowResizeSynchronizer(/*void*/) {
    ROobj_windowBaseResizeObserver = new ResizeObserver(function (entries) {
        for (let entry of entries) {
            if (entry.target.Struct_Window_thisWindow.Bool_hasRecentlyChangedHiddenState) {
                //还要防止隐藏和显现窗口时更改display状态导致的resize检测，这里新增一个变量来存，若更改了状态，那么这里触发时就抵消掉
                entry.target.Struct_Window_thisWindow.Bool_hasRecentlyChangedHiddenState = false;
            } else {
                if (Bool_isMouseLPressed && !entry.target.Struct_Window_thisWindow.Bool_hasRecentlyChangedHiddenState && !entry.target.Struct_Window_thisWindow.Bool_isMaximized)//防止最大化时破坏窗口位置信息，保证这个resize只用来监听手动更改窗口大小
                    synchronizeWindowRect(entry.target.Struct_Window_thisWindow);
                updateCoverStateOfOverlappedWindow(entry.target.Struct_Window_thisWindow);
            }
        }
    });
}

function /*Struct_Window*/ initWindow(Int_left, Int_top, Int_width, Int_height, Str_title) {
    //get windowbase //deleted,new method use windowBase as a global variable
    let Struct_Window_newWindow = new Struct_Window();
    Struct_Window_newWindow.Str_title = Str_title;

    Int_width = Int_width || 120;
    Int_height = Int_height || 60;

    Struct_Window_newWindow.DOMobj_locator = document.createElement("div");//locator
    Struct_Window_newWindow.DOMobj_locator.setAttribute("class", "windowLocator");
    DOMobj_windowBase.appendChild(Struct_Window_newWindow.DOMobj_locator);

    Struct_Window_newWindow.DOMobj_rotateBase = document.createElement("div");//rotateBase
    Struct_Window_newWindow.DOMobj_rotateBase.setAttribute("class", "windowRotateBase");
    Struct_Window_newWindow.DOMobj_locator.appendChild(Struct_Window_newWindow.DOMobj_rotateBase);

    Struct_Window_newWindow.DOMobj_frame = document.createElement("div");//window
    Struct_Window_newWindow.DOMobj_frame.setAttribute("class", "window");
    Struct_Window_newWindow.DOMobj_rotateBase.appendChild(Struct_Window_newWindow.DOMobj_frame);
    Struct_Window_newWindow.DOMobj_frame.Struct_Window_thisWindow = Struct_Window_newWindow;//给frame创建到所属窗口的引用，在resize时防止遍历（resizeObserver只能监听DOM元素）

    Struct_Window_newWindow.DOMobj_navigator = document.createElement("div");//navigator
    Struct_Window_newWindow.DOMobj_navigator.setAttribute("class", "nav");
    Struct_Window_newWindow.DOMobj_frame.appendChild(Struct_Window_newWindow.DOMobj_navigator);

    Struct_Window_newWindow.DOMobj_title = document.createElement("div");//title
    Struct_Window_newWindow.DOMobj_title.setAttribute("class", "windowTitle");
    Struct_Window_newWindow.DOMobj_navigator.appendChild(Struct_Window_newWindow.DOMobj_title);

    Struct_Window_newWindow.DOMobj_icon = document.createElement("div");//icon
    Struct_Window_newWindow.DOMobj_icon.setAttribute("class", "windowIcon");
    Struct_Window_newWindow.DOMobj_navigator.appendChild(Struct_Window_newWindow.DOMobj_icon);

    Struct_Window_newWindow.DOMobj_dragBox = document.createElement("div");//dragBox
    Struct_Window_newWindow.DOMobj_dragBox.setAttribute("class", "windowDragBox");
    Struct_Window_newWindow.DOMobj_navigator.appendChild(Struct_Window_newWindow.DOMobj_dragBox);

    Struct_Window_newWindow.DOMobj_closeButton = document.createElement("div");//closeButton
    Struct_Window_newWindow.DOMobj_closeButton.setAttribute("class", "closeButton");
    Struct_Window_newWindow.DOMobj_navigator.appendChild(Struct_Window_newWindow.DOMobj_closeButton);

    Struct_Window_newWindow.DOMobj_maximizeButton = document.createElement("div");//maximizeButton
    Struct_Window_newWindow.DOMobj_maximizeButton.setAttribute("class", "maximizeButton");
    Struct_Window_newWindow.DOMobj_navigator.appendChild(Struct_Window_newWindow.DOMobj_maximizeButton);

    Struct_Window_newWindow.DOMobj_cover = document.createElement("div");//cover
    Struct_Window_newWindow.DOMobj_cover.setAttribute("class", "windowCover");
    Struct_Window_newWindow.DOMobj_frame.appendChild(Struct_Window_newWindow.DOMobj_cover);

    let DOMobj_closeButtonIcon = document.createElement("img");
    DOMobj_closeButtonIcon.setAttribute("class", "closeButtonIcon");
    DOMobj_closeButtonIcon.setAttribute("src", "./System/window/close.svg");
    Struct_Window_newWindow.DOMobj_closeButton.appendChild(DOMobj_closeButtonIcon);

    let DOMobj_maximizeButtonIcon = document.createElement("img");
    DOMobj_maximizeButtonIcon.setAttribute("class", "maximizeButtonIcon1");
    DOMobj_maximizeButtonIcon.setAttribute("src", "./System/window/resize.svg");
    Struct_Window_newWindow.DOMobj_maximizeButton.appendChild(DOMobj_maximizeButtonIcon);
    DOMobj_maximizeButtonIcon = document.createElement("img");
    DOMobj_maximizeButtonIcon.setAttribute("class", "maximizeButtonIcon2");
    DOMobj_maximizeButtonIcon.setAttribute("src", "./System/window/resize.svg");
    Struct_Window_newWindow.DOMobj_maximizeButton.appendChild(DOMobj_maximizeButtonIcon);

    Struct_Window_newWindow.DOMobj_cover.setAttribute("style", "top:0;left:0;opacity:0;");
    Struct_Window_newWindow.DOMobj_locator.setAttribute("style", "top:" + Int_top + "px;left:" + Int_left + "px;display:block;");
    Struct_Window_newWindow.DOMobj_frame.setAttribute("style", "width:" + Int_width + "px;height:" + Int_height + "px;");

    Struct_Window_newWindow.Bool_isMaximized = false;
    Struct_Window_newWindow.Bool_isCovered = false;
    Struct_Window_newWindow.Bool_isHidden = false;
    Struct_Window_newWindow.Bool_hasRecentlyChangedHiddenState = false;
    Struct_Window_newWindow.Bool_isClosed = false;
    Struct_Window_newWindow.Float_timeStamp = performance.now();

    Struct_Window_newWindow.DOMobj_frame.onpointerdown = function () {
        if (Struct_Window_newWindow.Bool_isCovered && isWindowOverlappedByOthers(Struct_Window_newWindow))
            moveWindowToTheTopOfItsIndexGroup(Struct_Window_newWindow);
    };//2024.4.11 tip:if not judge the pileindex then every time "moveWindow...Top" will deny any other process
    //检测方式改了，以前是pileindex=1才是顶层，现在是只要不cover就是顶层，所以新增了属性来存储cover状态
    Struct_Window_newWindow.DOMobj_maximizeButton.onclick = function () { changeMaximizeStatus(Struct_Window_newWindow); };
    Struct_Window_newWindow.DOMobj_dragBox.onpointerdown = function (event) { if (!Struct_Window_newWindow.Bool_isMaximized) dragWindow(Struct_Window_newWindow, event); };//windowDrag
    Struct_Window_newWindow.DOMobj_closeButton.onclick = function () { closeWindow(Struct_Window_newWindow) };
    Struct_Window_newWindow.DOMobj_frame.onmouseenter = function () {
        if (!Bool_isMouseLPressed &&
            !Struct_Window_newWindow.Bool_isCovered &&
            Struct_Window_newWindow.Int_pileIndex > 1)
            moveWindowToTheTopOfItsIndexGroup(Struct_Window_newWindow);
    };
    applyWindowTitle(Struct_Window_newWindow);

    /*bug fixed 2024.6.4 YCH (auto cover window uses function "isWindowOverlap" to detect overlap, it needs to check the attribute "positionRestore")*/
    //save attributes for the first time

    Struct_Window_newWindow.Int_handle = distributeWindowHandle();
    addWindowToGWOT(Struct_Window_newWindow.Int_handle);
    Arr_Struct_Window_allWindows.push(Struct_Window_newWindow);
    //蠢没边了，没把新窗口push进全窗口数组就想用length+1来获得预赋值pileindex，也是神入了//这三句因为有相对位置要求，所以一起提前 2025.7.9YCH

    //Struct_Window_newWindow.Int_pileIndex = 0;//新更改:使用0代替undefined,表示此窗口在创建过程中,moveWindowToTheTopOfItsIndexGroup会特殊处理,同时保持初始化的一致性,变量保持正确值 //原先就是出现把undefined执行++出现Nan错误 //现在这是老方法了
    Struct_Window_newWindow.Int_pileIndex = Arr_Struct_Window_allWindows.length + 1;//先放在所有窗口最后，再正常调用置顶函数，防止不必要的特判（其实是因为有bug //新pileindex实现调整2025.7.9
    Struct_Window_newWindow.Bool_needToBeUpdated = false;
    synchronizeWindowRect(Struct_Window_newWindow);//new
    synchornizeDisplayStatus(Struct_Window_newWindow);

    Struct_Window_newWindow.Int_indexOfPileIndex = 1;//Debug Config
    // Struct_Window_newWindow.DOMobj_maximizeButton.textContent = String(Struct_Window_newWindow.Int_handle);//Debug Config

    moveWindowToTheTopOfItsIndexGroup(Struct_Window_newWindow);//这里有个bug，初始化窗口的时候新出现的窗口并不会遮盖其它和它重叠的窗口，单步调试后发现问题出在架构上，因为里面计算overlap status的时候是查询全局窗口重叠表，但是因为阻塞，此时刚加入的新窗口还没有在异步的表更新内更新重叠状态，而刚extend完的表数据默认置0，代表窗口外切，不算overlap，所以没有遮盖窗口
    //已解决，刚好要把overlap就覆盖与层级判断合并后加入异步处理，恰好解决这里的问题，不是置顶的时候调用cover，而是持续异步调用

    ROobj_windowBaseResizeObserver.observe(Struct_Window_newWindow.DOMobj_frame);

    return Struct_Window_newWindow;
}//2024.4.2

function /*void*/ asyncUpdateAllWindow() {
    //高占用事件启动,暂停更新
    if (Bool_suspendAsyncUpdate || Arr_Struct_Window_allWindows.length === 0) return;//没有窗口要操作
    //两个过滤合并了,但优先顺序不变,用逻辑短路,减少if的个数,编译更快

    Int_indexOfWindowToBeAsyncUpdated++;
    if (Int_indexOfWindowToBeAsyncUpdated >= Arr_Struct_Window_allWindows.length)
        Int_indexOfWindowToBeAsyncUpdated = 0;//循环扫描整个表

    if (Arr_Struct_Window_allWindows[Int_indexOfWindowToBeAsyncUpdated].Bool_isClosed && Arr_Struct_Window_allWindows[Int_indexOfWindowToBeAsyncUpdated].Float_timeStamp < Float_estiatedNow) {
        removeWindow(Arr_Struct_Window_allWindows[Int_indexOfWindowToBeAsyncUpdated]);
    }
    //处理系统内部更改
    //剔除就放在这里了
    Arr_Struct_Window_allWindows[Int_indexOfWindowToBeAsyncUpdated].Bool_isHidden =
        /*!isWindowInScreen(Arr_Struct_Window_allWindows[Int_indexOfWindowToBeAsyncUpdated])
        || */isWindowFullCoveredByOthers(Arr_Struct_Window_allWindows[Int_indexOfWindowToBeAsyncUpdated]);
    applyDisplayStatus(Arr_Struct_Window_allWindows[Int_indexOfWindowToBeAsyncUpdated]);
    applyPileIndex(Arr_Struct_Window_allWindows[Int_indexOfWindowToBeAsyncUpdated]);
    // if (!isWindowOverlappedByOthers(Arr_Struct_Window_allWindows[Int_indexOfWindowToBeAsyncUpdated])) {
    //     uncoverWindow(Arr_Struct_Window_allWindows[Int_indexOfWindowToBeAsyncUpdated]);
    // }//刚好合并进下面这个函数了
    updateCoverStateOfOverlappedWindow(Arr_Struct_Window_allWindows[Int_indexOfWindowToBeAsyncUpdated]);
    applyCoverStatus(Arr_Struct_Window_allWindows[Int_indexOfWindowToBeAsyncUpdated]);
    //内部更改结束
    //处理系统外部更改
    if (Arr_Struct_Window_allWindows[Int_indexOfWindowToBeAsyncUpdated].Bool_needToBeUpdated) {//(外部的更改)被标记更改的才更新
        applyDisplayStatus(Arr_Struct_Window_allWindows[Int_indexOfWindowToBeAsyncUpdated]);
        Arr_Struct_Window_allWindows[Int_indexOfWindowToBeAsyncUpdated].Bool_needToBeUpdated = false;
    }
}

function /*void*/ dragWindow(Struct_Window_targetWindow, event) {//2024.4.11 copied from function “dragObject” and customized for desktop QwQ
    // Bool_suspendAsyncUpdate = true;//debug config
    let DOMobj_SVGfilterEffect = document.getElementById("SVGfilterEffect-window").firstElementChild;

    synchronizeWindowRect(Struct_Window_targetWindow);
    let Int_moveOriginX = Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_left;
    let Int_moveOriginY = Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_top;
    let Int_cursorX = event.clientX;
    let Int_cursorY = event.clientY;

    let Int_lastTop = Int_moveOriginY;//24.8.18 update motionBlur
    let Int_lastLeft = Int_moveOriginX;
    Struct_Window_targetWindow.DOMobj_locator.style.filter = "url(#SVGfilterEffect-window)";

    Struct_Window_targetWindow.DOMobj_frame.style.transition = "none";//25.3.19 (窗口resize缓动更新) 窗口拖动时取消缓动(因为会与运动模糊的旋转操作冲突)

    let Int_stopBlurringTimeoutID = undefined;

    document.onpointermove = function (event) {
        let Int_left = Int_moveOriginX + event.clientX - Int_cursorX;
        let Int_top = Int_moveOriginY + event.clientY - Int_cursorY;
        Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_top = Int_top;
        Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_left = Int_left;
        if (isWindowInScreen(Struct_Window_targetWindow)) {//在窗口内才更新运动模糊
            Struct_Window_targetWindow.DOMobj_locator.style.left = ((Int_left + Int_lastLeft) / 2) + "px";
            Struct_Window_targetWindow.DOMobj_locator.style.top = ((Int_top + Int_lastTop) / 2) + "px";

            //Struct_Window_targetWindow.DOMobj_locator.style.filter = "url(#SVGfilterEffect-window)";
            updateWindowMotionBlur(Struct_Window_targetWindow, DOMobj_SVGfilterEffect, Int_lastLeft, Int_lastTop, Int_left, Int_top);

            if (Int_stopBlurringTimeoutID) clearTimeout(Int_stopBlurringTimeoutID);
            Int_stopBlurringTimeoutID = setTimeout(() => {
                updateWindowMotionBlur(Struct_Window_targetWindow, DOMobj_SVGfilterEffect, 0, 0, 0, 0);
                clearTimeout(Int_stopBlurringTimeoutID);
            }, 100);//0.1秒指针不动时取消运动模糊（因为拖动事件触发频率有限制，时间分辨率低，为了观感，这个运动模糊模块从设计初期就是基于空间的）
        }
        else {
            Struct_Window_targetWindow.DOMobj_locator.style.left = Int_left + "px";
            Struct_Window_targetWindow.DOMobj_locator.style.top = Int_top + "px";

            updateWindowMotionBlur(Struct_Window_targetWindow, DOMobj_SVGfilterEffect, 0, 0, 0, 0);
            Struct_Window_targetWindow.DOMobj_locator.style.transform = "";
            Struct_Window_targetWindow.DOMobj_rotateBase.style.transform = "";
            //Struct_Window_targetWindow.DOMobj_locator.style.filter = "";
        }

        Int_lastTop = Int_top;
        Int_lastLeft = Int_left;

        updateCoverStateOfOverlappedWindow(Struct_Window_targetWindow);//resize更新重写和提取了一些函数，顺便解决了拖动时不能及时更新覆盖状态的问题
    };
    document.onpointerup = function (event) {
        Bool_suspendAsyncUpdate = false;
        Struct_Window_targetWindow.DOMobj_locator.style.left = Int_lastLeft + "px";
        Struct_Window_targetWindow.DOMobj_locator.style.top = Int_lastTop + "px";
        updateWindowMotionBlur(Struct_Window_targetWindow, DOMobj_SVGfilterEffect, 0, 0, 0, 0);
        Struct_Window_targetWindow.DOMobj_locator.style.transform = "";
        Struct_Window_targetWindow.DOMobj_rotateBase.style.transform = "";//这里很重要，因为在拖动结束需要最大化时，frame的position fixed会与locator,rotateBase的transform冲突，导致无法定位到视口 2025.3.20 -PR

        Struct_Window_targetWindow.DOMobj_locator.style.filter = "";
        Struct_Window_targetWindow.DOMobj_frame.style.transition = "";//还原缓动属性

        synchronizeWindowRect(Struct_Window_targetWindow);//new

        /*save attribute copied from function "maximizeWindow" 2024.4.11 */
        //save restore attributes
        moveWindowToTheTopOfItsIndexGroup(Struct_Window_targetWindow);//adjust window cover status (added by YCH 2024.6.4)
        //why movewindowtothetopofitsindecxgrooup... is useless? bug report 2024.6.4
        document.onpointerup = null;
        document.onpointermove = null;
        if (typeof (Struct_Window_targetWindow.DOMobj_dragBox.releasePointerCapture) != "undefined") {
            Struct_Window_targetWindow.DOMobj_dragBox.releasePointerCapture(event.pointerId);
        };
        // updateAllOverlapStatusOfWindow(Struct_Window_targetWindow); //这里交给async的异步更新
    };
    document.ondragstart = function (event) { event.preventDefault(); };
    document.ondragend = function (event) { event.preventDefault(); };
}

// function /*void*/ dragObject(DOMobj_dragBox, DOMobj_moveTarget) {
//     let Int_moveOriginX = parseInt(DOMobj_moveTarget.style.left);
//     let Int_moveOriginY = parseInt(DOMobj_moveTarget.style.top);
//     let Int_cursorX = window.event.clientX;
//     let Int_cursorY = window.event.clientY;
//     document.onpointermove = function () {
//         let Int_left = Int_moveOriginX + window.event.clientX - Int_cursorX;
//         let Int_top = Int_moveOriginY + window.event.clientY - Int_cursorY;
//         DOMobj_moveTarget.style.left = Int_left + "px";
//         DOMobj_moveTarget.style.top = Int_top + "px";
//     };
//     document.onpointerup = function (event) {
//         document.onpointerup = null;
//         document.onpointermove = null;
//         if (typeof (DOMobj_dragBox.releasePointerCapture) != "undefined") {
//             DOMobj_dragBox.releasePointerCapture(event.pointerId);
//         };
//     };
//     document.ondragstart = function (event) { event.preventDefault(); };
//     document.ondragend = function (event) { event.preventDefault(); };
// }

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

    moveWindowToTheTopOfItsIndexGroup(Struct_Window_targetWindow);
    applyPileIndex(Struct_Window_targetWindow);
    synchronizeWindowRect(Struct_Window_targetWindow);//new
    /*bug fixed 2024.4.11 style.something is CHAR ARRAY!!! not integer so use parseInt() to translate (YCH realized this bug in a dream last night :D  */
    //save restore attributes

    DOMobj_targetWindow.style.height = innerHeight + "px";//clear attributes
    DOMobj_targetWindow.style.width = innerWidth + "px";
    DOMobj_targetWindow.style.top = -DOMobj_windowBase.offsetTop - Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_top + "px";
    DOMobj_targetWindow.style.left = -DOMobj_windowBase.offsetLeft - Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_left + "px";

    DOMobj_targetWindow.setAttribute("class", "maximizedWindow");
    //惨痛教训:DOM元素的class属性只读,必须用setAttr
    Struct_Window_targetWindow.Bool_isMaximized = true;
}

function /*void*/ restoreWindow(Struct_Window_targetWindow) {
    let DOMobj_targetWindow = Struct_Window_targetWindow.DOMobj_frame;

    //restore attributes
    applyWindowRect(Struct_Window_targetWindow);//new

    // DOMobj_targetWindow.style.position = "";
    DOMobj_targetWindow.style.top = "";
    DOMobj_targetWindow.style.left = "";
    // DOMobj_targetWindow.style.height = "";//clear attributes
    // DOMobj_targetWindow.style.width = "";
    DOMobj_targetWindow.setAttribute("class", "window");
    //惨痛教训:DOM元素的class属性只读,必须用setAttr
    Struct_Window_targetWindow.Bool_isMaximized = false;
}

function /*void*/ closeWindow(Struct_Window_targetWindow) {
    Struct_Window_targetWindow.Bool_isClosed = true;
    Struct_Window_targetWindow.Float_timeStamp = performance.now() + 1000;
    Struct_Window_targetWindow.DOMobj_frame.style["pointer-events"] = "none";
    Struct_Window_targetWindow.DOMobj_frame.style.transition = "filter .6s cubic-bezier(0.1, 1, 0.6, 1), opacity .5s cubic-bezier(0.1, 1, 0.6, 1)";
    Struct_Window_targetWindow.DOMobj_frame.style.filter = "blur(20px)";
    Struct_Window_targetWindow.DOMobj_frame.style.opacity = "0";
    for (let Int_i = Arr_Struct_Window_allWindows.length - 1; Int_i >= 0; Int_i--) {//adjust other windows' index
        if (Arr_Struct_Window_allWindows[Int_i].Int_indexOfPileIndex === Struct_Window_targetWindow.Int_indexOfPileIndex) {
            if (Arr_Struct_Window_allWindows[Int_i].Int_pileIndex >= Struct_Window_targetWindow.Int_pileIndex) {
                Arr_Struct_Window_allWindows[Int_i].Int_pileIndex--;//adjust the index
                if (Arr_Struct_Window_allWindows[Int_i].Int_pileIndex === 1) {
                    uncoverWindow(Arr_Struct_Window_allWindows[Int_i]);//uncover the new top window
                }
            }
        }
    }//pileIndex display unfinish -4.7 By Gevin //finished by ych 2024.4.14
}

function /*void*/ removeWindow(Struct_Window_targetWindow) {
    removeWindowFromGWOT(Struct_Window_targetWindow.Int_handle);
    Arr_Struct_Window_allWindows.splice(Arr_Struct_Window_allWindows.indexOf(Struct_Window_targetWindow), 1);//remove from array
    ROobj_windowBaseResizeObserver.unobserve(Struct_Window_targetWindow.DOMobj_frame);
    Struct_Window_targetWindow.DOMobj_locator.remove();//remove from DOM
    Struct_Window_targetWindow = null;//free the memory
}

function /*void*/ dragDesktop(DOMobj_dragBox, DOMobj_moveTarget, event) {//copied from function “dragObject” and customized for desktop QwQ
    Bool_suspendAsyncUpdate = true;
    let DOMobj_SVGfilterEffect_desktop = document.getElementById("SVGfilterEffect-windowBaseDragHandle").firstElementChild;
    let DOMobj_SVGfilterEffect_window = document.getElementById("SVGfilterEffect-window").firstElementChild;
    let Int_moveOriginX = DOMobj_moveTarget.offsetLeft;
    let Int_moveOriginY = DOMobj_moveTarget.offsetTop;
    let Int_cursorX = event.clientX;
    let Int_cursorY = event.clientY;

    let Int_lastTop = Int_moveOriginY;//24.8.17 update motionBlur
    let Int_lastLeft = Int_moveOriginX;

    let Int_len = Arr_Struct_Window_allWindows.length;//等会遍历窗口用

    for (let Int_i = 0; Int_i < Int_len; Int_i++) {
        //两次剔除需要分开,因为窗口极其大量的情况下,即使把下面的窗口全部不给模糊,也会卡,必须直接ban掉显示,并且上面模糊之后会透出下面不模糊的，导致撕裂和叠色
        //第一次更新剔除:被其它窗口完全盖住就不更新 这个只要剔除一次,因为拖动桌面的时候窗口不会动
        //这里用visibility比display更快 //我是sb 肯定display更快啊!24.10.4

        // applyDisplayStatus(Arr_Struct_Window_allWindows[Int_i]);//老的已删,这个操作已经被独立出来作为函数了 
        //2025.7.8这里已经进入异步更新了，上面那句暂时不用了

        Arr_Struct_Window_allWindows[Int_i].DOMobj_frame.style.transition = "none";//25.3.19 (窗口resize缓动更新) 窗口拖动时取消缓动(因为会与运动模糊的旋转操作冲突)
    }//有点离谱,1000窗口测试的时候拖动结束的时候会卡一下,貌似是因为要同时调整999个窗口,GPU吃不消,那么以后这个剔除得保持常驻了,估计为了提升计算效率还得打进GWOT里面,先这样吧 PR 2024.10.3

    let Int_stopBlurringTimeoutID = undefined;

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
            if (Arr_Struct_Window_allWindows[Int_i].Bool_isHidden) continue;//这里第一次剔除要拿出来,因为如果不可见就不要反复清空filter,transform等属性,减小开销
            if (isWindowInScreen(Arr_Struct_Window_allWindows[Int_i])) {//第二次更新剔除:在屏幕内才更新 这个要每次更新剔除一次
                Arr_Struct_Window_allWindows[Int_i].DOMobj_locator.style.visibility = "";
                Arr_Struct_Window_allWindows[Int_i].DOMobj_locator.style.filter = "url(#SVGfilterEffect-window)";
                updateWindowMotionBlur(Arr_Struct_Window_allWindows[Int_i], DOMobj_SVGfilterEffect_window, Int_lastLeft, Int_lastTop, Int_left, Int_top);//update all windows' blur effect
            }
            else {//这里会触发"提交"卡顿,具体原因不明,有待分析
                Arr_Struct_Window_allWindows[Int_i].DOMobj_locator.style.transform = "";
                Arr_Struct_Window_allWindows[Int_i].DOMobj_rotateBase.style.transform = "";
                Arr_Struct_Window_allWindows[Int_i].DOMobj_locator.style.visibility = "hidden";
                // Arr_Struct_Window_allWindows[Int_i].DOMobj_locator.style.filter = ""; //原因定位了,就在这里! 重新显示的时候css filter的url()函数因为DOM元素太多导致查找极其慢
            }

        }//这里因为把窗口位置放在两次移动点中间麻烦，就没写了，直接没有偏移窗口位置，看看观感再说吧 24.8.18YCH


        if (Int_stopBlurringTimeoutID) clearTimeout(Int_stopBlurringTimeoutID);
        Int_stopBlurringTimeoutID = setTimeout(() => {
            for (let Int_i = 0; Int_i < Int_len; Int_i++)
                updateWindowMotionBlur(Arr_Struct_Window_allWindows[Int_i], DOMobj_SVGfilterEffect_window, 0, 0, 0, 0);
            updateWindowBackgroundMotionBlur(DOMobj_SVGfilterEffect_desktop, 0, 0, 0, 0);
            clearTimeout(Int_stopBlurringTimeoutID);
        }, 100);//0.1秒指针不动时取消运动模糊（因为拖动事件触发频率有限制，时间分辨率低，为了观感，这个运动模糊模块从设计初期就是基于空间的）

        Int_lastTop = Int_top;
        Int_lastLeft = Int_left;
    };
    document.onpointerup = function (event) {
        Bool_suspendAsyncUpdate = false;//解除封印QwQ

        updateWindowBackgroundMotionBlur(DOMobj_SVGfilterEffect_desktop, 0, 0, 0, 0);//clear blur
        let Int_left = Int_moveOriginX + event.clientX - Int_cursorX;
        let Int_top = Int_moveOriginY + event.clientY - Int_cursorY;
        DOMobj_moveTarget.style.left = Int_left + "px";
        DOMobj_moveTarget.style.top = Int_top + "px";//2024.8.17 update: to add feature "motionBlur" update the position at the end of the drag  YCH
        updateWindowBackground(DOMobj_dragBox, Int_left, Int_top);//let grid align with the pixels(int -> float 强制类型转换)
        for (let Int_i = 0; Int_i < Int_len; Int_i++) {//clear
            if (!Arr_Struct_Window_allWindows[Int_i].Bool_isHidden) {
                updateWindowMotionBlur(Arr_Struct_Window_allWindows[Int_i], DOMobj_SVGfilterEffect_window, 0, 0, 0, 0);
                Arr_Struct_Window_allWindows[Int_i].DOMobj_locator.style.transform = "";
                Arr_Struct_Window_allWindows[Int_i].DOMobj_rotateBase.style.transform = "";//这里很重要，因为在拖动结束需要最大化时，frame的position fixed会与locator,rotateBase的transform冲突，导致无法定位到视口 2025.3.20 -PR
                Arr_Struct_Window_allWindows[Int_i].DOMobj_locator.style.left = Arr_Struct_Window_allWindows[Int_i].Struct_StdWindowRect_windowRect.Int_left + "px";
                Arr_Struct_Window_allWindows[Int_i].DOMobj_locator.style.top = Arr_Struct_Window_allWindows[Int_i].Struct_StdWindowRect_windowRect.Int_top + "px";
                Arr_Struct_Window_allWindows[Int_i].DOMobj_locator.style.filter = "";
                //Arr_Struct_Window_allWindows[Int_i].DOMobj_locator.style.display = "block";
            }
            Arr_Struct_Window_allWindows[Int_i].DOMobj_frame.style.transition = "";//还原缓动属性 这个到时候要加入属性
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
    for (let Int_i = Arr_Struct_Window_allWindows.length - 1; Int_i >= 0; Int_i--) {
        if ((Arr_Struct_Window_allWindows[Int_i]).Int_handle === Int_targetHandle) {
            Struct_Window_targetWindow = Arr_Struct_Window_allWindows[Int_i];
            break;
        }
    }
    return Struct_Window_targetWindow;
}//2024.4.8

// function /*void*/ swapWindowSequenceOfDOM(Struct_Window_window1, Struct_Window_window2) {
//     Struct_Window_window2.DOMobj_frame.nextSibling === Struct_Window_window1.DOMobj_frame
//         ? Struct_Window_window1.DOMobj_frame.parentNode.insertBefore(
//             Struct_Window_window2.DOMobj_frame,
//             Struct_Window_window1.DOMobj_frame.nextSibling)
//         : Struct_Window_window1.DOMobj_frame.parentNode.insertBefore(
//             Struct_Window_window2.DOMobj_frame,
//             Struct_Window_window1.DOMobj_frame);
// }//4.9 noon //THIS FUNCTION IS NOT USED AND WON'T BE USED(maybe ,20240414 ych)!!!

function /*void*/ moveWindowToTheTopOfItsIndexGroup(Struct_Window_targetWindow) {//move the window to the top(in its group: Struct_Window->Int_indexOfPileIndex),and set pileIndex(Struct_Window->Int_pileIndex) to the biggest
    //let Struct_Window_lastTopWindow = undefined; //新的实现不需要lasttop了，当时是要用nextsibling才要找它
    for (let Int_i = Arr_Struct_Window_allWindows.length - 1; Int_i >= 0; Int_i--) {
        //为什么这里改成倒序遍历函数会失效啊  //解决此大bug详见开发日志 2024.10.17 PR
        if (Arr_Struct_Window_allWindows[Int_i].Int_indexOfPileIndex === Struct_Window_targetWindow.Int_indexOfPileIndex) {//窗口组堆叠次序（还没写）
            // if (Arr_Struct_Window_allWindows[Int_i].Int_pileIndex === 1) {
            //bug fixed 2024.4.10 mistakingly spelled the "pileindex" as "indexOfPileIndex"
            // Struct_Window_lastTopWindow = Arr_Struct_Window_allWindows[Int_i];
            // }//find the last on-top window in the group
            if (/*Struct_Window_targetWindow.Int_pileIndex === 0 ||*/ Arr_Struct_Window_allWindows[Int_i].Int_pileIndex < Struct_Window_targetWindow.Int_pileIndex) {//to only adjust the index before the target (bug discovered and fixed on 2024.4.10)//initwindow dont have index(undefined) bug fixed on 2024.4.10
                //if (Arr_Struct_Window_allWindows[Int_i].Int_pileIndex !== 0) {//是0就代表这个窗口在初始化之中
                Arr_Struct_Window_allWindows[Int_i].Int_pileIndex++;//adjust the index
                //} //该特性（pileindex=0表示正在初始化的窗口）已取消
            }
            // if (isWindowOverlap(Arr_Struct_Window_allWindows[Int_i], Struct_Window_targetWindow)) {//if overlap then cover the beneath window //现在初始化的时候在执行此函数之前就执行了syncRect,所以不需要检测rect是不是undefined
            //     coverWindow(Arr_Struct_Window_allWindows[Int_i]);//resize更新后，这里已经提出为单独的函数“coverOverlappedWindow”
            // }//这里要把这个if提出来，因为现在的窗口实时更新机制导致有可能正在操作的窗口不会是pileindex=1(只要没重叠就不会主动更新自己的pileindex)所以比较pileindex大小的剔除会导致pileindex=1的窗口移到别的未覆盖窗口上面时不会把下面的窗口覆盖 2025.3.23 YCH
            //Arr_Struct_Window_allWindows[Int_i].DOMobj_closeButton.textContent = "i=" + String(Arr_Struct_Window_allWindows[Int_i].Int_pileIndex);//Debug Config
        }
    }
    // updateCoverStateOfOverlappedWindow(Struct_Window_targetWindow);//这句只判断是否重叠，然后就cover，以后要加入层级判断，并移入异步处理
    //移入了，顺便解决一个窗口初始化的bug

    Struct_Window_targetWindow.Int_pileIndex = 1;//set top index

    uncoverWindow(Struct_Window_targetWindow);

    // Struct_Window_targetWindow.DOMobj_closeButton.textContent = "i=" + Struct_Window_targetWindow.Int_pileIndex;//Debug Config


    // if (Struct_Window_lastTopWindow !== undefined && Struct_Window_lastTopWindow.DOMobj_frame.nextSibling !== undefined) {//adjust the DOM sequence
    //以前的老方法会导致DOM重新计算，尤其对iframe不友好，会导致iframe重载，而承载应用的又是iframe，所以改成z-index方法来实现，刚好以前写的接口很充足，逻辑也完善，可以很方便实现
    // Struct_Window_targetWindow.DOMobj_locator.parentNode.insertBefore(//老方法
    //     Struct_Window_targetWindow.DOMobj_locator,
    //     Struct_Window_lastTopWindow.DOMobj_locator.nextSibling);//2024.8.18 运动模糊更新后，在frame父级插了个locator，这里的frame也就换成了locator
    // }
    //新方法
    // let Int_len = Arr_Struct_Window_allWindows.length;
    // for (let Int_i = 0; Int_i < Int_len; Int_i++) {
    //     Arr_Struct_Window_allWindows[Int_i].DOMobj_locator.style.zIndex = String(1 + Int_len - Arr_Struct_Window_allWindows[Int_i].Int_pileIndex);//pileIndex越小，z-index越大，同时窗口的z-index必须大于0，小于等于0的范围为系统组件预留
    // }
    //这一坨移到异步状态更新里面去，以后这个函数只负责窗口结构体内pileIndex数值的更新

    //新bug:刚创建的窗口会直接Cover掉下面所有有重叠的窗口,无论是否完全遮挡 YCH2024.10.16
    /*Bug report from Gevin:
        函数 moveWindowTotheTopofItsIndexGroup 运行无误
        建议检查窗口的图形绘制器
    */
    //--YCH  bug fixed 2024 10.11 we don't need a "insertBefore" but a "insertAfter" so finally resolved by "insertBefore" at the "nextSibling" of the target (for more information, please read the develop log)
}//2024.4.11

function /*void*/ applyPileIndex(Struct_Window_targetWindow) {
    Struct_Window_targetWindow.DOMobj_locator.style.zIndex = String(1 + Arr_Struct_Window_allWindows.length - Struct_Window_targetWindow.Int_pileIndex);//pileIndex越小，z-index越大，同时窗口的z-index必须大于0，小于等于0的范围为系统组件预留
}

function /*void*/ updateCoverStateOfOverlappedWindow(Struct_Window_targetWindow) {
    uncoverWindow(Struct_Window_targetWindow);//架构改了，运行逻辑和顺序也变了，后面存疑的那段变成了这句，bug也不会有了
    for (let Int_i = Arr_Struct_Window_allWindows.length - 1; Int_i >= 0; Int_i--) {
        if (isWindowOverlap(Arr_Struct_Window_allWindows[Int_i], Struct_Window_targetWindow)) {
            coverWindow(Struct_Window_targetWindow.Int_pileIndex < Arr_Struct_Window_allWindows[Int_i].Int_pileIndex ?
                Arr_Struct_Window_allWindows[Int_i] :
                Struct_Window_targetWindow);
        }
        // else if (!isWindowOverlappedByOthers(Arr_Struct_Window_allWindows[Int_i])) {
        //     uncoverWindow(Arr_Struct_Window_allWindows[Int_i]);//这句存疑，估计会有bug，到时候再看
        // }
    }
}

function /*bool*/ isWindowOverlap(Struct_Window_window1, Struct_Window_window2) {//is there's a bug? 2024.6.4
    if (Struct_Window_window1.Bool_isClosed || Struct_Window_window2.Bool_isClosed) { return false; }//如果窗口在关闭动画中，则视作无遮挡
    return (Struct_Window_window1.Int_handle !== Struct_Window_window2.Int_handle) &&
        (queryWindowOverlapStatus(Struct_Window_window1, Struct_Window_window2) < 0);//以前每次查询都会计算一遍，现在已经有持续运行的异步更新了，所以改为查询GWOT 2025.3.22 PR
}//2024.4.15

function /*bool*/ isWindowInScreen(Struct_Window_window) {
    // let Int_screenLeft = parseInt(DOMobj_windowBase.style.left) + Struct_Window_window.Struct_StdWindowRect_windowRect.Int_left;
    let Int_screenLeft = DOMobj_windowBase.offsetLeft + Struct_Window_window.Struct_StdWindowRect_windowRect.Int_left;
    let Int_screenRight = Int_screenLeft + Struct_Window_window.Struct_StdWindowRect_windowRect.Int_width;
    // let Int_screenTop = parseInt(DOMobj_windowBase.style.top) + Struct_Window_window.Struct_StdWindowRect_windowRect.Int_top;
    let Int_screenTop = DOMobj_windowBase.offsetTop + Struct_Window_window.Struct_StdWindowRect_windowRect.Int_top;
    let Int_screenBottom = Int_screenTop + Struct_Window_window.Struct_StdWindowRect_windowRect.Int_height;
    return !((Int_screenRight < 0 || Int_screenLeft > innerWidth) || (Int_screenBottom < 0 || Int_screenTop > innerHeight));
}

function /*void*/ coverWindow(Struct_Window_targetWindow) {
    Struct_Window_targetWindow.Bool_isCovered = true;
    // Struct_Window_targetWindow.DOMobj_cover.style.visibility = "visible";//提升渲染性能
}

function /*void*/ uncoverWindow(Struct_Window_targetWindow) {//uncover the window
    Struct_Window_targetWindow.Bool_isCovered = false;
    // Struct_Window_targetWindow.DOMobj_cover.style.visibility = "hidden";//提升渲染性能
}

function /*void*/ applyCoverStatus(Struct_Window_targetWindow) {
    // Struct_Window_targetWindow.DOMobj_cover.style.visibility = Struct_Window_targetWindow.Bool_isCovered ? "inherit" : "hidden";//架构更改，这里变异步了，计算完成一次性更改，开销更小
    Struct_Window_targetWindow.DOMobj_cover.style.opacity = Struct_Window_targetWindow.Bool_isCovered ? "1" : "0";
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
    return Arr_Int_globalWindowOverlapTable[((Int_HandleL - 1) * (Int_HandleL - 2) >> 1) + Int_HandleS - 1];
}

function /*int*/ updateWindowOverlapStatus(Struct_Window_window1, Struct_Window_window2) {//计算,返回,并且更新到GWOT
    if (Struct_Window_window1.Int_handle === Struct_Window_window2.Int_handle) { return 0; }//防呆
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
    return (Arr_Int_globalWindowOverlapTable[((Int_handleL - 1) * (Int_handleL - 2) >> 1) + Int_handleS - 1]
        = calculateWindowOverlapStatus(Struct_Window_window1, Struct_Window_window2));
}

function /*int*/ calculateWindowOverlapStatus(Struct_Window_window1, Struct_Window_window2) {//仅计算,然后返回
    let Struct_StdWindowRect_rect1 = Struct_Window_window1.Struct_StdWindowRect_windowRect;
    let Struct_StdWindowRect_rect2 = Struct_Window_window2.Struct_StdWindowRect_windowRect;
    let Int_right1 = Struct_StdWindowRect_rect1.Int_left + Struct_StdWindowRect_rect1.Int_width;
    let Int_right2 = Struct_StdWindowRect_rect2.Int_left + Struct_StdWindowRect_rect2.Int_width;
    let Int_bottom1 = Struct_StdWindowRect_rect1.Int_top + Struct_StdWindowRect_rect1.Int_height;
    let Int_bottom2 = Struct_StdWindowRect_rect2.Int_top + Struct_StdWindowRect_rect2.Int_height;
    let Int_dx = Math.max(
        Struct_StdWindowRect_rect1.Int_left - Int_right2,
        Struct_StdWindowRect_rect2.Int_left - Int_right1);
    let Int_dy = Math.max(
        Struct_StdWindowRect_rect1.Int_top - Int_bottom2,
        Struct_StdWindowRect_rect2.Int_top - Int_bottom1);
    if (Int_dx > 0 && Int_dy > 0) { return Int_dx + Int_dy; }
    return Math.max(Int_dx, Int_dy) - 3;//这里减去3px，对应边框宽度，这样两个窗口间可以重叠最大一个窗口的距离
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
    Struct_Window_targetWindow.DOMobj_rotateBase.style.transform = "rotate(" + (-Float_theta) + "deg)";
    DOMobj_SVGfilterEffectContainer.setAttribute("stdDeviation", Float_distance / 2 + ",0");
}

function /*void*/ addWindowToGWOT(Int_targetHandle) {//请务必在把window添加到allWindows中之前先调用我，否则如果要添加的窗口刚好是最大handle则不会正确扩充表
    let Int_maxHandle = getMaxHandle();
    if (Int_targetHandle >= Int_maxHandle) {
        extendGWOT((Int_targetHandle * (Int_targetHandle - 1) >> 1) - (Int_maxHandle * (Int_maxHandle - 1) >> 1));
    }
}

function /*void*/ removeWindowFromGWOT(Int_targetHandle) {
    if (Int_targetHandle === getMaxHandle()) {
        shrinkGWOT(Int_targetHandle - 1);
    }
}

function /*void*/ extendGWOT(Int_n) {
    while (Int_n > 0) {
        Arr_Int_globalWindowOverlapTable.push(0);
        Int_n--;
    }
}

function /*void*/ shrinkGWOT(Int_n) {
    while (Int_n > 0) {
        Arr_Int_globalWindowOverlapTable.pop();
        Int_n--;
    }
}

function /*void*/ refreshGWOT(/*void*/) {
    for (let Int_i = Arr_Struct_Window_allWindows.length - 1; Int_i > 0; Int_i--) {
        for (let Int_j = Int_i - 1; Int_j >= 0; Int_j--) {
            updateWindowOverlapStatus(Arr_Struct_Window_allWindows[Int_i], Arr_Struct_Window_allWindows[Int_j]);
        }
    }
}

function /*void*/ asyncUpdateGWOT(/*void*/) {
    if (Bool_suspendAsyncUpdate || Arr_Struct_Window_allWindows.length <= 1) return;//至少2窗口才要操作
    Arr_Int_indexOfGWOTToBeAsyncUpdated[1]++;//按照最快的方式遍历所有双窗口组合
    if (Arr_Int_indexOfGWOTToBeAsyncUpdated[1] >= Arr_Struct_Window_allWindows.length) {//内循环一圈后外循环加一
        Arr_Int_indexOfGWOTToBeAsyncUpdated[0]++;
        if (Arr_Int_indexOfGWOTToBeAsyncUpdated[0] >= Arr_Struct_Window_allWindows.length - 1)
            Arr_Int_indexOfGWOTToBeAsyncUpdated[0] = 0;
        Arr_Int_indexOfGWOTToBeAsyncUpdated[1] = Arr_Int_indexOfGWOTToBeAsyncUpdated[0] + 1;
    }
    updateWindowOverlapStatus(
        Arr_Struct_Window_allWindows[Arr_Int_indexOfGWOTToBeAsyncUpdated[0]],
        Arr_Struct_Window_allWindows[Arr_Int_indexOfGWOTToBeAsyncUpdated[1]]);//计算,更新
}

// function /*void*/ updateAllOverlapStatusOfWindow(Struct_Window_targetWindow) {//应该可以被refreshGWOT替代了,效率更高,这个函数当时测试用的,有2倍的重复遍历
//     for (let Int_i = Arr_Struct_Window_allWindows.length - 1; Int_i >= 0; Int_i--) {
//         updateWindowOverlapStatus(Struct_Window_targetWindow, Arr_Struct_Window_allWindows[Int_i]);
//     }
// }

function /*int*/ getMaxHandle(/*void*/) {
    if (Arr_Struct_Window_allWindows.length === 0) { return 0; }
    let Int_maxHandle = 1;
    for (let Int_i = Arr_Struct_Window_allWindows.length - 1; Int_i >= 0; Int_i--) {
        Int_maxHandle = Arr_Struct_Window_allWindows[Int_i].Int_handle > Int_maxHandle ? Arr_Struct_Window_allWindows[Int_i].Int_handle : Int_maxHandle;//math.max速度低于三目运算符，下次把calculateOverlapStatus那里的也换掉
    }
    return Int_maxHandle;
}

function /*bool*/ isWindowFullCoveredByOthers(Struct_Window_targetWindow) {
    if (Arr_Struct_Window_allWindows.length === 0) { return false; }//防呆
    for (let Int_i = Arr_Struct_Window_allWindows.length - 1; Int_i >= 0; Int_i--) {
        if (Struct_Window_targetWindow.Int_handle !== (Arr_Struct_Window_allWindows[Int_i]).Int_handle) {
            if (isWindowCoveredByWindow(Struct_Window_targetWindow, Arr_Struct_Window_allWindows[Int_i])) { return true; }
        }
    }
    return false;
}

function /*bool*/ isWindowOverlappedByOthers(Struct_Window_targetWindow) {
    if (Arr_Struct_Window_allWindows.length === 0) { return false; }//防呆
    for (let Int_i = Arr_Struct_Window_allWindows.length - 1; Int_i >= 0; Int_i--) {
        if (Struct_Window_targetWindow.Int_handle !== (Arr_Struct_Window_allWindows[Int_i]).Int_handle) {
            if (isWindowOverlap(Struct_Window_targetWindow, Arr_Struct_Window_allWindows[Int_i])) { return true; }
        }
    }
    return false;
}

function /*bool*/ isWindowCoveredByWindow(Struct_Window_targetWindow, Struct_Window_coverWindow) {
    if (Struct_Window_coverWindow.Bool_isClosed) { return false; }//如果窗口在关闭动画中，则视作无遮挡
    if (queryWindowOverlapStatus(Struct_Window_targetWindow, Struct_Window_coverWindow) >= 0) { return false; }//没重叠,不通过 //进一步提高判断效率
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

function /*void*/ synchronizeWindowRect(Struct_Window_targetWindow) {//从DOM读取(同步)位置坐标,存入window   Rect
    Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_top = Struct_Window_targetWindow.DOMobj_locator.offsetTop;
    Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_left = Struct_Window_targetWindow.DOMobj_locator.offsetLeft;
    Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_width = Struct_Window_targetWindow.DOMobj_frame.clientWidth;
    Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_height = Struct_Window_targetWindow.DOMobj_frame.clientHeight;//修最大化再还原窗口时窗口变大的bug(原因是offset宽高计算带边框，每一次同步再应用时都会累加) 2025.3.20 -PR
}

function /*void*/ applyWindowRect(Struct_Window_targetWindow) {//把windowRect存有的坐标应用到DOM
    Struct_Window_targetWindow.DOMobj_frame.style.height = Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_height + "px";
    Struct_Window_targetWindow.DOMobj_frame.style.width = Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_width + "px";
    Struct_Window_targetWindow.DOMobj_locator.style.left = Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_left + "px";
    Struct_Window_targetWindow.DOMobj_locator.style.top = Struct_Window_targetWindow.Struct_StdWindowRect_windowRect.Int_top + "px";
}

function /*void*/ synchornizeDisplayStatus(Struct_Window_targetWindow) {
    Struct_Window_targetWindow.Bool_isHidden = Struct_Window_targetWindow.DOMobj_locator.style.display === "none";
    // Struct_Window_targetWindow.Bool_isHidden = Struct_Window_targetWindow.DOMobj_locator.style.visibility === "hidden";
}

function /*void*/ applyDisplayStatus(Struct_Window_targetWindow) {
    if ((Struct_Window_targetWindow.Bool_isHidden) !== (Struct_Window_targetWindow.DOMobj_locator.style.display === "none")) {
        Struct_Window_targetWindow.Bool_hasRecentlyChangedHiddenState = true;
        Struct_Window_targetWindow.DOMobj_locator.style.display = Struct_Window_targetWindow.Bool_isHidden ? "none" : "block";
    }
    // Struct_Window_targetWindow.DOMobj_locator.style.visibility = Struct_Window_targetWindow.Bool_isHidden ? "hidden" : "visible";
}

function /*void*/ applyWindowTitle(Struct_Window_targetWindow) {
    Struct_Window_targetWindow.DOMobj_title.textContent = Struct_Window_targetWindow.Str_title;
}

//Debug Configs
var i = initWindow;
var a = getWindowByHandle;
var m = moveWindowToTheTopOfItsIndexGroup;
var r = function (r) { m(a(r)); };
// for(let p=0;p<10000;p++){i(Math.floor(Math.random()*10000),Math.floor(Math.random()*10000),Math.floor(Math.random()*500),Math.floor(Math.random()*500),Math.random().toString(36).substring(2, 15))}