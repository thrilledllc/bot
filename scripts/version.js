(function (root, module) {
  'use strict';

  var VERSION = new Date();

  module.exports = function (config, bot, channel, to, from, message) {
    if (message === 'zsupdogs version') {
      bot.say(channel, 'V: ' + VERSION);
    }
  };
}(this, typeof module === 'undefined' ? {} : module));
