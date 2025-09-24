"use strict";
//It seems empty yet --YCH
//now it is not empty! --YCH 2024.9.28

function /*int*/ systemMain() {
    document.body.onload = null;
    suspendScreen();
    initDesktop();
    initWindowResizeSynchronizer();
    initGlobalFlags();

    newWindowButton();//debug

    //while (true) {
    //离谱,死循环会卡死解释器,得用setinterval
    let Int_mainProcessControlIntervalID = setInterval(systemMainIntervalControl, Int_sysIntervalControlInterval);
    //let Int_mainProcessIntervalID = setInterval(systemMainInterval, 1);
    //这里以后是异常处理+上报到c端
    return 0;
}

function /*void*/ systemMainInterval() {
    Int_sysIntervalExecuteCount++;
    //各种操作
    // Bool_suspendAsyncUpdate = false;//debug config
    asyncUpdateAllWindow();
    asyncUpdateGWOT();
    //if (/*以后塞异常终止条件,换掉false*/false) clearInterval(Int_mainProcessIntervalID);
}


var Arr_Int_sysMainIntervalID = new Array();
var Bool_hasStoppedSysInterval = false;
var Int_newSysIntervalCreateStep = Int_minSysIntervalCreateStep;
var Int_sysIntervalExecuteCount = 0;
var Int_fullSysIntervalNum = undefined;
var Float_estiatedNow = 0;

function /*void*/ systemMainIntervalControl() {
    Float_estiatedNow = performance.now();
    Int_fullSysIntervalNum = (4.2 * Int_sysIntervalExecuteCount / Int_sysIntervalControlInterval | 0) + 2;//整除 //饱和执行数,乘以5是因为interval不是1ms执行一次,+2是防止极端情况前面商为0导致自锁
    //↑这个前面的系数(现在是4.2),应该是可以测出来的,也就是interval设置为1ms时实际间隔的毫秒数,但是要测算(否则会导致不饱和或者过饱和),以后写,现在先这样吧
    let Int_targetSysIntervalNum = ((Int_fullSysIntervalNum * 3 + Int_maxSysIntervalNum) >> 2);
    DOMobj_windowBase.firstChild.textContent =
        "Debug Config:  cStep " + String(Int_newSysIntervalCreateStep) + ",full "
        + String(Int_fullSysIntervalNum) + ",count "
        + String(Int_sysIntervalExecuteCount) + ",length "
        + String(Arr_Int_sysMainIntervalID.length) + ",target "
        + String(Int_targetSysIntervalNum);
    while (Arr_Int_sysMainIntervalID.length > Int_fullSysIntervalNum) {
        clearInterval(Arr_Int_sysMainIntervalID[Arr_Int_sysMainIntervalID.length - 1]);
        Arr_Int_sysMainIntervalID.pop();
        Bool_hasStoppedSysInterval = true;
    }
    Int_sysIntervalExecuteCount = 0;//清零计数器
    if (Arr_Int_sysMainIntervalID.length < Int_targetSysIntervalNum) {//上调
        if (Int_newSysIntervalCreateStep < Int_maxSysIntervalCreateStep)//步数自增(只有上调的时候才要自增,所以放里面) //如果放里面,则限位一定在它后面,在stopsysinterval设为false前面,所以只能放外面 //又可以放里面了,把stop设为false那句放外面,因为每轮循环都要重置状态 YCH 24.10.26
            Int_newSysIntervalCreateStep += 2;//用++有几率自锁，毕竟激进一点也不是什么坏事(
        for (let Int_i = Int_newSysIntervalCreateStep; Int_i > 0; Int_i--)
            Arr_Int_sysMainIntervalID.push(setInterval(systemMainInterval, 1));
    }
    if (Bool_hasStoppedSysInterval)//步数限位(无论要不要上调都要限位,所以放外面)
        Int_newSysIntervalCreateStep = Int_minSysIntervalCreateStep;
    Bool_hasStoppedSysInterval = false;
}