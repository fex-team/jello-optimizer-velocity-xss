var codeGen = require('./codeGen.js'); 

function getVar(ast) {
  return ast.id + (ast.path ? ast.path.map(codeGen.gen).join('') : '');
};

function transform(ast, options) {

  var blacklist = options.blacklist || [];

  
  blacklist.unshift(/^esc/i);

  function hit(name) {
    var hited = false;

    blacklist.every(function(reg) {
      
      if (reg.test(name)) {
        hited = true;
        return false;
      }

      return true;
    });

    return hited;
  }

  return travel(ast, {
    enter: function(item, paths) {
      if (item.type === 'references') {
        var varName = getVar(item);

        if (hit(varName)) {
          return;
        }

        var method = 'html';

        paths.every(function(item) {
          if (item.type === 'script') {
            method = 'javascript';
            return false;
          }
          return true;
        });

        if (options.ignoreScript && method === 'javascript') {
          return;
        }

        return {
          type: 'references',
          id: 'esc',
          prue: true,
          leader: '$!',
          isWraped: true,
          path: [
            {
              type: 'method',
              id: method,
              args: [
                item
              ]
            }
          ]
        }
      }
    }
  });
}

function travel(ast, iterator) {
  return ast.map(function(item) {
    return _travel(item, [], iterator);
  });
};

function _travel(ast, paths, iterator) {

  if (typeof ast === 'string') {
    if (iterator.enter) {
      ast = iterator.enter(ast, paths) || ast;
    }

    if (iterator.leave) {
      ast = iterator.leave(ast, paths) || ast;
    }

    return ast;
  } else if (Array.isArray(ast)) {
    var root = ast.shift();

    root.body = ast;

    if (iterator.enter) {
      root = iterator.enter(root, paths) || root;
    }

    var fn = _travel[root.type];
    fn && (root = fn.call(_travel, root, paths, iterator) || root);

    if (root.body) {
      paths.push(root);

      root.body = root.body.map(function(item) {
        return _travel(item, paths, iterator);
      });

      paths.pop();
    }

    if (iterator.leave) {
      root = iterator.leave(root, paths) || ast;
    }

    return [root].concat(root.body);
  } else {
    if (iterator.enter) {
      ast = iterator.enter(ast, paths) || ast;
    }

    var fn = _travel[ast.type];
    fn && (ast = fn.call(_travel, ast, paths, iterator) || ast);

    if (iterator.leave) {
      ast = iterator.leave(ast, paths) || ast;
    }

    return ast;
  }
}

_travel['if'] = function(ast, paths, iterator) {
  // 不需要进去了，反正 if 什么的都不要 esc
};

module.exports = transform;
