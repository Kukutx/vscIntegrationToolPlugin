const vscode = require('vscode');
const datetime = require('silly-datetime');
const path = require('path');
const fs = require('fs');
const { InTPanel} = require('./util');
let funcGroup = InTPanel;
module.exports = (context) => {
    //返回所有命令
    vscode.commands.getCommands().then(allCommands => {
        console.log('所有命令：', allCommands);
    });
    //获取当前路径
    vscode.commands.registerCommand('IntegrationTool.getCurrentFilePath', (url) => {
        var UrlPath = url.path;
        UrlPath = UrlPath.substr(1);
        vscode.window.showInformationMessage(`当前文件(夹)路径是：${url ? UrlPath : '空'}`);
        //获取地址的第二方法
        // const currentlyOpenTabfilePath = vscode.window.activeTextEditor.document.fileName;
        // vscode.window.showInformationMessage(currentlyOpenTabfilePath);
    })
    //hello启动	
    context.subscriptions.push(vscode.commands.registerCommand('IntegrationTool.SayHello', () => {
        var time = datetime.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
        console.log(time);
        vscode.window.showInformationMessage('欢迎回来' + '(' + time + ')');
        vscode.window.setStatusBarMessage('插件启动', 5000);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('IntegrationTool.test', () => {
        vscode.window.showInformationMessage('菜单栏测试');
    }));

    // 注册如何实现跳转到定义，第一个参数表示仅对json文件生效//查阅文件信息
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(['json'], {
        provideDefinition
    }));

    //代码补全//目前只能在txt文档里使用
    /*
    代码提示相关的主要的API是：
    registerCompletionItemProvider(selector: DocumentSelector, provider: CompletionItemProvider, ...triggerCharacters: string[]): Disposable;
    第一个参数是实现代码提示的文件的类型。
    第二个参数是一个CompletionItemProvider类型的对象,在创建这个对象内部，我们需要根据document、position等信息进行逻辑处理，返回一个CompletionItem的数组，每一个CompletionItem就代表一个提示项。
    第三个参数是可选的触发提示的字符列表。
    下面列出一些与代码提示相关的其他的一些API，这些API大多与文本、单词的处理相关，因为我们进行代码提示时需要知道当前光标所在单词的上下文，这样才能很好的给出智能提示，而要得到当前光标的上下文，就需要对光标附近乃至整个文件进行文本分析。   
    与TextDocument相关
    TextDocument的对象实际是当前文件对象，所以我们可以根据该对象得到当前文件与文本相关的所有信息。
    lineAt(line: number): TextLine; 根据行数返回一个行的对象
    lineAt(position: Position): TextLine; 根据一个位置返回这一行的行对象
    getText(range?: Range): string; 根据范围，返回这个范围的文本
    getWordRangeAtPosition(position: Position, regex?: RegExp): Range | undefined; 根据position返回这个位置所在的单词。
    text.charAt() 返回字符串在某个位置的字符
    */
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('plaintext', {
        provideCompletionItems(document, position) {
            const completionItem1 = new vscode.CompletionItem('Hello World!');
            const completionItem2 = new vscode.CompletionItem('World Peace!');
            return [completionItem1, completionItem2];
        }
    }));



    /*未实现功能集 */
    //编辑器命令,当前编辑器
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('IntegrationTool.testEditorCommand', (textEditor, edit) => {
        console.log('您正在执行编辑器命令！');
        console.log(textEditor, edit);
    }));
    // //打开文档
    // context.subscriptions.push(vscode.commands.registerTextEditorCommand('extension.testEditorCommand', (textEditor, edit) => {
    //     vscode.commands.getCommands(false);
    //     // 打开文档
    //     vscode.workspace.openTextDocument(vscode.Uri.file("C:/Users/liuzh/Desktop/项目/需要用到的/VSCode插件开发/js/terminal/extension.js")).then(
    // 		document => vscode.window.showTextDocument(document)
    // 	)
    // }));

    //悬浮提示测试 
    /*const hover = vscode.languages.registerHoverProvider('json', {
        provideHover(document, position, token) {
            const fileName = document.fileName;
            const word = document.getText(document.getWordRangeAtPosition(position));
            if (/\/package\.json$/.test(fileName) && /\bmain\b/.test(word)) {
                return new vscode.Hover("测试悬停提示测试");
            }
            return undefined;
        }
    });
    context.subscriptions.push(hover);
    */
    /**
     * document: 打开的文本
     * position： hover的位置
     * token： 用于取消hover处理器作用
     */
    //  async function hover(document, position, token) {
    //     const line = document.lineAt(position).text; // 光标所在的行
    //     // getWordRangeAtPosition获取光标所在单词的行列号范围；getText获取指定范围的文本
    //     const positionWord = document.getText(document.getWordRangeAtPosition(position));

    //     console.log('光标所在位置的单词是：', positionWord);
    //   }
    // registerHoverProvider的第一个参数数组表明此处理器的作用范围
    // const hoverDisposable = vscode.languages.registerHoverProvider(['javascript', 'vue'], {
    //     provideHover(document, position, token) {
    //         const line = document.lineAt(position).text; // 光标所在的行
    //         // console.log('line:'+line)
    //         // getWordRangeAtPosition获取光标所在单词的行列号范围；getText获取指定范围的文本
    //         const positionWord = document.getText(document.getWordRangeAtPosition(position));
    //         console.log('光标所在位置的单词是：', positionWord);
    //         if (positionWord) {
    //             return new vscode.Hover("测试悬停提示测试");
    //         }
    //         return undefined;
    //     }
    // });
    // context.subscriptions.push(hoverDisposable);

    //监听FileSystemWatcher
    //用于监听文件是否发生了变化，可以监听到新建、更新、删除这 3 种事件,也可以选择忽略其中某个类型事件。创建watcher是利用vscode.workspace.createFileSystemWatcher
    // let path = vscode.workspace.workspaceFolders[0].uri.fsPath + '/*.js';
    // const watcher = vscode.workspace.createFileSystemWatcher(path);
    // watcher.onDidChange(e => { // 文件发生更新
    //     console.log('js changed', e.fsPath);
    // });
    // watcher.onDidCreate(e => { // 新建了js文件
    //     console.log('js created', e.fsPath);
    // });
    // watcher.onDidDelete(e => { // 删除了js文件
    //     console.log('js deleted',e.fsPath);
    // });








    // // 让用户手动选择文件的的存储路径
    // const uri = vscode.window.showSaveDialog({
    //     filters: {
    //       zip: ['zip'], // 文件类型过滤
    //     },
    //   });
    //   if (!uri) {
    //     return false;
    //   }
    // //   fs.writeFile(uri.fsPath) // 写入文件
    //   // showOpenDialog返回的是文件路径数组
    // const uris = vscode.window.showOpenDialog({
    //     canSelectFolders: false, // 是否可以选择文件夹
    //     canSelectMany: false, // 是否可以选择多个文件
    //     filters: {
    //       json: ['json'], // 文件类型过滤
    //     },
    //   });
    // //   if (!uris || !uris.length) {
    // //     return;
    // //   }
    // //   fs.handleFiles(uris);
    //选择本地文件
    // vscode.window.showOpenDialog(
    // 	{ // 可选对象
    // 		canSelectFiles:true, // 是否可选文件
    // 		canSelectFolders:false, // 是否可选文件夹
    // 		canSelectMany:true, // 是否可以选择多个
    // 		defaultUri:vscode.Uri.file("/D:/"), // 默认打开本地路径
    // 		openLabel:'按钮文字说明'
    // 	}).then(function(msg){
    // 		console.log(msg.path);
    // 	})

    vscode.commands.registerCommand('IntegrationTool.selection', () => {
        // 获取文本编辑器选中项
        let editor = vscode.window.activeTextEditor;
        const selection = editor.selection;
        const text = editor.document.getText(selection);
        vscode.window.showInformationMessage(text);
    })
    // selection
    // 与hover类似，有时候需要处理选中的文本，获取它是通过vscode.TextEditor实例上的属性，有两个相关属性
    // selections：所有被选中的文本信息
    // selection：第一个被选中的文本信息， 等同于selections[0]
    // 获取TextEditor的一个方法是通过注册textEditorCommand,会在回调函数里提供TextEditor实例，例如展示选中文本：
    // context.subscriptions.push(vscode.commands.registerTextEditorCommand('IntegrationTool.selection', function (textEditor, edit) {
    //     // 简单的说这个对应的是调试控制台
    //     const text = textEditor.document.getText(textEditor.selection);
    //     console.log('选中的文本是:', text);
    // }));
};


