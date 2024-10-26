"use strict";
//It seems empty yet --YCH
//now it is not empty! --YCH 2024.9.28

function /*int*/ systemMain() {
    document.body.onload = null;
    suspendScreen();
    initDesktop();

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
    asyncUpdateGWOP();
    //if (/*以后塞异常终止条件,换掉false*/false) clearInterval(Int_mainProcessIntervalID);
}

var Int_maxSysIntervalNum = 200;
var Int_maxSysIntervalCreateStep = 20;
var Int_sysIntervalControlInterval = 500;

var Arr_Int_sysMainIntervalID = new Array();
var Bool_hasStoppedSysInterval = false;
var Int_newSysIntervalCreateStep = Int_maxSysIntervalCreateStep;
var Int_sysIntervalExecuteCount = 0;
var Int_fullSysIntervalNum = Int_maxSysIntervalNum;

function /*void*/ systemMainIntervalControl() {
    Int_fullSysIntervalNum = 4 * (Int_sysIntervalExecuteCount / Int_sysIntervalControlInterval | 0) + 1;//整除 //饱和执行数
    DOMobj_windowBase.firstChild.textContent = String(Int_fullSysIntervalNum) + "," + String(Int_sysIntervalExecuteCount) + "," + String(Arr_Int_sysMainIntervalID.length);
    while (Arr_Int_sysMainIntervalID.length > Int_fullSysIntervalNum) {
        clearInterval(Arr_Int_sysMainIntervalID[Arr_Int_sysMainIntervalID.length - 1]);
        Arr_Int_sysMainIntervalID.pop();
    }
    Int_sysIntervalExecuteCount = 0;//清零计数器
    if (Arr_Int_sysMainIntervalID.length < Int_maxSysIntervalNum) {
        for (let Int_i = Int_newSysIntervalCreateStep; Int_i > 0; Int_i--)
            Arr_Int_sysMainIntervalID.push(setInterval(systemMainInterval, 1));
        Int_newSysIntervalCreateStep =
            Int_newSysIntervalCreateStep > Int_maxSysIntervalCreateStep ?
                Int_newSysIntervalCreateStep + 1 : Int_maxSysIntervalCreateStep;//限位！！！
    }
    else {
        Int_newSysIntervalCreateStep = 1;
    }

}