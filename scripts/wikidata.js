(function (root, module) {
  'use strict';
	const fetch = require('fetch');
  const wdk = require('wikidata-sdk');
  
  module.exports = function (config, bot, channel, to, from, message) {
    const match = message.match(/(is|has) (.+) (alive|dead|kicked the bucket|bought the farm).*/i);
    
    if (!match || match.length < 3) {
      return;
    }
		const humanName = match[2].replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
		
		bot.say(channel, "checking gravestones for " + humanName);
		
		
		const sparql = `
		SELECT DISTINCT ?dateOfDeath ?dateOfBirth
		WHERE {
			?human wdt:P31 wd:Q5.
			?human rdfs:label "${humanName}"@en.
			OPTIONAL { ?human wdt:P570 ?dateOfDeath. }
			OPTIONAL { ?human wdt:P569 ?dateOfBirth. }
		}
		`
		const url = wdk.sparqlQuery(sparql)
		if (!url) {
			return;
		}
    fetch.fetchUrl(url, function (error, meta, body) {
      try {
				const jsonString = body.toString();
        const jsonObj = JSON.parse(jsonString);
				const results = jsonObj['results'];
				if (!results) {
					bot.say(channel, "dunno about " + humanName);
					return;
				}
				const bindings = results['bindings'];
				if (!bindings || bindings.length == 0) {
					bot.say(channel, "dunno about " + humanName);
					return;
				}
				
				var dob;
				var dod;
				var i = 0;
				while (dob == null && dod == null && i < bindings.length) {
					var human = bindings[i];
					dob = human['dateOfBirth'];
					dod = human['dateOfDeath'];
					i++;
				}

				if (dob == null && dod == null) {
					bot.say(channel, "dunno about " + humanName);
				} else if (dob && dod) {
					bot.say(channel, "sorry, " + humanName + " is dead");
				} else {
					bot.say(channel, humanName + " is ALIVE");
				}
				
				
      } catch (e) {}
    });
  };
  
}(this, typeof module === 'undefined' ? {} : module));
   