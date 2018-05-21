const {default: jsTokens, matchToToken} = require("js-tokens");

function getLineRange(text, pos) {
	// FIXME: should we handle \r?
	let start, end;
	start = text.lastIndexOf("\n", pos - 1) + 1;
	if (start < 0) {
		start = 0;
	}
	end = text.indexOf("\n", pos);
	if (end < 0) {
		end = text.length;
	}
	return {start, end};
}

function parseRegex(text) {
	var flags = text.match(/[a-z]*$/)[0];
	return new RegExp(text.slice(1, -(flags.length + 1)), flags);
}

function parseString(text) {
	if (text[0] == "'" || text[0] == "`") {
		text = '"' + text.slice(1, -1).replace(/([^\\]|$)"/g, '$1\\"') + '"';
	}
	return JSON.parse(text);
}

function parseDirective(text, pos = 0, flags = {}) {
	var match, token, info = {
		type: "$inline",
		start: null,
		end: null,
		params: []
	};
		
	jsTokens.lastIndex = pos;
	jsTokens.exec(text);	// skip $inline
	match = jsTokens.exec(text);
	if (match[0] == ".") {
		token = matchToToken(jsTokens.exec(text));
		if (token.type != "name") {
			throw new Error(`Expecting $inline method but got "${token.value}"`);
		} else {
			info.type += "." + token.value;
		}
		match = jsTokens.exec(text);
		if (!match) {
			info.end = text.length;
			return info;
		}
	}
	if (match[0] != "(") {
		info.end = jsTokens.lastIndex;
		return info;
	}
	flags.needValue = true;
	while ((match = jsTokens.exec(text))) {
		token = matchToToken(match);
		if (token.type == "whitespace" || token.type == "comment") {
			continue;
		}
		if (token.value == ")") {
			info.end = jsTokens.lastIndex;
			break;
		}
		if (flags.needValue == (token.type == "punctuator")) {
			throw new Error(`Failed to parse $inline statement at ${match.index}`);
		} else {
			flags.needValue = !flags.needValue;
			if (token.type == "punctuator") continue;
		}
		if (token.type == "regex") {
			token.value = parseRegex(token.value);
		} else if (token.type == "number") {
			token.value = +token.value;
		} else if (token.type == "string") {
			if (!token.closed) token.value += token.value[0];
			token.value = parseString(token.value);
		}
		info.params.push(token.value);
	}
	if (!info.end) {
		throw new Error("Missing right parenthesis");
	}
	return info;
}

function parseText(content) {
	const output = [];
	let lastIndex = 0;
	var re = /\$inline[.(]/gi,
		match, type, params, 
		flags = {};
		
	function addDirective(directive) {
		if (lastIndex !== directive.start) {
			output.push({
				type: "text",
				value: content.slice(lastIndex, directive.start)
			});
		}
		output.push(directive);
		lastIndex = directive.end;
	}

	while ((match = re.exec(content))) {
		({type, params, end: re.lastIndex} = parseDirective(content, match.index, flags));
		
		if (flags.skip) {
			if (type == "$inline.skipEnd" && (flags.skip === params[0] || flags.skip === true)) {
        flags.skip = false;
			}
			continue;
		}
		
		if (flags.start) {
			if (type != "$inline.end") {
				continue;
			}
			flags.start.end = getLineRange(content, match.index).start - 1;
			if (flags.start.start > flags.start.end) {
				throw new Error(`There must be at leat one line between $inline.start and $inline.end`);
			}
			addDirective(flags.start);
			flags.start = null;
			continue;
		}
		
		if (flags.open) {
			if (type != "$inline.close") {
				continue;
			}
			var offset = params && params[0] || 0;
			flags.open.end = match.index - offset;
			addDirective(flags.open);
			flags.open = null;
			continue;
		}
		
		if (type == "$inline.skipStart") {
      flags.skip = params[0] || true;
			continue;
		}
		
		if (type == "$inline.start") {
			flags.start = {
				type, params,
				start: getLineRange(content, match.index).end + 1
			};
			continue;
		}

		if (type == "$inline.open") {
			flags.open = {
				type, params,
				start: re.lastIndex + (params[1] || 0)
			};
			continue;
		}

		if (type == "$inline") {
			addDirective({
				type, params,
				start: match.index,
				end: re.lastIndex
			});
			continue;
		}
		
		if (type == "$inline.line") {
			var {start, end} = getLineRange(content, match.index);
			addDirective({
				type, params,
				start, end
			});
			continue;
		}
		
		if (type == "$inline.shortcut") {
			output.push({
				type, params
			});
			continue;
		}
		
		throw new Error(`${type} is not a valid $inline statement (position ${match.index})`);
	}
	
	if (lastIndex !== content.length) {
		output.push({
			type: "text",
			value: content.slice(lastIndex)
		});
	}

	if (flags.start) {
		throw new Error(`Failed to match $inline.start at ${flags.start.start}, missing $inline.end`);
	}
	
	if (flags.open) {
		throw new Error(`Failed to match $inline.open at ${flags.open.start}, missing $inline.close`);
	}
	
	return output;
}

function parsePipes(text) {
  const nameRe = /\s*((?:\\:|\\\||[^:|])+?)\s*([:|]|$)/y;
  const valueRe = /\s*((?:\\\||\\,|[^|,])+?)\s*([,|]|$)/y;
  const output = [];
  while (nameRe.lastIndex < text.length) {
    const match = text.match(nameRe);
    const pipe = {
      name: unescapePipeName(match[1]),
      args: []
    };
    output.push(pipe);
    if (match[2] === "|") {
      continue;
    }
    valueRe.lastIndex = nameRe.lastIndex;
    while (valueRe.lastIndex < text.length) {
      const match = text.match(valueRe);
      pipe.args.push(unescapePipeValue(match[1]));
      if (match[2] === "|") {
        break;
      }
    }
    nameRe.lastIndex = valueRe.lastIndex;
  }
  return output;
}

function unescapePipeName(text) {
  return text.replace(/\\([:|])/g, "$1");
}

function unescapePipeValue(text) {
  return text.replace(/\\([,|])/g, "$1");
}

function escapePipeName(text) {
  return text.replace(/[:|]/g, "\\$1");
}

function escapePipeValue(text) {
  return text.replace(/[,|]/g, "\\$1");
}

function pipesToString(pipes) {
  return pipes.map(pipe => {
    const name = escapePipeName(pipe.name);
    if (!pipe.args.length) {
      return name;
    }
    const args = pipe.args.map(escapePipeValue);
    return `${name}:${args.join(",")}`;
  }).join("|");
}

module.exports = {
  parseText, parsePipes, parseDirective,
  escapePipeName, escapePipeValue, pipesToString
};
