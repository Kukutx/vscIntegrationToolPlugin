const vscode = require("vscode");
const path = require("path");
const ITEM_ICON_MAP = new Map([
    ['attack', 'attack.svg'],
    ['cheerio', 'spider.svg'],
    ['crypt', 'Encryption.svg'],
    ['webview', 'Web.svg'],
    ['Getlocalinfo', 'tool-light.svg'],
    ['getIPInfo', 'ip.svg'],
    ['funcPort', 'port.svg']
]);
class TreeItemNode extends vscode.TreeItem {
    constructor(label, collapsibleState) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.command = {
            title: this.label,
            command: 'itemClick',
            tooltip: this.label,
            arguments: [
                this.label,
            ]
        };
        //获取标签的图标Uri
        this.iconPath = TreeItemNode.getIconUriForLabel(this.label);
    }
    //获取标签的图标Uri
    static getIconUriForLabel(label) {
        return vscode.Uri.file(path.join(__filename, "..", "..", 'images', ITEM_ICON_MAP.get(label) + ''));
    }
}

class TreeViewProvider {
    //获取树目录
    getTreeItem(element) {
        return element;
    }
    //获取子节点
    getChildren(element) {
        //将Map键值转为数组  ['pig1', 'pig2', 'pig3']
        const itemIcon = [...ITEM_ICON_MAP.keys()];
        return itemIcon.map((item) => new TreeItemNode(item, vscode.TreeItemCollapsibleState.None));
    }
    static initTreeViewItem() {
        const treeViewProvider = new TreeViewProvider();
        vscode.window.registerTreeDataProvider('treeView-tool', treeViewProvider);
    }
}

// //webviewPanel
// let webviewPanel;
// function createWebView(context, viewColumn, label) {
//     if (webviewPanel === undefined) {
//         webviewPanel = vscode.window.createWebviewPanel('webView', label, viewColumn, {
//             retainContextWhenHidden: true,
//             enableScripts: true
//         });
//         webviewPanel.webview.html = getIframeHtml(label);
//     }
//     else {
//         webviewPanel.title = label;
//         webviewPanel.webview.postMessage({ label: label });
//         webviewPanel.reveal();
//     }
//     webviewPanel.onDidDispose(() => {
//         webviewPanel = undefined;
//     });
//     webviewPanel.webview.onDidReceiveMessage(message => {
//         switch (message.command) {
//             case 'ifarmeLabel':
//                 vscode.window.showInformationMessage(message.text);
//         }
//     });
//     return webviewPanel;
// }
// function getIframeHtml(label) {
//     return `
//     <!DOCTYPE html>
//     <html lang="en">
//         <head>
//         <meta charset="utf-8" />
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <style>
//             html,
//             body {
//                 margin: 0 !important;
//                 padding: 0 !important;
//                 width: 100%;
//                 height: 100%;
//             }
//             .iframeDiv {
//                 width: 100%;
//                 height: 100%;
//             }
//         </style>
//         <script>
//             const vscode = acquireVsCodeApi();
//             window.addEventListener('message', (e) => {
//                 if(e.data.label) {
//                     document.getElementById('iframe1').src = 'http://localhost:8000/#/'+e.data.label+'/';
//                 }
//                 if(e.data.ifarmeLabel) {
//                     console.log(e.data.ifarmeLabel);
//                     vscode.postMessage({
//                         command: 'ifarmeLabel',
//                         text: e.data.ifarmeLabel+'',
//                     })
//                 }
//             })
//         </script>
//         </head>

//         <body>
//             <iframe id='iframe1' class="iframeDiv" src="http://localhost:8000/#/${label}" scrolling="auto"></iframe>
//         </body>
//     </html>
//     `;
// }

module.exports = (context) => {
    //树结构
    TreeViewProvider.initTreeViewItem();
    context.subscriptions.push(vscode.commands.registerCommand('itemClick', (label) => {
        switch (label) {
            case "attack":
                vscode.commands.executeCommand('IntegrationTool.attack');//attack
                break;
            case "cheerio":
                vscode.commands.executeCommand('IntegrationTool.cheerio');//cheerio
                break;
            case "crypt":
                vscode.commands.executeCommand('IntegrationTool.crypt');//加密
                break;
            case "Getlocalinfo":
                vscode.commands.executeCommand('IntegrationTool.Getlocalinfo');//获取本地设备信息
                break;
            case "webview":
                vscode.commands.executeCommand('IntegrationTool.webview.hello');//打开启动页
                break;
            case "funcPort":
                vscode.commands.executeCommand('IntegrationTool.funcPort');//打开启动页
                break;
            case "getIPInfo":
                vscode.commands.executeCommand('IntegrationTool.getIPInfo');//获取ip信息
                break;
        }
        vscode.window.showInformationMessage(label);

        //打开webview
        // const webView = createWebView(context, vscode.ViewColumn.Active, label);
        // context.subscriptions.push(webView);
    }));
}