const vscode = require('vscode');
const https = require('https');
const os = require('os');
const { InTPanel, MultiStepInput } = require('./util');
module.exports = (context) => {
	context.subscriptions.push(vscode.commands.registerCommand('IntegrationTool.getIPInfo', () => {
		var getIPinfo = new GetIPInfo();
		getIPinfo.funcIPInput();

	}))
}
class GetIPInfo {
	constructor() {
		this.GetIPInfoLog = InTPanel;
		this.result = vscode.workspace.getConfiguration("IntegrationToolPlugin").get("getIPInfo");
		vscode.workspace.onDidChangeConfiguration((e) => {
			if (e.affectsConfiguration("IntegrationToolPlugin.getIPInfo")) {
				this.result = null;
				this.result = vscode.workspace.getConfiguration("IntegrationToolPlugin").get("getIPInfo");
				vscode.window.showInformationMessage("修改成功");
			}
		});
	}

	async funcIPInput() {
		const title = '获取IP信息';
		//执行输入
		async function collectInputs() {
			const state = {};
			await MultiStepInput.run((input) => inputName(input, state));
			return state;
		}
		//输入端口
		async function inputName(input, state) {
			const additionalSteps = typeof state.resourceGroup === 'string' ? 1 : 0;
			// TODO: Remember current value when navigating back.
			state.name = await input.showInputBox({
				title,
				step: 1 + additionalSteps,
				totalSteps: 2 + additionalSteps,
				value: state.name || '',
				placeholder: '列如：127.0.0.1',
				prompt: '请输入IP地址',
				validate: validateNameIsUnique,
				shouldResume: shouldResume
			});
			return (input) => pickRuntime(input, state);
		}
		//选择运行时
		async function pickRuntime(input, state) {
			const additionalSteps = typeof state.resourceGroup === 'string' ? 1 : 0;
			const runtimes = await getAvailableRuntimes(state.resourceGroup, undefined /* TODO: token */);
			// TODO: 向后导航时记住当前活动的项目.
			state.runtime = await input.showQuickPick({
				title,
				step: 2 + additionalSteps,
				totalSteps: 2 + additionalSteps,
				placeholder: '请选择一个运行',
				items: runtimes,
				activeItem: state.runtime,
				shouldResume: shouldResume
			});
		}
		function shouldResume() {
			// 可以显示带有恢复选项的通知。
			return new Promise((resolve, reject) => {
				// noop
			});
		}
		//判断输入框内容
		async function validateNameIsUnique(name) {
			// ...validate...
			await new Promise(resolve => setTimeout(resolve, 1000));
			// return /([0-9a-zA-z.]+)/ig.test(name) ? null : '请输入正确的IP地址!';
			return /([0-9a-zA-z.]+)(\.[a-zA-Z0-9]+)(\.[a-zA-Z0-9]+)/ig.test(name) ? null : '请输入正确的IP地址!';
		}
		//获取可用的运行时
		async function getAvailableRuntimes(resourceGroup, token) {
			// ...retrieve...
			await new Promise(resolve => setTimeout(resolve, 500));    //延迟
			return ['getIPInfo', '取消'].map(label => ({ label }));
		}
		const state = await collectInputs();
		switch (state.runtime.label) {
			case 'getIPInfo':
				this.requestApi(state.name);
				break;
			case '取消':
				return vscode.window.showInformationMessage(`取消`);;
			default:
				console.log('null')
				break
		}
	}

	requestApi(IP) {
		const options = {
			method: 'GET',
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
			}
		}
		this.GetIPInfoLog.clear();
		let IPAPI = this.result.replace(/`{data}`/, IP);
		vscode.window.showInformationMessage(IPAPI);
		var req = https.request(IPAPI, options, res => {
			res.on('data', (data) => {
				this.GetIPInfoLog.show();
				this.GetIPInfoLog.appendLine(data);
			})
		})
		req.on('error', error => {
			console.error(error)
		})
		req.end()
	}
}





// //获取本地ip 函数
// function getIPAddress() {
// 	// var interfaces = os.networkInterfaces();
// 	// for(var devName in interfaces){
// 	//     var iface = interfaces[devName];
// 	//     for(var i=0;i<iface.length;i++){
// 	//         var alias = iface[i];
// 	//         if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
// 	//             return alias.address;
// 	//         }
// 	//     }
// 	// }
// 	var ifaces = os.networkInterfaces();
// 	Object.keys(ifaces).forEach((ifname) => {
// 		var alias = 0;
// 		ifaces[ifname].forEach((iface) => {
// 			if ('IPv4' !== iface.family || iface.internal !== false) {
// 				//跳过内部地址（即127.0.0.1）和非ipv4地址
// 				return '127.0.0.1';
// 			}
// 			if (alias >= 1) {
// 				//这个单一介面有多个ipv4地址
// 				vscode.window.showInformationMessage(ifname + ':' + alias, iface.address);
// 				console.log(ifname + ':' + alias, iface.address);
// 			} else {
// 				//该接口只有一个ipv4地址
// 				vscode.window.showInformationMessage(ifname, iface.address);
// 				console.log(ifname, iface.address);
// 			}
// 			++alias;
// 		});
// 	});
// }

// 解析域名对应的ip
// var dns = require("dns");
// var ip = "www.baidu.com"
// dns.lookup(`${ip}`, function (err, address) {
//     if (err) { console.log("error:", err); }
//     console.log(`[${ip} ]address: `, address);
// });