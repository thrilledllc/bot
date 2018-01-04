(function (root, module) {
  'use strict'
	const fetch = require('fetch')
  const wdk = require('wikidata-sdk')
  
  module.exports = function (config, bot, channel, to, from, message) {
    const match = message.match(/(?:hodl)\s*([A-Z]*)/i)
    
    if (!match || match.length < 2) {
      return
    }
		const symbol = match[1]
		
    const url = "https://poloniex.com/public?command=returnTicker"
    const symbols = symbol.length > 0 ? [symbol] : ["BTC", "ETH", "LTC", "XRP", "STR"]
    
    fetch.fetchUrl(url, function (error, meta, body) {
       try {
         const jsonString = body.toString()
         const dictionary = JSON.parse(jsonString)
         var prices = []
         var maxPriceLen = 4
         for (var i = 0; i < symbols.length; i++) {
           const symbol = symbols[i].toUpperCase()
           const key = "USDT_" + symbol
           const result = dictionary[key]
           if (!result) {
             prices.push(" ???")
             continue
           }
           const priceString = result["last"]
           if (!priceString) {
             prices.push(" ???")
             continue
           }
           const price = parseFloat(priceString).toFixed(2)
           prices.push(price)
           maxPriceLen = Math.max(price.length, maxPriceLen)
         }
         var output = "```\n"
         for (var j = 0; j < prices.length; j++) {
           const symbol = symbols[j].toUpperCase()
           const price = prices[j]
           var spaces = "   "
           for (var i = 0; i < maxPriceLen - price.length; i++) {
             spaces = spaces + " "
           }
           output = output + symbol.replace("STR", "XLM") + spaces + "$" + price + "\n"
         }
         output = output + "```"
         bot.say(channel, output)
      } catch (e) {
        bot.say(channel, "failed " + e)
      }
    })
  }
  
}(this, typeof module === 'undefined' ? {} : module))
   