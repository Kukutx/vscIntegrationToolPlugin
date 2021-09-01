const sh = require('shell-exec');
const { MultiStepInput } = require('./util');
var net = require('net')
const vscode = require('vscode');
module.exports = (context) => {
	context.subscriptions.push(vscode.commands.registerCommand('IntegrationTool.funcPort', () => {
		var a = new funcPort;
		a.funcPortInput()
	}));
};

class funcPort {
	async funcPortInput() {
		const title = '端口模块';
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
				placeholder: '0~65536',
				prompt: '请输入端口号',
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
		//判断
		async function validateNameIsUnique(name) {
			// ...validate...
			await new Promise(resolve => setTimeout(resolve, 1000));
			return (!isNaN(Number(name))) ? null : '请输入正确的端口号!';
		}
		//获取可用的运行时
		async function getAvailableRuntimes(resourceGroup, token) {
			// ...retrieve...
			await new Promise(resolve => setTimeout(resolve, 500));    //延迟
			return ['testport', 'killport', '取消'].map(label => ({ label }));
		}
		const state = await collectInputs();
		switch (state.runtime.label) {
			case 'testport':
				this.portIsOccupied(state.name);
				break;
			case 'killport':
				this.kill(state.name);
				break;
			case '取消':
				return vscode.window.showInformationMessage(`取消`);;
			default:
				console.log('null')
				break
		}
	}
    //杀死端口
	kill(port, method = 'tcp') {
		port = Number.parseInt(port)
		if (!port) {
			vscode.window.showErrorMessage('Invalid argument provided for port')
			return Promise.reject(new Error('Invalid argument provided for port'))
		}
		if (process.platform === 'win32') {
			return sh('netstat -nao')
				.then(res => {
					const { stdout } = res;
					if (!stdout) return res;
					const lines = stdout.split('\n');
					// netstat输出的第二个以空格分隔的列是本地端口，
					//这是我们唯一关心的端口。
					//此处的正则表达式仅匹配输出的本地端口列
					const lineWithLocalPortRegEx = new RegExp(`^ *${method.toUpperCase()} *[^ ]*:${port}`, 'gm');
					const linesWithLocalPort = lines.filter(line => line.match(lineWithLocalPortRegEx));
					const pids = linesWithLocalPort.reduce((acc, line) => {
						const match = line.match(/(\d*)\w*(\n|$)/gm);
						return match && match[0] && !acc.includes(match[0]) ? acc.concat(match[0]) : acc
					}, []);
					if (Array.isArray(pids) && pids.length === 0) {
						return vscode.window.showErrorMessage('端口号不存在');
					}
					vscode.window.showInformationMessage(`端口号：[${port}] 已杀死`)
					return sh(`TaskKill /F /PID ${pids.join(' /PID ')}`)
				})
		}
		return sh(
			`lsof -i ${method === 'udp' ? 'udp' : 'tcp'}:${port} | grep ${method === 'udp' ? 'UDP' : 'LISTEN'} | awk '{print $2}' | xargs kill -9`
		)
	}
	// 检测端口是否被占用
	portIsOccupied(port) {
		port = Number.parseInt(port)
		if (port >= 65536) {
			return vscode.window.showErrorMessage('超出了')
		}
		// 创建服务并监听该端口
		var server = net.createServer().listen(port)
		server.on('listening', function () { // 执行这块代码说明端口未被占用
			server.close() // 关闭服务
			vscode.window.showInformationMessage(`端口 : [ ${port} ] 未被占用`) // 控制台输出信息
		})
		server.on('error', function (err) {
			if (err.code === 'EADDRINUSE') { // 端口已经被使用
				vscode.window.showErrorMessage(`端口 : [ ${port} ] 被占用`)
			}
		})
	}
}