function/* void */ newWindowButton(/* void */) {
    // 获取DOM元素
    const windowBase = document.getElementsByClassName('windowBase')[0];
    // 创建按钮元素
    const button = document.createElement('button');

    // 给按钮添加属性
    button.classList.add('newWindowButton');
    button.name = 'button';
    button.innerHTML = '创建窗口';

    // 追加按钮至windowBase的子节点
    windowBase.insertBefore(button, windowBase.children[0]);

    // 给按钮增加侦听事件并回调initWindow函数创建窗口
    button.addEventListener('click', () => initWindow());
} newWindowButton();

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