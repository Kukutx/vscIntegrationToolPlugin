// @ts-nocheck
const vscode = require('vscode');
var cp = require('child_process');
const fs = require('fs');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	//插件控制台
	console.log('IntegrationTool 已启动');

	//创建文件夹
	let fsPath = process.env["APPDATA"] + '//IntegrationTool';
	fs.access(fsPath, (err) => {
		(err ? fs.mkdir(fsPath, (error) => {
			if (error) {
				console.log(error);
				return false;
			}
			console.log('创建目录成功');
		}) : console.log('文件以存在'));
	});

	//是否打开网址
	if (vscode.workspace.getConfiguration("IntegrationToolPlugin").get("Promptbox")) {
		vscode.window.showInformationMessage('是否要打开官网？', '是', '否', '不再提示').then(result => {
			if (result === '是') {
				cp.exec('start http://kahxnsat.com/');
			} else if (result === '不再提示') {
				vscode.workspace.getConfiguration().update("IntegrationToolPlugin.Promptbox", false, true);
				vscode.window.showInformationMessage('我呸！');
			} else {
				vscode.window.showInformationMessage("草泥马的");
			}
		});
	}
	
	// 引入插件
	require('./src/TreeViewProvider')(context);     //树视图  （写个判断先加载树结构然后再加载其他组件）
	require('./src/Getlocalinfo')(context);         //获取本地设备信息
	require('./src/funcGroup')(context);            //功能组
	require('./src/setstatusBar')(context);         //状态栏
	require('./src/attack')(context);               //attack
	require('./src/cheerio')(context);              //cheerioz
	require('./src/crypt')(context);                //加密解密
	require('./src/port')(context);                 //killport
	require('./src/webview')(context);              //webview 
	require('./src/funcParser')(context);           //注释解析器
	require('./src/DecorationUrl')(context);        //装饰URL
	require('./src/getIPInfo')(context);            //获取IP信息

	// 加载插件的进度条
	// const req=[
	// 		require('./src/cheerio')(context),     //cheerio
	// 		require('./src/Getlocalinformation')(context), //Getlocalinformation 获取本地ip
	// 		require('./src/webview')(context),     //webview 
	// 		require('./src/attack')(context),     //attack
	// 		require('./src/functionalGroup')(context),     //功能组
	// 		require('./src/snippets')(context),     //注释
	// 		require('./src/setstatusBar')(context),     //状态栏
	// 		require('./src/DecorationNumber')(context),     //装饰数字6
	// 		require('./src/TreeViewProvider')(context),     //树视图
	// 		require('./src/crypt')(context)     //加密解密
	// ]
	// vscode.window.withProgress({
	// 		// location: vscode.ProgressLocation.Window,z
	// 		location: vscode.ProgressLocation.Notification,
	// 		title: '工具集',
	// 		cancellable: true,            //取消键
	// 	},
	// 	(progress, token) => {
	// 		token.onCancellationRequested(() => {
	// 			console.log('用户取消了长时间运行的操作');
	// 		});
	// 		var num = 0;
	// 		var i=0;
	// 		progress.report({ increment: 0, message: `${num}%` });
	// 		setInterval(() => {
	// 			num += 20;
	// 			req[i++];
	// 			progress.report({ increment: 20, message: `${num}%` });	
	// 		}, 1000);
	// 		var p = new Promise(resolve => {
	// 			setTimeout(() => {
	// 				resolve();
	// 			}, 6000);
	// 		});
	// 		return p;
	// });
}
function deactivate() { console.log('插件关闭')}
module.exports = {
	activate,
	deactivate
}