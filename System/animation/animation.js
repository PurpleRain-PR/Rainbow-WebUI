"use strict";

// function /*float*/ bezierCurveMapping(Float_x, Float_x1, Float_y1, Float_x2, Float_y2) {//此函数是个计算函数,里面所有变量全为float
//     let c = 3 * Float_x1;
//     let b = 3 * Float_x2 - 2 * c;
//     let a = 1 - c - b;
//     let q = 1 / 3;
//     let p = b / a * q;
//     let k = -p * p;
//     let l = (k + c / 2) * p + Float_x / 2;
//     let m = k + Float_x1;
//     let r = m * m * m;
//     let s = l * l;
//     let t = Math.pow(l + Math.sqrt(r + s), q) + Math.pow(l - Math.sqrt(r + s), q) - p;
//     let e = 3 * Float_y1;
//     let f = 3 * Float_y2 - 2 * e;
//     let g = 1 - f - e;
//     return t * (g * r + f * t + e);//under construcion
// }


function /*float*/ regulateFloatPrecision(Float_x, Int_precisionExp10) {
    return Math.round(Float_x * Int_precisionExp10) / Int_precisionExp10;//按照给定的精度四舍五入后续小数位，注意precisionExp10为10的n次幂
}

function /*float[3]*/ solveCubicEquation(Float_a, Float_b, Float_c, Float_d) {//ax3+bx2+cx+d=0 基于三角函数的过程无复数的数值解法来自https://kexue.fm/archives/831
    if (Float_a === 0) {
        let Arr_Float_ans = solveSquareEquation(Float_b, Float_c, Float_d);//二次方程或一次方程，但是要保持返回格式不变
        Arr_Float_ans.push(undefined);
        return Arr_Float_ans;
    }
    let Float_k = Float_b / (3 * Float_a * Float_a);
    let Float_m = Float_c / Float_a - Float_b * Float_k;
    let Float_n = Float_c * Float_k - (Float_d + 2 / 9 * Float_b * Float_b * Float_k) / Float_a;
    let Float_o = Math.sqrt(Math.abs(3 / Float_m));
    let Float_m1 = regulateFloatPrecision(Float_m, 1e11);//扔掉勾史IEEE754的精度误差，但这个只用于做判据，不参与计算，因为参与计算后面精度误差会累积
    if (Float_m1 === 0) {
        return [
            regulateFloatPrecision(Math.cbrt(Float_n) - Float_b / (Float_a * 3), 1e9),
            undefined,
            undefined
        ];
    }
    let Float_p = Float_n * Float_o * Float_o * Float_o;
    let Float_p1 = regulateFloatPrecision(Float_p, 1e11);//同上
    if (Float_m1 > 0) {
        let Float_q = Math.cbrt(Math.tan(Math.atan(2 / Float_p) / 2));
        let Float_r = 1 / Float_q - Float_q;
        return [
            regulateFloatPrecision(Math.sqrt(Math.abs(Float_m / 3)) * Float_r - Float_b / (Float_a * 3), 1e9),
            undefined,
            undefined
        ];
    }
    //m<0时
    let Float_s = Float_b / (Float_a * 3);
    if (Float_p1 > -2 && Float_p1 < 2) {//更为常见，放前面
        let Float_q = Math.acos(Float_p / 2);
        let Float_r = 2 * Math.sqrt(Math.abs(Float_m / 3));
        return [
            regulateFloatPrecision(Float_r * Math.cos(Float_q / 3) - Float_s, 1e9),
            regulateFloatPrecision(Float_r * Math.cos((Float_q + 2 * Math.PI) / 3) - Float_s, 1e9),
            regulateFloatPrecision(Float_r * Math.cos((Float_q + 4 * Math.PI) / 3) - Float_s, 1e9)
        ];
    }
    if (Float_p1 < -2 || Float_p1 > 2) {
        let Float_q = Math.cbrt(Math.tan(Math.asin(2 / Float_p) / 2));
        let Float_r = 1 / Float_q + Float_q;
        return [
            regulateFloatPrecision(Math.sqrt(Math.abs(Float_m / 3)) * Float_r - Float_s, 1e9),
            undefined,
            undefined
        ];
    }
    //|p|=2时
    let Float_r = Float_p * Math.sqrt(Math.abs(Float_m / 3));
    return [
        regulateFloatPrecision(Float_r - Float_s, 1e9),
        regulateFloatPrecision(-Float_r / 2 - Float_s, 1e9),
        undefined
    ];//p=正负2，和|p|>2时公式一致，但直接特判更快(此时为唯一2解情况),解出cos(那堆东西)等于(-1和2)或(-2和1),根据p符号而定
}

function /*float[2]*/ solveSquareEquation(Float_a, Float_b, Float_c) {//ax2+bx+c=0
    if (Float_a === 0) {
        return [regulateFloatPrecision(-Float_c / Float_b, 1e9), undefined];
    }
    let Float_d = Float_b * Float_b - 4 * Float_a * Float_c;
    let Float_d1 = regulateFloatPrecision(Float_d, 1e11);
    if (Float_d1 < 0) {
        return [undefined, undefined];
    }
    if (Float_d1 === 0) {

        return [regulateFloatPrecision(-Float_b / (2 * Float_a), 1e9), undefined];
    }
    return [
        regulateFloatPrecision((-Float_b + Math.sqrt(Float_d)) / (2 * Float_a), 1e9),
        regulateFloatPrecision((-Float_b - Math.sqrt(Float_d)) / (2 * Float_a), 1e9)
    ];
}