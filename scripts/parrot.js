(function (root, module) {
  'use strict';
  var chanHist = {},
    banned;

  module.exports = function (config, bot, channel, to, from, message) {
    var hist;
    chanHist[channel] = chanHist[channel] || [];
    hist = chanHist[channel];
    
    hist.push({
      from: from,
      message: message
    });
    if (hist.length > 2) {
      hist.shift();
    }
    if (banned !== message) {
      banned = null;
    }
    if (hist.length > 1 &&
        hist[0].from !== hist[1].from &&
        hist[0].message === hist[1].message &&
        banned !== message) {
      banned = message;
      bot.say(channel, message);
    }
  };
}(this, typeof module === 'undefined' ? {} : module));