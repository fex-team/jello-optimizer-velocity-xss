var Velocity = require('velocityjs');
var codeGen = require('./codeGen.js');
var transform = require('./transform.js');

module.exports = function(content, file, settings) {

  var asts = Velocity.parse(content, {
    html: true,
    head: true,
    body: true,
    script: true,
    style: true,
    extends: true,
    block: true,
    filter: true
  }, true);

  // return JSON.stringify(asts, null, 4);

  // console.log(asts);
  asts = transform(asts, settings);
  // console.log(asts)
  return codeGen(asts);
};

module.exports.defaultOptions = {

};
