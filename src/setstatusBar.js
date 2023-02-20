const vscode = require('vscode');
const datetime = require('silly-datetime');
//状态栏
class WordCount {
  //状态栏上显示文本的总字数

  //自动监察，如果想要命令控制把这些注释把入口的 context.subscriptions.push(vscode.commands.registerCommand解注释
  constructor() {
    // 当编辑器中的选择更改时触发的事件
    vscode.window.onDidChangeTextEditorSelection(this.updateWordCount, this);
    // 当活动编辑器 发生更改时将触发的事件
    vscode.window.onDidChangeActiveTextEditor(this.updateWordCount, this);
    // 当编辑器中的选择更改时触发的事件
    vscode.window.onDidChangeTextEditorSelection(this.updateStatusBarItem, this);
    // 当活动编辑器 发生更改时将触发的事件
    vscode.window.onDidChangeActiveTextEditor(this.updateStatusBarItem, this);
  }
  // 如果该属性不存在就创建一个
  updateWordCount() {
    if (!this.statusBar) {
      this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    }
    // 获取当前活动编辑器
    let editor = vscode.window.activeTextEditor;
    // 这个判断条件的代码很重要，如果删除下面的代码会报错
    if (!editor) {
      this.statusBar.hide();
      return;
    }
    // 获取当前文档的全部信息
    let doc = editor.document;
    // 用来读取当前文件的语言 ID，判断是否是 md 文档
    if (editor) {
      let textNum = doc.getText().replace(/[\r\n\s]+/g, '').length;
      this.statusBar.text = textNum === 0 ? `目前还没有文字～` : `$(octoface)已经输出 ${textNum} 个字啦！！！`;
      this.statusBar.command = 'statusbar.showhello';          //设置点击状态栏事件
      this.statusBar.show();
    } else {
      this.statusBar.hide();
    }

    // // 获取文本编辑器选中项
    // const selection = editor.selection;
    // /*
    //     selection 当前选中的文本
    //     selection.active 当前光标位置
    //     Position 类型
    //     如果有选中的文本，这里是被选择文本的最后，细心的你会发现，选择了文本后，光标也是会存在的。
    //     如果只需要知道当前光标在哪，获取这个就对了
    //     selection.anchor 选择开始的位置
    //     Position 类型
    //     如果没有选中的文本，这个值与 selection.active 完全一致，但如果选中了文本，这里就是被选中文本的开始位置
    //     selection.start 靠前的位置
    //     Position 类型
    //     这个值应该是以上两值的副本，Postion 会计算出以上两值中，靠前一值放到这来。line越小越前，line相同character越小越前
    //     selection.end 靠后的位置
    //     Position 类型
    //     同上，两值中靠后一值放到这来
    //     selections
    //     Array<Position>类型
    //     vscode有个方便的功能，选中一处代码之后，按ctrl+d可以把当前编辑器中相同的代码一起选中，这就会出现多个选中区域，所以这个属性是把所有选中区域都记录上了。并且它的第一个子项，肯定是用户一开始选中的那个区域
    //   */
    // const text = editor.document.getText(selection);
    // vscode.window.showInformationMessage(text);

  }
  // 将激活的文本编辑器传入到下面的函数中,未完成
  updateStatusBarItem() {
    if (!this.myStatusBar) {
      this.myStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    }
    if (!this.timedate) {
      this.timedate = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    }
    let editor = vscode.window.activeTextEditor;
    if (!editor) {       //判断是否在当前编辑器活动
      this.myStatusBar.hide();
      return;
    }
    //获取当前获取的行列
    let lines = 0;
    if (editor) {
      lines = editor.selections.reduce((prev, curr) => prev + (curr.end.line - curr.start.line), 0);
    }
    //设置状态栏
    if (lines > 0 && editor) {
      this.myStatusBar.text = `已选中(${lines + 1})！`;
      this.myStatusBar.show();
    } else {
      this.myStatusBar.hide();
    }
    //当前实时时间
    setInterval(() => {
      var time = datetime.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
      this.timedate.text = time;
      this.timedate.show();
    }, 1000);

    // vscode.window.setStatusBarMessage("你已选中的列行(" + lines + ")");//显示以选择几行列数
    // return lines;
  }
  // 销毁对象和自由资源
  dispose() {
    this.statusBar.dispose();
  }
}
module.exports = (context) => {
  // 实例化 WordCount
  let wordCount = new WordCount();
  // // 函数绑定到你注册的命令ID,命令版本的
  // context.subscriptions.push(vscode.commands.registerCommand('extension.wordCount', () => {
  // // 调用 WordCount 里的 方法
  // 	wordCount.updateWordCount();
  // 	vscode.window.showInformationMessage('该插件为显示 md 文档输出的字符，请看 vs Code 左下角~');
  // }));

  //监控器版本，到了语言id会自动启动，"onLanguage:markdown"可以更换 *
  context.subscriptions.push(wordCount);
  context.subscriptions.push(vscode.commands.registerCommand('statusbar.showhello', () => {
    vscode.window.showInformationMessage(`Yeah, line(s) selected... Keep going!`);
  }));
}