(function (root, module) {
  'use strict';
  var fetch = require('fetch'),
    locationCache = {'philadelphia': [39.9522222, -75.1641667, 'Philadelphia, PA, USA']};

  module.exports = function(config, bot, channel, to, from, message) {
    function reportWeather(latitude, longitude, locationString) {
      var url = 'https://api.darksky.net/forecast/' +  config.forecast.apiKey + '/' + latitude + ',' + longitude;
      var options = null;
      fetch.fetchUrl(url, options, function(error, meta, body){
        if(error) {
          bot.say(channel, "I couldn't get the weather. Why don't you look outside?");
          bot.say(channel, error.toString());
        } else {
          var weather = JSON.parse(body.toString());
          var str = '';
          if (locationString) { 
            str+= '*Weather for ' + locationString + '*\n';
          } else {
            str+= '*Weather*\n';
          }
          str+= 'https://darksky.net/forecast/' + latitude + ',' + longitude+ '\n'
          if (weather.currently) {
            str+='*Right Now:* ' + Math.round(weather.currently.temperature) + ' degrees | ' + weather.currently.summary + '\n';
          }
          if (weather.minutely) {
            str+='*Next Hour:* ' + weather.minutely.summary + '\n';
          }
          if (weather.hourly) {
            str+='*Next 24 Hours:* ' + weather.hourly.summary + '\n';
          }
          if (weather.daily) {
            str+='*Next 7 Days:* ' + weather.daily.summary + '\n';
          }
          bot.say(channel, str);                                  
        }
      });
    }
    var match;

    if (message.indexOf(bot.nick) !== 0) {
      return; // not direct msg
    }

    match = message.match(/weather\s?(.+)?/i);
    
    if (match) {
      var query = match[1];
      if (!query) {
        query = 'philadelphia';
      }
      query = query.replace(/^(\s*)((\S+\s*?)*)(\s*)$/,"$2");

      var cachedLocation = locationCache[query];
      if (cachedLocation) {
        //console.log('using cached location ' + cachedLocation[2]);
        reportWeather(cachedLocation[0], cachedLocation[1], cachedLocation[2]);
      } else {
        var locationLookupURL = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(query) + '&key=' + config.google.apiKey;
        var locationLookupOptions = null;
        fetch.fetchUrl(locationLookupURL, locationLookupOptions, function(locationLookupError, meta, body){
          if(!locationLookupError) {
            var latitude = null;
            var longitude = null;
            var locationString = null;
            var locationResult = JSON.parse(body.toString());
            var locations = locationResult.results;
            if (locations.length > 0) {
              var location = locations[0];
              if (location.geometry && location.geometry.location) {
                latitude = location.geometry.location.lat;
                longitude = location.geometry.location.lng;
              }
              locationString = location.formatted_address;
            }
          }

          if (latitude && longitude) {
            locationCache[query] = [latitude, longitude, locationString];
            reportWeather(latitude, longitude, locationString);
          } else {
            bot.say(channel, "I couldn't get the weather. Why don't you look outside?");
            if (locationLookupError) {
              bot.say(channel, locationLookupError.toString());
            }
          }
        });
      }
    }
  };
}(this, typeof module === 'undefined'? {} : module));
