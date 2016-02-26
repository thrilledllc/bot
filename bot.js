exports.Wrapper = Wrapper;

function Wrapper(nick, slackRTMClient) {
    var self = this;
    self.nick = nick;
    self.slackRTMClient = slackRTMClient;
}

Wrapper.prototype.say = function(channel, text) {
    this.slackRTMClient.sendMessage(text, channel);
}