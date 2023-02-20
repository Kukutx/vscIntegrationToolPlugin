var vscode = require('vscode');
var isFinite = require('is-finite');    //回头拿走模块里的代码然后卸了
module.exports = (context) => {
    vscode.commands.registerCommand('IntegrationTool.addDocComments', function () {
        var lang = vscode.window.activeTextEditor.document.languageId;//获取doc当前语言
        if ((lang == "typescript") || (lang == 'javascript')) {
            //获取函数
            var selection = vscode.window.activeTextEditor.selection;        //获取鼠标选中
            var startLine = selection.start.line - 1;
            var selectedText = vscode.window.activeTextEditor.document.getText(selection);
            var outputMessage = '请选择一个TypeScript或JavaScript函数签名';

			// console.log(selectedText)
			
            if (selectedText.length === 0) {
                vscode.window.showInformationMessage(outputMessage);
                return;
            }
            if (stripComments(selectedText).length === 0) {
                vscode.window.showInformationMessage(outputMessage);
                return;
            }


            //一些随机的文字
            // var containsFunctionSig:boolean = /\s*function\s*\w*\s*\(/.test(functionParser.stripComments(selectedText));
            // if (!containsFunctionSig) {
            // 	vscode.window.showInformationMessage(outputMessage);
            // 	return;
            // }

            //获取（）里的参数
            var firstBraceIndex = selectedText.indexOf('(');
            selectedText = selectedText.slice(firstBraceIndex);
            selectedText = stripComments(selectedText);
            // console.log(selectedText)
            var returnText = getReturns(selectedText);
            console.log(returnText)
            var params = getParameters(selectedText);
            console.log(params)
            if (params.length > 0) {
                var textToInsert = getParameterText(params, returnText);
                vscode.window.activeTextEditor.edit(function (editBuilder) {
                    if (startLine < 0) {
                        //If the function declaration is on the first line in the editor we need to set startLine to first line
                        //and then add an extra newline at the end of the text to insert
                        startLine = 0;
                        textToInsert = textToInsert + '\n';
                    }
                    //Check if there is any text on startLine. If there is, add a new line at the end
                    var lastCharIndex = vscode.window.activeTextEditor.document.lineAt(startLine).text.length;
                    var pos;
                    if ((lastCharIndex > 0) && (startLine != 0)) {
                        pos = new vscode.Position(startLine, lastCharIndex);
                        textToInsert = '\n' + textToInsert;
                    }
                    else {
                        pos = new vscode.Position(startLine, 0);
                    }
                    var line = vscode.window.activeTextEditor.document.lineAt(selection.start.line).text;
                    var firstNonWhiteSpace = vscode.window.activeTextEditor.document.lineAt(selection.start.line).firstNonWhitespaceCharacterIndex;
                    var numIndent = 0;
                    var tabSize = vscode.window.activeTextEditor.options.tabSize;
                    var stringToIndent = '';
                    for (var i = 0; i < firstNonWhiteSpace; i++) {
                        if (line.charAt(i) == '\t') {
                            stringToIndent = stringToIndent + '\t';
                        }
                        else if (line.charAt(i) == ' ') {
                            stringToIndent = stringToIndent + ' ';
                        }
                    }
                    // @ts-ignore
                    textToInsert = indentString(textToInsert, stringToIndent, 1);
                    editBuilder.insert(pos, textToInsert);
                }).then(function () {
                });
            }
        }
    });
}

//回头放在util文件中
function indentString (str, indent, count) {
	if (typeof str !== 'string' || typeof indent !== 'string') {
		throw new TypeError('`string` and `indent` should be strings');
	}

	if (count != null && typeof count !== 'number') {
		throw new TypeError('`count` should be a number');
	}

	if (count === 0) {
		return str;
	}

	indent = count > 1 ? repeating(indent, count) : indent;

	return str.replace(/^(?!\s*$)/mg, indent);
};

function repeating(str, n) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected `input` to be a string');
	}
	if (n < 0 || !isFinite(n)) {
		throw new TypeError('Expected `count` to be a positive finite number');
	}
	var ret = '';
	do {
		if (n & 1) {
			ret += str;
		}

		str += str;
	} while ((n >>= 1));
	return ret;
};

//参数声明
var paramDeclaration = (function () {
    function paramDeclaration(paramName, paramType) {
        this.paramName = paramName;
        this.paramType = paramType;
        this.paramName = paramName;
        this.paramType = paramType;
    }
    return paramDeclaration;
}());
exports.paramDeclaration = paramDeclaration;

