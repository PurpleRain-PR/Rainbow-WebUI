"use strict";

var Bool_isMouseLPressed = false;
var Bool_isMouseMPressed = false;
var Bool_isMouseRPressed = false;

function /*void*/ initGlobalFlags(/*void*/) {
    document.addEventListener("mousedown", function (event) {
        if (event.button === 0) {
            Bool_isMouseLPressed = true;
        } else if (event.button === 1) {
            Bool_isMouseMPressed = true;
        } else if (event.button === 2) {
            Bool_isMouseRPressed = true;
            event.preventDefault();
        }
    });
    document.addEventListener("mouseup", function (event) {
        //event.preventDefault();
        if (event.button === 0) {
            Bool_isMouseLPressed = false;
        } else if (event.button === 1) {
            Bool_isMouseMPressed = false;
        } else if (event.button === 2) {
            Bool_isMouseRPressed = false;
            event.preventDefault();
        }
    });
}