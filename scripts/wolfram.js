(function (root, module) {
  'use strict';
  var fetch = require('fetch'),
    rules = [
      // function (message) {
      //   var match = message.match(/((define|who|what|when|where|why|how) .+)/ig);
      //   if (match) {
      //     return match[0];
      //   }
      // },
      function (message) {
        var match = message.match(/\!(.+)/i);
        if (match) {
          return match[1];
        }
      }
    ];

  function formatAnswer(answer) {
    return answer.replace(/\(According to[^\)]+\)/i,'').trim();
  }

  module.exports = function(config, bot, channel, to, from, message) {
    var ruleMatched = false;

    if (message.indexOf('!') !== 0) {
      return; // not direct msg
    }

    rules.forEach(function (rule) {
      var match = rule(message),
        url = 'http://api.wolframalpha.com/v2/query?input=' + encodeURIComponent(match) + '&appid=W5P33U-PHKH8Q57GV&output=json',
        apiResponse = {success: false};

      if (ruleMatched) {
        return;
      }
      if (match) {
        ruleMatched = true;
        console.log('fetching: ' + url);
        fetch.fetchUrl(url, function(error, meta, body){
          var noAnswer = true, fallbackAnswers = [];
          try {
            apiResponse = JSON.parse(body.toString()).queryresult;
          } catch(e) { }
          if (apiResponse.success === true && apiResponse.pods) {
            apiResponse.pods.forEach(function (pod) {
              if (((pod.primary && pod.primary === true) ||
                  (pod.id && pod.id.indexOf(':PeopleData') > -1)) &&
                  pod.subpods) { // stick to primary so we don't flood
                console.log('Wolfram found primary pod');
                pod.subpods.forEach(function (subpod) {
                  console.log('Wolfram sub-pod: ' + subpod.plaintext);
                  if (subpod.plaintext !== '') {
                    bot.say(channel, formatAnswer(subpod.plaintext));
                    noAnswer = false;
                  } else if (subpod.img && subpod.img.src) {
                    bot.say(channel, subpod.img.src);
                    noAnswer = false;
                  }
                });
              } else if (pod.scanner && pod.scanner !== 'Identity') {
                pod.subpods.forEach(function (subpod) {
                  if (subpod.plaintext !== '') {
                    fallbackAnswers.push(pod.title + ': ' + formatAnswer(subpod.plaintext));
                  }
                });
              }
            });
          }

          if (noAnswer && fallbackAnswers.length) {
            fallbackAnswers.forEach(function (answer) {
              bot.say(channel, answer);
            });
          } else if (noAnswer) { // give up
            bot.say(channel, 'I have no clue');
          }
        });
      }
    });
  };
}(this, typeof module === 'undefined'? {} : module));
