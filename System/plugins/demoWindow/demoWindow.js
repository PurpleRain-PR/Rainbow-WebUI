function demoWindow() {
    let window = initWindow(0, 0, 700, 700, "RainbowUI Demo Window", "./System/window/testlogo.svg");
    window.DOMobj_container.style["overflow-y"] = "auto";
    fetch("./System/plugins/demoWindow/demoWindow.html")
    .then(function(response) {
        return response.text();
    })
    .then(function(html) {
        //window.DOMobj_container.innerHTML += html;
    });
    html = `
        <div>
            <h1>RainbowUI Demo Window2</h1>
        </div>
    `;
    window.DOMobj_container.innerHTML = html;
}

demoWindow();