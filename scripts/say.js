(function (root, module) {
  'use strict';

  module.exports = function(config, bot, channel, to, from, message) {
    var match;
    if (message.indexOf(bot.nick) !== 0) {
      return; // not direct msg
    }
    match = message.match(/say <#([^\s]+)> (.+)?/i);
    if (match && match.length === 3) {
      bot.say(match[1], match[2]);
    }
  };
}(this, typeof module === 'undefined'? {} : module));