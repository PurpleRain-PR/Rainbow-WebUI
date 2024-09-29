//It seems empty yet --YCH
//now it is not empty! --YCH 2024.9.28
"use strict";

function /*int*/ systemMain() {
    document.body.onload = null;
    initDesktop();

    newWindowButton();//debug

    //while (true) {
    //离谱,死循环会卡死解释器,得用setinterval
    let Int_mainProcessIntervalID = setInterval(function () {
        //各种操作
        console.log(true);
        if (/*以后塞异常终止条件,换掉false*/false) clearInterval(Int_mainProcessIntervalID);
    }, 1);
    //这里以后是异常处理+上报到c端
    return 0;
}