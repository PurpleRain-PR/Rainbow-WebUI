function /*void*/ loadPlugin(String_status){//输入即为pluginList中的三个分类，启动时运行，进入主界面运行和只加载暂不运行
    fetch("./System/plugins/pluginList.json")
    .then(function(response) {
        return response.json();
    })
    .then(function(JSON_pluginList) {
        JSON_pluginList[String_status].forEach(String_pluginName => {
            let DOMobj_plugin = document.createElement("script");
            DOMobj_plugin.src = "./System/plugins/" + String_pluginName + "/" + String_pluginName + ".js";
            document.body.appendChild(DOMobj_plugin);
        });
    });
}