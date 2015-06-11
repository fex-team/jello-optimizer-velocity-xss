function codeGen(asts) {
  return asts.map(codeGen.gen).join('');
};

codeGen.gen = function(item) {
  if (typeof item === 'string') {
    return item;
  } else if (Array.isArray(item)) {
    var block = item.shift();
    var fn = codeGen[block.type] || codeGen.block;
    return fn.call(codeGen, block, item);
  } else {
    var fn = codeGen[item.type] || codeGen['default'];
    return fn.call(codeGen, item);
  }
};

codeGen.block = function(block, items) {
  return '#' + block.type +
    '(' + (block.args ? block.args.map(codeGen.gen).join(' ') : '') +
    ')' + items.map(codeGen.gen).join('') + '#end';
};

codeGen['default'] = function(item) {
  return item.value;
};

codeGen['if'] = function(block, items) {
  return '#' + block.type + '(' + codeGen.gen(block.condition) + ')' +
    items.map(codeGen.gen).join('') + '#end';
};

codeGen['elseif'] = function(item) {
  return '#' + item.type + '(' + codeGen.gen(item.condition) + ')';
};

codeGen['else'] = function(item) {
  return '#' + item.type;
};

codeGen['foreach'] = function(block, items) {
  return '#' + block.type + '($' + block.to + ' in ' + codeGen.gen(block.from) + ')' +
    items.map(codeGen.gen).join('') + '#end';
};

codeGen.math = function(item) {
  var expression = item.expression;

  if (expression.length === 1) {
    return (item.operator === 'not' ? '!' : item.operator === 'minus' ? '-' : item.operator) + '' + codeGen.gen(expression[0]);
  }

  return codeGen.gen(expression[0]) + ' ' + item.operator + ' ' + codeGen.gen(expression[1]);
}

codeGen.references = function(item) {
  return item.leader +
    (item.isWraped ? '{' : '') + item.id +
      (item.path ? item.path.map(codeGen.gen).join('') : '') +
    (item.isWraped ? '}' : '');
};

codeGen.macro_call = function(item) {
  return '#' + item.id + '(' + (item.args ? item.args.map(codeGen.gen).join(' ') : '') +
      ')';
};

codeGen.string = function(item) {
  return '"' + item.value.replace(/"/g, '\\"') + '"';
};

codeGen.integer = function(item) {
  return item.value;
};

codeGen.property = function(item) {
  return '.' + item.id;
};

codeGen['method'] = function(item) {
  return '.' + item.id + '(' + (item.args ? item.args.map(codeGen.gen).join(', ') : '') + ')';
};

codeGen['set'] = function(item) {
  var equal = item.equal;
  return '#set(' + codeGen.gen(equal[0]) + ' = ' + codeGen.gen(equal[1]) + ')';
};

codeGen['array'] = function(item) {
  if (item.isRange) {
    return '[' + item.value[0] + '..' + item.value[1] + ']';
  }

  return '[' + item.value.map(codeGen.gen).join(', ') + ']';
};

codeGen['index'] = function(item) {
  return '[' + codeGen.gen(item.id) + ']'
};

codeGen['raw'] = function(item) {
  return '#[[' + item.value + ']]#';
};

module.exports = codeGen;
