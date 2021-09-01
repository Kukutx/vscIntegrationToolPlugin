const vscode = require('vscode');
const os = require('os');
const { InTPanel} = require('./util');
// @ts-ignore
var OutputLocalInfo = InTPanel;
//获取本地信息 函数
// @ts-ignore
function Getlocalinformation() {
	OutputLocalInfo.clear();
	OutputLocalInfo.show();
	var dealTime = (seconds) => {
		// @ts-ignore
		var seconds = seconds | 0;
		var day = (seconds / (3600 * 24)) | 0;
		var hours = ((seconds - day * 3600) / 3600) | 0;
		var minutes = ((seconds - day * 3600 * 24 - hours * 3600) / 60) | 0;
		var second = seconds % 60;
		// @ts-ignore
		(day < 10) && (day = '0' + day);
		// @ts-ignore
		(hours < 10) && (hours = '0' + hours);
		// @ts-ignore
		(minutes < 10) && (minutes = '0' + minutes);
		// @ts-ignore
		(second < 10) && (second = '0' + second);
		return [day, hours, minutes, second].join(':');
	};
	var dealMem = (mem) => {
		var G = 0,
			M = 0,
			KB = 0;
		// @ts-ignore
		(mem > (1 << 30)) && (G = (mem / (1 << 30)).toFixed(2));
		// @ts-ignore
		(mem > (1 << 20)) && (mem < (1 << 30)) && (M = (mem / (1 << 20)).toFixed(2));
		// @ts-ignore
		(mem > (1 << 10)) && (mem > (1 << 20)) && (KB = (mem / (1 << 10)).toFixed(2));
		return G > 0 ? G + 'G' : M > 0 ? M + 'M' : KB > 0 ? KB + 'KB' : mem + 'B';
	};
	//获取本地设备信息
	OutputLocalInfo.appendLine(`获取本地设备信息\n`)
	//cpu架构
	const arch = os.arch();
	OutputLocalInfo.appendLine("cpu架构：" + arch);
	//操作系统内核
	const kernel = os.type();
	OutputLocalInfo.appendLine("操作系统内核：" + kernel);
	//操作系统平台
	const pf = os.platform();
	OutputLocalInfo.appendLine("平台：" + pf);
	//系统开机时间
	const uptime = os.uptime();
	OutputLocalInfo.appendLine("开机时间：" + dealTime(uptime));
	//主机名
	const hn = os.hostname();
	OutputLocalInfo.appendLine("主机名：" + hn);
	//主目录
	const hdir = os.homedir();
	OutputLocalInfo.appendLine("主目录：" + hdir);
	//内存
	const totalMem = os.totalmem();
	const freeMem = os.freemem();
	OutputLocalInfo.appendLine("内存大小：" + dealMem(totalMem) + ' 空闲内存：' + dealMem(freeMem));
	//cpu
	const cpus = os.cpus();
	OutputLocalInfo.appendLine('*****cpu信息*******');
	// @ts-ignore
	cpus.forEach((cpu, idx, arr) => {
		var times = cpu.times;
		OutputLocalInfo.appendLine(`cpu${idx}：`);
		OutputLocalInfo.appendLine(`型号：${cpu.model}`);
		OutputLocalInfo.appendLine(`频率：${cpu.speed}MHz`);
		OutputLocalInfo.appendLine(`使用率：${((1 - times.idle / (times.idle + times.user + times.nice + times.sys + times.irq)) * 100).toFixed(2)}%`);
	});
	//网卡
	OutputLocalInfo.appendLine('*****网卡信息*******');
	const networksObj = os.networkInterfaces();
	for (let nw in networksObj) {
		let objArr = networksObj[nw];
		OutputLocalInfo.appendLine(`\r\n${nw}：`);
		// @ts-ignore
		objArr.forEach((obj, idx, arr) => {
			OutputLocalInfo.appendLine(`地址：${obj.address}`);
			OutputLocalInfo.appendLine(`掩码：${obj.netmask}`);
			OutputLocalInfo.appendLine(`物理地址：${obj.mac}`);
			OutputLocalInfo.appendLine(`协议族：${obj.family}`);
		});
	}
	OutputLocalInfo.appendLine('系统中的默认存放临时文件的目录： ' + os.tmpdir());
	OutputLocalInfo.appendLine('获取计算机名称： ' + os.hostname());
	OutputLocalInfo.appendLine('获取操作系统类型： ' + os.type());
	OutputLocalInfo.appendLine('获取操作系统平台： ' + os.platform());
	OutputLocalInfo.appendLine('获取CPU架构： ' + os.arch());
	OutputLocalInfo.appendLine('获取操作系统版本号： ' + os.release());
	OutputLocalInfo.appendLine('获取系统当前运行的时间： ' + os.uptime());
	OutputLocalInfo.appendLine('系统总内存量： ' + (os.totalmem() / 1024 / 1024 / 1024).toFixed(1) + 'G');
}

//获取本地ip
module.exports = (context) => {
	context.subscriptions.push(vscode.commands.registerCommand('IntegrationTool.Getlocalinfo', () => {
		Getlocalinformation();
	}));
};
