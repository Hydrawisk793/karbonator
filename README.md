# KarbonatorJS
<br>
2017-07-13<br>
var lg = new karbonator.string.LexerGenerator();<br/>
lg.defineToken("kw-private", "private");<br/>
lg.defineToken("kw-protected", "protected");<br/>
lg.defineToken("kw-public", "public");<br/>
lg.defineToken("kw-extends", "extends");<br/>
lg.defineToken("kw-final", "final");<br/>
<br/>
lg.defineToken("kw-var", "var");<br/>
lg.defineToken("kw-const", "const");<br/>
lg.defineToken("kw-alias", "alias");<br/>
<br/>
lg.defineToken("kw-new", "new");<br/>
lg.defineToken("kw-delete", "delete");<br/>
<br/>
lg.defineToken("kw-object", "object");<br/>
lg.defineToken("kw-function", "function");<br/>
<br/>
lg.defineToken("kw-if", "if");<br/>
lg.defineToken("kw-else", "else");<br/>
lg.defineToken("kw-switch", "switch");<br/>
lg.defineToken("kw-case", "case");<br/>
lg.defineToken("kw-default", "default");<br/>
<br/>
lg.defineToken("kw-for", "for");<br/>
lg.defineToken("kw-do", "do");<br/>
lg.defineToken("kw-while", "while");<br/>
<br/>
lg.defineToken("kw-break", "break");<br/>
lg.defineToken("kw-continue", "continue");<br/>
lg.defineToken("kw-return", "return");<br/>
lg.defineToken("kw-yield", "yield");<br/>
lg.defineToken("kw-throw", "throw");<br/>
<br/>
lg.defineToken("kw-true", "true");<br/>
lg.defineToken("kw-false", "false");<br/>
lg.defineToken("kw-null", "null");<br/>
<br/>
lg.defineToken("id", "[A-Za-z_$][A-Za-z0-9_$]*");<br/>
lg.defineToken("lit-str", "\".*?\"");<br/>
lg.defineToken("lit-base10-int", "(\\+|\\-)?(0|[1-9][0-9]*)");<br/>
<br/>
lg.defineToken("group-begin", "\\(");<br/>
lg.defineToken("group-end", "\\)");<br/>
lg.defineToken("block-begin", "\\{");<br/>
lg.defineToken("block-end", "\\}");<br/>
lg.defineToken("end-of-stmt", ";");<br/>
<br/>
lg.defineToken("op-dot", "\\.");<br/>
lg.defineToken("op-spread", "\\.{3}");<br/>
lg.defineToken("op-colon", ":");<br/>
lg.defineToken("op-comma", ",");<br/>
lg.defineToken("op-eq", "==");<br/>
lg.defineToken("op-ne", "!=");<br/>
lg.defineToken("op-ge", ">=");<br/>
lg.defineToken("op-gt", ">");<br/>
lg.defineToken("op-le", "<=");<br/>
lg.defineToken("op-lt", "<");<br/>
lg.defineToken("op-assign", "=");<br/>
lg.defineToken("op-add-assign", "\\+=");<br/>
lg.defineToken("op-sub-assign", "\\-=");<br/>
lg.defineToken("op-mul-assign", "\\*=");<br/>
lg.defineToken("op-div-assign", "\\/=");<br/>
lg.defineToken("op-mod-assign", "%=");<br/>
lg.defineToken("op-inc", "\\+{2}");<br/>
lg.defineToken("op-dec", "\\-{2}");<br/>
lg.defineToken("op-add", "\\+");<br/>
lg.defineToken("op-sub", "\\-");<br/>
lg.defineToken("op-mul", "\\*");<br/>
lg.defineToken("op-div", "\\/");<br/>
lg.defineToken("op-mod", "\\%");<br/>
var lexer = lg.generate();<br/>
lexer.setInput(<br/>
    "var fooFunc = function (arg0, ...) {"<br/>
    + "var fooBarBaz = \"quxQuxQuxquxuqx\""<br/>
    + "var ifObjWorks = object extends global.Array {"<br/>
    + "    public foo = -2343;"<br/>
    + "    private bar_ = \"should not visible.\";"<br/>
    + "};"<br/>
    + "if(true) {"<br/>
    + "return false;"<br/>
    + "}"<br/>
    + "else {"<br/>
    + "var nullablePtr = null;"<br/>
    + "var $qux = 23525;"<br/>
    + "return $qux + 53 * (77 - 34);"<br/>
    + "}"<br/>
    + "}"<br/>
);<br/>
var resultStr = "";//lexer._regexVm._bytecode._sourceCodeForDebug;<br/>
resultStr;<br/>
while(lexer.scanNext(<br/>
    function (matchResult, index, lexer) {<br/>
        resultStr += index + " : " + lexer.getToken(matchResult.tokenKey).name + ", " + matchResult + "\r\n";<br/>
    }<br/>
));<br/>
resultStr;<br/>