const vscode = require('vscode');
const fs = require('fs');
const parse = require('url-parse');
const cheerio = require('cheerio');
const request = require('request');
const { InTPanel, MultiStepInput } = require('./util');
module.exports = (context) => {
	//爬虫cheerio
	vscode.commands.registerCommand('IntegrationTool.cheerio', () => {
		var cheerio = new Cheerio
		cheerio.CheerioInput(context);
	});
};
class Cheerio {
	constructor() {
		this.cheeriolog = InTPanel;
		this.fsPath = process.env["APPDATA"] + '//IntegrationTool' + '/cheerio';
	}

	/*CheerioInput */
	async CheerioInput(context) {
		//创建文件夹
		fs.access(this.fsPath, (err) => {
			(err ? fs.mkdir(this.fsPath, (error) => {
				if (error) {
					console.log(error);
					return false;
				}
				console.log('创建目录成功');
			}) : console.log('文件存在,可以进行读写'));
		});
		//按钮类
		class MyButton {
			constructor(iconPath, tooltip) {
				this.iconPath = iconPath;           //按钮地址
				this.tooltip = tooltip;             //按钮提示
			}
		}
		//创建一个按钮（创建资源组按钮）
		const createResourceGroupButton = new MyButton({
			dark: vscode.Uri.file(context.asAbsolutePath('images/dark/add.svg')),  //获取按钮图片地址
			light: vscode.Uri.file(context.asAbsolutePath('images/light/add.svg')),
		}, '其他');
		//设置资源组(multiStepInput的选项)
		const FuncGroup = ['爬虫', '记录'].map((label) => ({ label }));
		const title = '网络爬虫模块';
		// 选择资源组，quick选项
		async function pickResourceGroup(input, state) {
			const pick = await input.showQuickPick({
				title,
				step: 1,
				totalSteps: 3,
				ignoreFocusOut: true,
				placeholder: '选一个方式',
				items: FuncGroup,
				activeItem: typeof state.resourceGroup !== 'string' ? state.resourceGroup : undefined,
				buttons: [createResourceGroupButton],
				shouldResume: shouldResume
			});
			if (pick instanceof MyButton) {   //判断实例
				return (input) => inputResourceGroupName(input, state);
			}
			state.resourceGroup = pick;
			return (input) => inputName(input, state);
		}
		//获取输入
		async function collectInputs() {
			const state = {};
			await MultiStepInput.run((input) => pickResourceGroup(input, state));
			return state;
		}
		//输入资源组名称
		async function inputResourceGroupName(input, state) {
			state.resourceGroup = await input.showInputBox({
				title,
				step: 1,
				totalSteps: 3,
				ignoreFocusOut: true,
				value: typeof state.resourceGroup === 'string' ? state.resourceGroup : '',
				prompt: '请输入要爬取的网址（带协议头,如："http:" | "https:"）',
				placeholder: '其他方式',
				validate: validateNameIsUnique,
				shouldResume: shouldResume
			});
			return (input) => pickRuntime(input, state);
		}
		//输入名称
		async function inputName(input, state) {
			/*暂时 */
			console.log(state.resourceGroup.label);
			if (state.resourceGroup.label === '记录') {
				vscode.window.showInformationMessage(`开发中`);
				return;
			}

			const additionalSteps = typeof state.resourceGroup === 'string' ? 1 : 0;
			// TODO: Remember current value when navigating back.
			state.name = await input.showInputBox({
				title,
				step: 2 + additionalSteps,
				ignoreFocusOut: true,
				totalSteps: 3 + additionalSteps,
				value: state.name || '',
				prompt: '请输入要爬取的网址（带协议头,如："http:" | "https:"）',
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
				step: 3 + additionalSteps,
				ignoreFocusOut: true,
				totalSteps: 3 + additionalSteps,
				placeholder: 'cheerio',
				prompt: '请选择爬取一个方式',
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
			await new Promise(resolve => setTimeout(resolve, 500));
			return (name.substr(0, 5) === 'http:' || name.substr(0, 6) === 'https:') ? null : '请输入正确的网址!';
		}
		//获取可用的运行时
		async function getAvailableRuntimes(resourceGroup, token) {
			// ...retrieve...
			await new Promise(resolve => setTimeout(resolve, 1000));    //延迟
			return ['cheerio', '取消']
				.map(label => ({ label }));
		}
		const state = await collectInputs();
		switch (state.runtime.label) {
			case 'cheerio':
				this.cheerioweb(state.name);
				break;
			case '取消':
				return vscode.window.showInformationMessage(`取消爬取`);;
			default:
				console.log('null')
				break
		}
		vscode.window.showInformationMessage(`cheerio: '${state.name}'`);
	}

	async cheerioweb(uri) {
		this.cheeriolog.clear();
		this.cheeriolog.show();
		const parts = parse(uri);
		const server = parts.protocol == 'https:' ? require('https') : require('http');
		//判断链接
		if (uri === undefined || uri === null) {
			vscode.window.showErrorMessage("不能为空");
			return 0;
		}
		GetResponse(uri);
		//爬虫
		await server.get(uri, (res) => {
			//安全判断
			const { statusCode } = res;            //状态码
			const contentType = res.headers['content-type'];    //文件类型
			this.cheeriolog.appendLine(statusCode + " " + contentType);
			let err = null;
			if (statusCode != 200) {
				err = new Error("请求状态错误");
			} else if (!/^text\/html/.test(contentType)) {
				//格式类型是网页文件
				err = new Error("请求类型错误");
			}
			if (err) {
				console.log(err);
				this.cheeriolog.appendLine('错误');
				res.resume();//重置缓存
				return false;
			}
			//数据的处理
			//数据分段，只要接受数据就会触发data事件chunk每次接受的数据片段
			let rawData = '';
			res.on('data', (chunk) => {
				// console.log('数据传输');
				this.cheeriolog.appendLine('------');
				rawData += chunk.toString('utf8');
				this.cheeriolog.appendLine(rawData);
			})
			//数据流传输完毕
			res.on('end', (chunk) => {
				//通过cheerio分析
				let $ = cheerio.load(rawData);    //将请求的网页数据进行转化
				$('img').each((index, el) => {
					this.cheeriolog.appendLine($(el).attr('src'));
				})
				let title = $('title').text();
				//将请求的数据保存到本地
				fs.writeFileSync(this.fsPath + `/${title}.html`, rawData);
				this.cheeriolog.appendLine('数据传输完毕');
			})
		}).on('error', (err) => {
			this.cheeriolog.appendLine('请求错误');
			console.log(err);
		});
		function GetResponse(url) {
			request({
				url: url,
				method: "GET",
				encoding: null, // setting null can avoid some encoding trouble
				headers: {
					//'Accept-Encoding': 'gzip, deflate'
				}
			}, function (error, body) {
				if (body) {
					console.log("正常访问");
				} else if (error) {
					console.log(error);
					console.log("访问错误");
					vscode.window.showErrorMessage("访问错误");
					return -1;
				}
			})
			//socket信息
			// .on('socket', function (sok){
			//     console.log(sok);
			//     sok.on('data', function (fin){
			//         console.log(fin);
			//     });
			// });
		}
	}
}