'use strict';
var fs = require('fs'),
  path = require('path'),
  Bot = require('./bot'),
  SlackRtmClient = require('@slack/client').RtmClient,
  SlackDataStore = require('@slack/client').MemoryDataStore,
  RTM_EVENTS = require('@slack/client').RTM_EVENTS,
  RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM,
  scriptsDir = __dirname + "/scripts/",
  scripts = [],
  scriptsLoaded = [],
  queue = [],
  config = require(__dirname+"/config");

fs.readdirSync(scriptsDir).filter(function (file) {
    return file.match(/^[^_].*\.js$/);
  }).map(function (file) {
    return path.basename(file, ".js");
  }).forEach(function (filename) {
    scripts.push(require(scriptsDir + filename));
    scriptsLoaded.push(filename);
  });

var autoReconnect = true,
  autoMark = true,
  slackDataStore = new SlackDataStore(config['slack']['token'], {logLevel: 'error'}),
  slackRTMClient = new SlackRtmClient(config['slack']['token'], {logLevel: 'error',  dataStore: slackDataStore}),
  slackWrapper = new Bot.Wrapper(config['bot']['name'], slackRTMClient),
  to = '';

slackRTMClient.start();

slackRTMClient.on(RTM_EVENTS.MESSAGE, function (message) {
  if (message.type === 'message' && message.text) {
    var user = slackDataStore.getUserById(message.user);
    var userName = user ? user.name : 'unknown';
    scripts.forEach(function (script) {
      script(config, slackWrapper, message.channel, to, userName, message.text);
    });
  }
});
