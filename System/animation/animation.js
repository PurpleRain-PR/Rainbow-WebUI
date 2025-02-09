"use strict";

function /*float*/ bezierCurveMapping(Float_x, Float_x1, Float_y1, Float_x2, Float_y2) {//此函数是个计算函数,里面所有变量全为float
    let c = 3 * Float_x1;
    let b = 3 * Float_x2 - 2 * c;
    let a = 1 - c - b;
    let q = 1 / 3;
    let p = b / a * q;
    let k = -p * p;
    let l = (k + c / 2) * p + Float_x / 2;
    let m = k + Float_x1;
    let r = m * m * m;
    let s = l * l;
    let t = Math.pow(l + Math.sqrt(r + s), q) + Math.pow(l - Math.sqrt(r + s), q) - p;
    let e = 3 * Float_y1;
    let f = 3 * Float_y2 - 2 * e;
    let g = 1 - f - e;
    return t * (g * r + f * t + e);//under construcion
}