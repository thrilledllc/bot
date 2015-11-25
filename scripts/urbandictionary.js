(function (root, module) {
  'use strict';
  var fetch = require('fetch'),
    API_URL = 'http://api.urbandictionary.com/v0/define?term=';
  

  module.exports = function (config, bot, channel, to, from, message) {
    var term;

    if (message.indexOf(bot.nick + ' what is ') !== 0) {
      return; // not direct msg
    }
    
    term = message.match(/what is a? ?(.+)/i);
    
    if (term) {
      term = encodeURIComponent(term[1]);
      fetch.fetchUrl(API_URL + term, function (err, meta, body) {
        if (err) {
          console.log(err);
          return;
        }
        try {
          body = JSON.parse(body.toString());
          if (body.list && body.list.length) {
            bot.say(channel, body.list[0].definition);
          } else {
            bot.say(channel, '¯\\_(ツ)_/¯');
          }
        } catch (e) {
          console.log(e);
        }
      });
    }
  };
}(this, typeof module === 'undefined' ? {} : module));
