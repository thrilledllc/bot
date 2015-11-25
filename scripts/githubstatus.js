(function (root, module) {
  'use strict';
  var fetch = require('fetch'),
    STATUS_URL = 'https://status.github.com/api/last-message.json',
    TIME_FORMAT = 'dddd MMM dS h:mmtt UTC';

  require('datejs');
  

  module.exports = function (config, bot, channel, to, from, message) {

    message = message.toLowerCase();
    if (message === bot.nick + ' abe vigoda status') {
      fetch.fetchUrl('http://www.abevigoda.com/', function (error, meta, body) {
        var m;
        try {
          m = body.toString()
            .match(/<h1 class="premeta">Abe Vigoda is <span class="fixed">([^<]+)<\/span><\/h1>/);
          
          if (m) {
            bot.say(channel, 'Abe Vigoda is ' + m[1].trim());
          }
        } catch (e) {}
      });
    }
    
    
    if (message !== bot.nick + ' gh status' &&
        message !== bot.nick + ' github status') {
      return;
    }

    fetch.fetchUrl(STATUS_URL, function (error, meta, body) {
      try {
        body = JSON.parse(body.toString());
        bot.say(channel, 'GitHub Status: ' + body['status'] +
            ' as of ' + Date.parse(body['created_on']).toString(TIME_FORMAT));
        bot.say(channel, body['body']);
      } catch (e) {}
    });
  };
  
}(this, typeof module === 'undefined' ? {} : module));
   