/********************************************方法区******************************************************************* */
/*
* 查找文件定义的provider，匹配到了就return一个location，否则不做处理
* 最终效果是，当按住Ctrl键时，如果return了一个location，字符串就会变成一个可以点击的链接，否则无任何效果
* 在packege.json 光标加ctrl会显示当前文件信息
*/
function provideDefinition(document, position, token) {
    funcGroup.clear();
    funcGroup.show();
    const fileDir = document.fileName;
    const workDir = path.dirname(fileDir);
    const word = document.getText(document.getWordRangeAtPosition(position));
    const line = document.lineAt(position);
    const fileName = path.basename(fileDir);
    const fileFormat = path.extname(fileName);
    const projectPath = getProjectPath(document);

    funcGroup.appendLine('=========================== 进入 provideDefinition 方法 ============================');
    funcGroup.appendLine('fileDir: ' + fileDir); // 当前工程目录
    funcGroup.appendLine('workDir: ' + workDir); // 当前工程所在目录
    funcGroup.appendLine('word: ' + word); // 当前光标所在单词
    funcGroup.appendLine('line: ' + line.text); // 当前光标所在行
    funcGroup.appendLine('fileName: ' + fileName); // 当前文件名称
    funcGroup.appendLine('fileFormat: ' + fileFormat); // 文件格式
    funcGroup.appendLine('projectName: ' + projectPath); // 当前工程名

    //funcGroup.appendLine('====== 进入 provideDefinition 方法 ======');
    //funcGroup.appendLine('当前工程目录: ' + fileDir); // 当前工程目录
    //funcGroup.appendLine('当前工程所在目录: ' + workDir); // 当前工程所在目录
    //funcGroup.appendLine('当前光标所在单词: ' + word); // 当前光标所在单词
    //funcGroup.appendLine('当前光标所在行: ' + line.text); // 当前光标所在行
    //funcGroup.appendLine('当前文件名称: ' + fileName); // 当前文件名称
    //funcGroup.appendLine('文件格式: ' + fileFormat); // 文件格式
    //funcGroup.appendLine('当前工程名: ' + projectPath); // 当前工程名

    if (/\/package\.json$/.test(fileName)) {
        console.log(word, line.text);
        const json = document.getText();
        // 简单的正则匹配
        if (new RegExp(`"(dependencies|devDependencies)":\\s*?\\{[\\s\\S]*?${word.replace(/\//g, '\\/')}[\\s\\S]*?\\}`, 'gm').test(json)) {
            let destPath = `${workDir}/node_modules/${word.replace(/"/g, '')}/README.md`;
            if (fs.existsSync(destPath)) {
                // new vscode.Position(0, 0) 表示跳转到某个文件的第一行第一列
                return new vscode.Location(vscode.Uri.file(destPath), new vscode.Position(0, 0));
            }
        }
    }
}
//获取工程目录
function getProjectPath(document) {
    if (!document) {
        document = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document : null;
    }
    if (!document) {
        this.showError('当前激活的编辑器不是文件或者没有文件被打开！');
        return '';
    }
    return vscode.workspace.workspaceFolders[0].name;
}