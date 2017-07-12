# KarbonatorJS
<br>
2017-07-13<br>
var lg = new karbonator.string.LexerGenerator();<br>
lg.defineToken("var-decl-keyword", "var|global|alias");<br>
lg.defineToken("select-keyword", "if|else|switch|case");<br>
lg.defineToken("loop-keyword", "for|do|while");<br>
lg.defineToken("jump-keyword", "break|continue|return|throw|yield");<br>
lg.defineToken("group-begin", "\\(");<br>
lg.defineToken("group-end", "\\)");<br>
lg.defineToken("block-begin", "\\{");<br>
lg.defineToken("block-end", "\\}");<br>
lg.defineToken("end-of-stmt", ";");<br>
lg.defineToken("op-assign", "=");<br>
lg.defineToken("op-add", "\\+");<br>
lg.defineToken("op-sub", "\\-");<br>
lg.defineToken("op-mul", "\\*");<br>
lg.defineToken("lit-true", "true");<br>
lg.defineToken("lit-false", "false");<br>
lg.defineToken("lit-null", "null");<br>
lg.defineToken("lit-str", "\".*?\"");<br>
lg.defineToken("list-base10-int", "(\\+|\\-)?(0|[1-9][0-9]*)");<br>
lg.defineToken("id", "[A-Za-z_$][A-Za-z0-9_$]*");<br>
var lexer = lg.generateLexer();<br>
lexer.inputString("var fooBarBaz = \"quxQuxQuxquxuqx\" if(true) {return false;} else {var _pNext = null; var $qux = 23525; reutrn $qux + 53 * (77 - 34);}");<br>
var resultStr = lexer._regexVm._bytecode._sourceCodeForDebug;<br>
while(lexer.scanNextToken(<br>
    function (lexer, token, index) {<br>
        resultStr += "token " + index + " : " + token + "\r\n";<br>
    }<br>
));<br>
resultStr;<br>
