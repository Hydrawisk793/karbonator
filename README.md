# KarbonatorJS

2017-07-13
var lg = new karbonator.string.LexerGenerator();
lg.defineToken("var-decl-keyword", "var|global|alias");
lg.defineToken("select-keyword", "if|else|switch|case");
lg.defineToken("loop-keyword", "for|do|while");
lg.defineToken("jump-keyword", "break|continue|return|throw|yield");
lg.defineToken("group-begin", "\\(");
lg.defineToken("group-end", "\\)");
lg.defineToken("block-begin", "\\{");
lg.defineToken("block-end", "\\}");
lg.defineToken("end-of-stmt", ";");
lg.defineToken("op-assign", "=");
lg.defineToken("op-add", "\\+");
lg.defineToken("op-sub", "\\-");
lg.defineToken("op-mul", "\\*");
lg.defineToken("lit-true", "true");
lg.defineToken("lit-false", "false");
lg.defineToken("lit-null", "null");
lg.defineToken("lit-str", "\".*?\"");
lg.defineToken("list-base10-int", "(\\+|\\-)?(0|[1-9][0-9]*)");
lg.defineToken("id", "[A-Za-z_$][A-Za-z0-9_$]*");
var lexer = lg.generateLexer();
lexer.inputString("var fooBarBaz = \"quxQuxQuxquxuqx\" if(true) {return false;} else {var _pNext = null; var $qux = 23525; reutrn $qux + 53 * (77 - 34);}");
var resultStr = lexer._regexVm._bytecode._sourceCodeForDebug;
while(lexer.scanNextToken(
    function (lexer, token, index) {
        resultStr += "token " + index + " : " + token + "\r\n";
    }
));
resultStr;
