"use strict";
const vscode = require('vscode');
//装饰URL,加提示悬浮窗
// createTextEditorDecorationType 用于向文本添加装饰
const smallNumDecoration = vscode.window.createTextEditorDecorationType({
  border: '1px',
  borderStyle: 'solid',
  borderColor: '#fff',
});
const bigNumDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: 'blue'
});
/*装饰*/
class DecorationUrl {
  // 自动监察写法
  constructor() {
    //获取当前编辑器文本
    this.editor = vscode.window.activeTextEditor;      
    //定义一个定时器属性
    this.timeout = undefined;  
    // 监视文本编辑器
    vscode.window.onDidChangeActiveTextEditor(editor => {
      // 当编辑器切换面板时，editor 就变成了 undefined，所以要重新设置
      this.editor = vscode.window.activeTextEditor;
      if (editor) {
        // this.DecNumber();
        this.triggerUpdateDecorations();
      }
    })
    // 监视文本是否改动
    vscode.workspace.onDidChangeTextDocument(event => {
      if (this.editor && event.document === this.editor.document) {
        // this.DecNumber();
        this.triggerUpdateDecorations();
      }
    })
  }
  
  //控制装饰时间
  triggerUpdateDecorations() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
    // @ts-ignore
    this.timeout = setTimeout(this.DecUrl(), 500);
  }

  //实现方法
  DecUrl() {
    // 这个判断条件的代码很重要，如果删除下面的代码会报错
    if (!this.editor) { return; }
    // 获取当前文档的全部信息
    let doc = this.editor.document;
    // 获取文档中的全部内容
    let text = doc.getText();
    // 创建两个用来存放正则判断出来的数字的数组
    let smallNumbers = [];
    let bigNumbers = [];
    // 判断url链接字符串正则
    const regEx =/((http|ftp|https|file):\/\/([\w\-]+\.)+[\w\-]+(\/[\w\u4e00-\u9fa5\-\.\/?\@\%\!\&=\+\~\:\#\;\,]*)?)/ig;
    let Url;
    while (Url = regEx.exec(text)) {
      //获取数字开始和结束的位置
      const startPos = doc.positionAt(Url.index);
      const endPos = doc.positionAt(Url.index + Url[0].length);
      //获取数字的位置范围，并且当鼠标覆盖时，展示文字
      const decoration = {
        range: new vscode.Range(startPos, endPos),
        hoverMessage: `URL ** ${Url[0]} ** 🌐`,
      };
      //根据不同的长度分别存入不同的数组中
      if (Url[0].length < 32) {
        smallNumbers.push(decoration);
      } else {
        bigNumbers.push(decoration);
      }
    }
    //将一组装饰添加到文本编辑器
    this.editor.setDecorations(smallNumDecoration, smallNumbers);
    this.editor.setDecorations(bigNumDecoration, bigNumbers);
  }
  dispose() { }
}
module.exports = (context) => {
  // 实例化类
  let decorationUrl = new DecorationUrl();

  // // 命令版本，使用命令开启与关闭装饰url，再看没能实现,
  // context.subscriptions.push(vscode.commands.registerCommand('IntegrationTool.decorationUrl', () => {
  //   decorationUrl = null;
  //   console.log(delete decorationUrl.DecUrl)
  // }))
}