//获取参数为文本
function getParameterText(paramList, returnText) {
    var textToInsert = "";
    textToInsert = textToInsert + '/**\n *';
    paramList.forEach(function (element) {
        if (element.paramName != '') {
            textToInsert = textToInsert + ' @param  ';
            //if (element.paramType != '') {
            textToInsert = textToInsert + '{' + element.paramType + '}' + ' ';
            //}
            textToInsert = textToInsert + element.paramName + '\n' + ' *';
        }
    });
    if (returnText != '') {
        textToInsert = textToInsert + ' @returns ' + returnText + '\n' + ' *';
    }
    textToInsert = textToInsert + '/';
    return textToInsert;
}

//获取返回值
function getReturns(text) {
    var returnText = '';
    text = text.replace(/\s/g, '');
    var lastIndex = text.lastIndexOf(':');
    var lastBrace = text.lastIndexOf(')');
    if (lastIndex > lastBrace) {
        //we have a return type
        //read to end of string
        var index = lastIndex + 1;
        var splicedText = text.slice(index, text.length);
        returnText = splicedText.match(/[a-zA-Z][a-zA-Z0-9$_]*/).toString();
    }
    return returnText;
}

//条注释
function stripComments(text) {
    var uncommentedText = '';
    var index = 0;
    while (index != text.length) {
        if ((text.charAt(index) == '/') && (text.charAt(index + 1) == '*')) {
            //parse comment
            if ((index + 2) != text.length) {
                index = index + 2;
                while ((text.charAt(index) != '*') && (text.charAt(index + 1) != '/')) {
                    index++;
                }
            }
            index = index + 2;
        }
        else if ((text.charAt(index) == '/') && (text.charAt(index + 1) == '/')) {
            //read to end of line
            while ((text.charAt(index) != '\n') && (index < text.length)) {
                index++;
            }
        }
        else {
            uncommentedText = uncommentedText + text.charAt(index);
            index++;
        }
    }
    return uncommentedText;
}

//获取参数
//假设传入的字符串以（并继续以）开头，并且不包含任何注释或空格
function getParameters(text) {
    var paramList = [];
    //Start by looking for the function name declaration
    var index = 0;
    text = text.replace(/\s/g, '');
    //Now we are at the first non whitespace character
    //if it is not a '(' then this is not a valid function declaration
    if (text.charAt(index) == '(') {
        //count the number of matching opening and closing braces. Keep parsing until 0
        var numBraces = 1;
        index++;
        while ((numBraces != 0) && (index != text.length)) {
            //Now we are at a non whitespace character. Assume it is the parameter name
            var name = '';
            while ((text.charAt(index) != ':') && (text.charAt(index) != ',') && (text.charAt(index) != ')') && (index < text.length)) {
                name = name + text.charAt(index);
                index++;
            }
            if (index < text.length) {
                //Now we are at a : or a ',', skip then read until a , to get the param type
                var type = '';
                if (text.charAt(index) == ':') {
                    index++;
                    //we have a type to process
                    if (text.charAt(index) == '(') {
                        var startNumBraces = numBraces;
                        numBraces++;
                        type = type + text.charAt(index);
                        index++;
                        //we have encountered a function type
                        //read all the way through until the numBraces = startNumBraces
                        while ((numBraces != startNumBraces) && (index < text.length)) {
                            if (text.charAt(index) == ')') {
                                numBraces--;
                            }
                            else if (text.charAt(index) == '(') {
                                numBraces++;
                            }
                            type = type + text.charAt(index);
                            index++;
                        }
                        if (index < text.length) {
                            //Now read up to either a , or a )
                            while ((text.charAt(index) != ',') && (text.charAt(index) != ')')) {
                                type = type + text.charAt(index);
                                index++;
                            }
                            if (text.charAt(index) == ')') {
                                numBraces--;
                            }
                        }
                    }
                    else {
                        while ((text.charAt(index) != ',') && (text.charAt(index) != ')') && (index != text.length)) {
                            type = type + text.charAt(index);
                            index++;
                        }
                        if (text.charAt(index) == ')') {
                            numBraces--;
                        }
                    }
                }
                else {
                    //no type is specified
                    type = '';
                }
                paramList.push(new paramDeclaration(name, type));
                if (index < text.length) {
                    index++;
                }
            }
        }
    }
    return paramList;
}