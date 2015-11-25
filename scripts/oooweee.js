(function (root, module) {
  'use strict';

  var lastMessage = 0;

  module.exports = function (config, bot, channel, to, from, message) {
    var match,
        rand,
        now = new Date(),
        phrase,
        urls,
        index;

    if (now - lastMessage < 5 * 1000) {
      return;
    }

    match = message.match(/\b[o]{2,}[h]*[\s]*[w]+[e]+\b/i);

    if (match) {
      lastMessage = now;
      rand = Math.random();
      if (rand < 0.05) {
        phrase = "HEY. WHAT'S GOING ON??? http://www.youtube.com/watch?v=6NXnxTNIWkc";
      } else {
        urls = ["http://i.imgur.com/rTLz8Ry.gif", "http://i.imgur.com/QR6ileH.gif", "http://i.imgur.com/SicfI9i.gif", "http://i.imgur.com/3RtPbab.gif", "http://i.imgur.com/2BHK9QE.gif", "http://i.imgur.com/wEA5w.gif"];
        index = Math.floor(urls.length * (rand - 0.05) / 0.95) % urls.length;
        phrase = "WHAT UP WITH THAT?? " + urls[index];
      }
      bot.say(channel, phrase);
    }
  };
}(this, typeof module === 'undefined' ? {} : module));
