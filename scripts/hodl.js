(function (root, module) {
  'use strict'
	const rp = require('request-promise-native')
  const wdk = require('wikidata-sdk')
  let db = {};

  function percDelta(a, b) {
    var p = a / b
    var sign = a >= b ? '+' : '-'
    if (p === Infinity) {
      return 'infinity'
    }    
    p = 100.0 * Math.abs(p - 1.0)
    p = Math.round(p * 10) / 10.0
    return p + '%'
  }

  module.exports = function (config, bot, channel, to, from, message) {
    const match = message.match(/(?:hodl)\s*([A-Z]*)/i)

    if (!match || match.length < 2) {
      return
    }
		const symbol = match[1]

    
    const symbols = symbol.length > 0 ? [symbol] : ["BTC", "ETH", "LTC", "XRP", "STR", "XMR"]
    
    var fetchSymbol = function(symbol) {
      const url = 'https://poloniex.com/public?command=returnChartData&currencyPair=USDT_' + symbol + '&start=' + (Math.floor(Date.now() / 1000) - 86400).toString() + '&end=9999999999&period=1800'
      return rp(url)
    }
    var requests = symbols.map(fetchSymbol)
    Promise.all(requests).then(function(results) {
      var maxPriceLen = 4
      var maxDeltaLen = 4
      var maxPercLen = 4
      var i = 0
      var prices = []
      var deltas = []
      var deltaStrings = []
      var percs = []
      results.forEach(function(jsonString) {
        const array = JSON.parse(jsonString)
        if (array.length > 0) {
          const symbol = symbols[i]
          const yesterday = array[0].open
          const now = array[array.length - 1].close
          const delta = now - yesterday
          const deltaString = delta.toFixed(4).toString()
          deltaStrings.push(deltaString)
          const perc = percDelta(now, yesterday)
          percs.push(perc)
          const price = now.toFixed(4).toString()
          prices.push(price)
          deltas.push(delta)
          maxPriceLen = Math.max(price.length, maxPriceLen)
          maxDeltaLen = Math.max(deltaString.length, maxDeltaLen)
          maxPercLen = Math.max(perc.length, maxPercLen)
        }
        i++;
      });
      
      var output = "```\n" 
      for (var j = 0; j < prices.length; j++) {
        const symbol = symbols[j]
        const price = prices[j]
        var delta = deltas[j]
        const deltaString = deltaStrings[j]
        const perc = percs[j]
        
        var deltaSpaces = "  "
        for (var i = 0; i < maxDeltaLen - deltaString.length; i++) {
          deltaSpaces = deltaSpaces + " "
        }
        
        var percSpaces = "  "
        for (var l = 0; l < maxPercLen - perc.length; l++) {
          percSpaces = percSpaces + " "
        }

        if (delta > 0) {
          delta = '   🔼' + deltaSpaces + '$' + deltaString + percSpaces + ' (+' + perc + ')'
        } else if (delta === 0) {
          delta = ''
        } else {
          delta = '   🔽' + deltaSpaces + '$' + deltaString + percSpaces + ' (-' + perc + ')'
        }
        
        var spaces = "   "
        for (var k = 0; k < maxPriceLen - price.length; k++) {
          spaces = spaces + " "
        }
        
        output = output + symbol.replace("STR", "XLM") + spaces + "$" + price + delta + "\n"
      }
      output = output + "```"
      bot.say(channel, output)
    }).catch(function(err) {
      // Will catch failure of first failed promise
      bot.say(channel, 'sorry kiddo: ' + err)
    });
  }

}(this, typeof module === 'undefined' ? {} : module))

