CodeMirror.defineMode("velocity", function() {
    function parseWords(str) {
        var obj = {}, words = str.split(" ");
        for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
        return obj;
    }

    var keywords = parseWords("#end #else #break #stop #[[ #]] " +
                              "#{end} #{else} #{break} #{stop}");
    var functions = parseWords("#if #elseif #foreach #set #include #parse #macro #define #evaluate " +
                               "#{if} #{elseif} #{foreach} #{set} #{include} #{parse} #{macro} #{define} #{evaluate}");
    var specials = parseWords("$foreach.count $foreach.hasNext $foreach.first $foreach.last $foreach.topmost $foreach.parent $velocityCount");
    var isOperatorChar = /[+\-*&%=<>!?:\/|]/;

    function chain(stream, state, f) {
        state.tokenize = f;
        return f(stream, state);
    }
    function tokenBase(stream, state) {
        var beforeParams = state.beforeParams;
        state.beforeParams = false;
        var ch = stream.next();
        // start of string?
        if ((ch == '"' || ch == "'") && state.inParams)
            return chain(stream, state, tokenString(ch));
        // is it one of the special signs []{}().,;? Seperator?
        else if (/[\[\]{}\(\),;\.]/.test(ch)) {
            if (ch == "(" && beforeParams) state.inParams = true;
            else if (ch == ")") state.inParams = false;
            return null;
        }
        // start of a number value?
        else if (/\d/.test(ch)) {
            stream.eatWhile(/[\w\.]/);
            return "number";
        }
        // multi line comment?
        else if (ch == "#" && stream.eat("*")) {
            return chain(stream, state, tokenComment);
        }
        // unparsed content?
        else if (ch == "#" && stream.match(/ *\[ *\[/)) {
            return chain(stream, state, tokenUnparsed);
        }
        // single line comment?
        else if (ch == "#" && stream.eat("#")) {
            stream.skipToEnd();
            return "comment";
        }
        // variable?
        else if (ch == "$") {
            stream.eatWhile(/[\w\d\$_\.{}]/);
            // is it one of the specials?
            if (specials && specials.propertyIsEnumerable(stream.current().toLowerCase())) {
                return "keyword";
            }
            else {
                state.beforeParams = true;
                return "builtin";
            }
        }
        // is it a operator?
        else if (isOperatorChar.test(ch)) {
            stream.eatWhile(isOperatorChar);
            return "operator";
        }
        else {
            // get the whole word
            stream.eatWhile(/[\w\$_{}]/);
            var word = stream.current().toLowerCase();
            // is it one of the listed keywords?
            if (keywords && keywords.propertyIsEnumerable(word))
                return "keyword";
            // is it one of the listed functions?
            if (functions && functions.propertyIsEnumerable(word) ||
                stream.current().match(/^#[a-z0-9_]+ *$/i) && stream.peek()=="(") {
                state.beforeParams = true;
                return "keyword";
            }
            // default: just a "word"
            return null;
        }
    }

    function tokenString(quote) {
        return function(stream, state) {
            var escaped = false, next, end = false;
            while ((next = stream.next()) != null) {
                if (next == quote && !escaped) {
                    end = true;
                    break;
                }
                escaped = !escaped && next == "\\";
            }
            if (end) state.tokenize = tokenBase;
            return "string";
        };
    }

    function tokenComment(stream, state) {
        var maybeEnd = false, ch;
        while (ch = stream.next()) {
            if (ch == "#" && maybeEnd) {
                state.tokenize = tokenBase;
                break;
            }
            maybeEnd = (ch == "*");
        }
        return "comment";
    }

    function tokenUnparsed(stream, state) {
        var maybeEnd = 0, ch;
        while (ch = stream.next()) {
            if (ch == "#" && maybeEnd == 2) {
                state.tokenize = tokenBase;
                break;
            }
            if (ch == "]")
                maybeEnd++;
            else if (ch != " ")
                maybeEnd = 0;
        }
        return "meta";
    }
    // Interface

    return {
        startState: function() {
            return {
                tokenize: tokenBase,
                beforeParams: false,
                inParams: false
            };
        },

        token: function(stream, state) {
            if (stream.eatSpace()) return null;
            return state.tokenize(stream, state);
        }
    };
});

CodeMirror.defineMIME("text/velocity", "velocity");
