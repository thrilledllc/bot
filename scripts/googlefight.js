(function (root, module) {
  'use strict';
  var fetch = require('fetch');
  
  function numberFormat(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  function getNum(q, next) {
    var url = 'https://www.google.com/search?q=' + escape(q);
    fetch.fetchUrl(url, function (err, meta, body) {
      var match;
      if (err) {
        return next(true);
      }
      match = body.toString().match(/<div .*id="resultStats">About ([0-9,]+)/m);
      if (match) {
        next(false, parseInt(match[1].split(',').join(''), 10));
      }
      next(true);
    });
  }
  
  module.exports = function (config, bot, channel, to, from, message) {
    var match;
    
    if (message.indexOf(bot.nick) !== 0) {
      return; // not direct msg
    }
    message = message.substr(bot.nick.length).trim();
    match = message.match(/(.+) vs (.+)/i);
    
    if (!match) {
      return;
    }
    getNum(match[1], function (err, n) {
      if (err) { return; }
      getNum(match[2], function (err, n2) {
        if (err) { return; }
        if (n > n2) {
          bot.say(channel, '"' + match[1] + '" wins!!! (' + numberFormat(n) + ' vs ' + numberFormat(n2) + ')');
        } else if (n < n2) {
          bot.say(channel, '"' + match[2] + '" wins!!! (' + numberFormat(n2) + ' vs ' + numberFormat(n) + ')');
        } else {
          bot.say(channel, 'IT\'S A TIE!!!');
        }
      });
    });
  };
}(this, typeof module === 'undefined' ? {} : module));
