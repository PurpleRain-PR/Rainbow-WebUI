"use strict";

function newWindowButton() {
  // 获取DOM元素
  const windowBase = document.getElementsByClassName("windowBase")[0];

  // 创建按钮元素
  const button = document.createElement("button");

  // 给按钮添加属性
  button.classList.add("newWindowButton");
  button.name = "button";
  button.textContent = "创建窗口";
  // 使用textContent代替innerHTML，textContent在设置纯文本内容时更为安全且性能更好


  // 追加按钮至windowBase的子节点
  windowBase.insertBefore(button, windowBase.firstChild || null);
  // 使用firstChild代替children[0]，因为firstChild的访问速度更快

  // 给按钮增加侦听事件并回调initWindow函数创建窗口
  button.addEventListener("click", function () { initWindow(0, 0, 0, 0, Math.random().toString(36).substring(2, 15)); });
}

// 调用函数
//newWindowButton();
// 杂鱼HZ,不准流程外调用 YCH

/* console.time('qs');
for (let i = 0; i <= 1000000;i++){
    document.querySelector('button');
}
console.timeEnd('qs');
// qs：71 毫秒 - 倒计时结束

console.time('gt');
for (let i = 0; i <= 1000000; i++) {
    document.getElementsByTagName('button');
}
console.timeEnd('gt');
// gt：2 毫秒 - 倒计时结束
所以还是getElements快 */
