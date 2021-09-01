const vscode = require('vscode');
const crypto = require('crypto');
const { MultiStepInput } = require('./util');
module.exports = (context) => {
    vscode.commands.registerCommand('IntegrationTool.crypt', () => {
        const crypt = new funcCrypto;
        crypt.cryptoInput();
    })
}

class funcCrypto {
    async cryptoInput() {
        const title = '加密模块';
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
                placeholder: '请输入要加密的信息',
                prompt: '请输入需加密值',
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
            return name ? null : '请输入正确的信息';
        }
        //获取可用的运行时
        async function getAvailableRuntimes(resourceGroup, token) {
            // ...retrieve...
            await new Promise(resolve => setTimeout(resolve, 500));    //延迟
            return ['md5', 'sha1', 'sha256', '取消'].map(label => ({ label }));
        }
        const state = await collectInputs();
        switch (state.runtime.label) {
            case 'md5':
                vscode.window.showInformationMessage(await this.md5Crypto(state.name));
                break;
            case 'sha1':
                vscode.window.showInformationMessage(await this.sha1Crypto(state.name));
                break;
            case 'sha256':
                vscode.window.showInformationMessage(await this.sha256Crypto(state.name));
                break;
            case '取消':
                return vscode.window.showInformationMessage(`取消`);;
            default:
                console.log('null')
                break
        }
    }

    async md5Crypto(value) {
        const hash = crypto.createHash('md5')
        hash.update(value)
        const md5Password = hash.digest('hex')
        return md5Password;
    }
    async sha1Crypto(value) {
        const hash = crypto.createHash('SHA1')
        hash.update(value)
        const md5Password = hash.digest('hex')
        return md5Password;
    }
    async sha256Crypto(value) {
        const hash = crypto.createHash('sha256')
        hash.update(value)
        const md5Password = hash.digest('hex')
        return md5Password;
    }
}