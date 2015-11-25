(function (root, module) {
  'use strict';
  var fetch = require('fetch'),
    querystring = require('querystring'),
    CUSTOM_SEARCH_API_URL = 'https://www.googleapis.com/customsearch/v1',
    API_URL = 'http://ajax.googleapis.com/ajax/services/search/images',
    rateLimits = {// time in between usage
    },
    defaultRateLimit = 0,
    lastUse = {};
  
  
  function rateLimit(from) {
    var rl = (typeof rateLimits[from] !== 'undefined') ? rateLimits[from] : defaultRateLimit,
      lu = lastUse[from],
      now = new Date().getTime();
      
    if (!lu || now - lu > rl) {
      lastUse[from] = now;
      return false;
    }
    return rl - (now - lu);
  }
  
  function ensureImageExtension(url) {
    var ext;
    ext = url.split('.').pop();
    if (/(png|jpe?g|gif)/i.test(ext)) {
      return url;
    } else {
      return '' + url + "#.png";
    }
  }

  module.exports = function (config, bot, channel, to, from, message) {
    var match;
    
    function imageMe(query, animated) {
      var q, rateLimited, url;
      
      
      rateLimited = rateLimit(from);
      if (rateLimited) {
        bot.say(from, 'You\'ve been rate limited for ' + (rateLimited / 1000) + 's');
        return;
      }


      if (animated) {
        url = CUSTOM_SEARCH_API_URL;
        q = {
          q: query,
          searchType:'image',
          safe:'medium',
          fields:'items(link)',
          cx: config.google.cseId,
          key: config.google.apiKey,
          fileType: 'gif',
          hq: 'animated'
        }
      } else {
        url = API_URL;
        q = {
          v: '1.0',
          rsz: '8',
          q: query,
          safe: 'active'
        };
        //this no longer works, maybe again in the future
        // if (animated) {
        //   q.imgtype = 'animated';
        // } 
      }
      
      fetch.fetchUrl(url + '?' + querystring.stringify(q), function (err, meta, body) {
        var image, images;
        if (err) {
          bot.say(err.toString());
          return;
        }
        
        images = JSON.parse(body.toString());
        
        images = (images && images.responseData && images.responseData.results) || (images && images.items);
        if (images && images.length > 0) {
          image = images[Math.floor(Math.random() * images.length)];
          bot.say(channel, ensureImageExtension(image.unescapedUrl || image.link));
        } else {
          bot.say(channel, "I couldn't find anything for " + query);
        }
        
      });
    }
    

    
    match = message.match(/^(image|img)( me)? (.*)/i);
    if (match) {
      imageMe(match[3]);
    }
    
    match = message.match(/^(animate|gif)( me)? (.*)/i);
    if (match) {
      imageMe(match[3], true);
    }

  };
}(this, typeof module === 'undefined' ? {} : module));
