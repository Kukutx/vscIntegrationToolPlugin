const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

/**
 * 执行回调函数
 * @param {*} panel 
 * @param {*} message 
 * @param {*} resp 
 */
//调用回调
function invokeCallback(panel, message, resp) {
	console.log('回调消息：', resp);
	// 错误码在400-600之间的，默认弹出错误提示
	if (typeof resp == 'object' && resp.code && resp.code >= 400 && resp.code < 600) {
		vscode.window.showErrorMessage(resp.message || '发生未知错误！');
	}
	panel.webview.postMessage({ cmd: 'vscodeCallback', cbid: message.cbid, data: resp });
}

/**
 * 存放所有消息回调函数，根据 message.cmd 来决定调用哪个方法
 */
//消息处理程序
const messageHandler = {
	getConfig(global, message) {
		const result = vscode.workspace.getConfiguration().get(message.key);
		invokeCallback(global.panel, message, result);
	},

	setConfig(global, message) {
		// 写入配置文件，注意，默认写入工作区配置，而不是用户配置，最后一个true表示写入全局用户配置
		vscode.workspace.getConfiguration().update(message.key, message.value, true);
		// vscode.window.showInformationMessage('修改配置成功！');

		if (vscode.workspace.getConfiguration("IntegrationToolPlugin").get("ShowTip")) {
			vscode.window.showInformationMessage('修改配置成功！');
		}
	}
};


/************************************************************************************************************************
 *获取页面函数：                                                                                                           
 *getWebviewContent()                                      直接返回页面内容                                               
 *getWebViewContent(context, templatePath)                 (context,相对路径)
 ************************************************************************************************************************/
//Webview1
function getWebviewContent() {
	return `
    <!DOCTYPE html>
    <html>
    <head>
    	<meta charset="UTF-8">
    	<title>JS实现效果-点击按钮返回到页面顶部</title>
    	<style>
    		#container{margin:0;padding:0;}
    		#box1,#box2,#box3,#box4{width:100%;height:500px;}
    		#box1{background: deepskyblue;}
    		#box2{background: yellowgreen;}
    		#box3{background: darkred;}
    		#box4{background: blueviolet;}
    		#icon{width:50px;height:50px;font-size: 20px;background: #CDCC7D;line-height: 50px;text-align: center;position: fixed;bottom:20px;right:20px;color:#666;font-weight: bolder;}
    	</style>
    </head>
    <body>
    	<div id="container">
    		<div id="box1"></div>
    		<div id="box2"></div>
    		<div id="box3"></div>
    		<div id="box4"></div>   
    		<div id="icon">↑</div>
    	</div>
    </body>
    <script type="text/javascript">
    	window.onload = function(){
    		var btn = document.getElementById("icon");
    		var timer = null;
    		var oScroll = true;
    		//滚动条事件,触发时清空定时器
    		window.onscroll = function(){
    			if(!oScroll){
    				clearInterval(timer);
    			}
    			oScroll = false;
    		}
    		btn.onclick = function(){
    			//加入定时器让他又快到慢滚动到顶部
    			timer = setInterval(function(){
    				//获取当前scrollTop的高度位置（兼容ie和chrom浏览器）
    				var oTop = document.documentElement.scrollTop || document.body.scrollTop;
    				//设置速度由快到慢
    				var ispeed = Math.floor(-oTop / 7);
    				document.documentElement.scrollTop = document.body.scrollTop = oTop + ispeed;
    				oScroll = true;
    				if(oTop == 0){
    					clearInterval(timer);
    				}
    			},30);
    		}
    	}
    </script>
    </html>`;
}
//webview2
function getWebViewContent(context, templatePath) {
	const resourcePath = path.join(context.extensionPath, templatePath);
	console.log(resourcePath);
	let html = fs.readFileSync(resourcePath, 'utf-8');
	// // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换//如果想要切换网络连接需要去掉以下功能
	const dirPath = path.dirname(resourcePath);
	html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
		return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
	});
	return html;
}

module.exports = (context) => {

	context.subscriptions.push(vscode.commands.registerCommand('IntegrationTool.webview.hello', () => {
		const panel = vscode.window.createWebviewPanel(
			'webview',  //webview内部识别
			'未定义欢迎页',  //显示页面名
			vscode.ViewColumn.One,    //现在在编辑器那个部位
			{// Webview选项
				enableScripts: true, // 启用JS，默认禁用
				retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
			}
		);
		let global = { panel };
		// 设置HTML内容
		// panel.webview.html=getWebviewContent();	
		panel.webview.html = getWebViewContent(context, "./src/source/webview.html");

		// 监听
		panel.webview.onDidReceiveMessage(message => {
			//更新数据
			if (messageHandler[message.cmd]) {
				console.log(message.cmd);
				messageHandler[message.cmd](global, message);
			} else {
				vscode.window.showErrorMessage(`未找到名为 ${message.cmd} 回调方法!`);
			}
		}, undefined, context.subscriptions);
	}));
	// 如果设置里面开启了欢迎页显示，启动欢迎页
	if (vscode.workspace.getConfiguration("IntegrationToolPlugin").get("ShowTip")) {
		vscode.commands.executeCommand('IntegrationTool.webview.hello');  //执行命令
	}
}




