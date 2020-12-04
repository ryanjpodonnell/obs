require('log-timestamp');
require('dotenv').config();
require("./helpers.js")();
require("./obs-helpers.js")();
require("./sidebar-cam.js")();

const ComfyJS = require('comfy.js');
const OBSWebSocket = require('obs-websocket-js');
const tmi = require('tmi.js');
const obs = new OBSWebSocket();
const client = new tmi.client({
  identity: {
    username: 'roddog_hogbot',
    password: process.env.RODDOGPASSWORD
  },
  channels: [
    'gametimetelevision'
  ]
});

obs.on('ConnectionOpened', () => {
  console.log('* Connection Opened');
  client.on('message', onMessageHandler);
  client.on('connected', onConnectedHandler);
  client.connect();

  ComfyJS.onReward = onRewardHander;
  ComfyJS.Init('gametimetelevision', process.env.OAUTH);

  var urkels = ['u1', 'u2', 'u3'];
  var timAllens = ['t1', 't2', 't3', 't4'];

  var commands = [
    '!red',
    '!aqua',
    '!blue',
    '!pink',
    '!green',
    '!orange',
    '!purple',
    '!yellow',
    '!setcolor',
    '!yabbadabbadoo',
    '!urkelcam',
    '!timallencam'
  ];

  function onRewardHander (user, reward, cost, extra) {
    console.log(`****** ${user} redeemed ${reward} for ${cost} ******`);

    if (reward === 'Bananas on Rod') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      showItemWithinScene(obs, 'bananas-rod', '- Logi Rod');
      setTimeout(hideItemWithinScene, 10000, obs, 'bananas-rod', '- Logi Rod');
    }

    if (reward === 'Bananas on Les') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      showItemWithinScene(obs, 'bananas-les', '- Logi Les');
      setTimeout(hideItemWithinScene, 10000, obs, 'bananas-les', '- Logi Les');
    }

    if (reward === 'Pokeball on Rod') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      showItemWithinScene(obs, 'pokeball-rod', '- Logi Rod');
      setTimeout(hideItemWithinScene, 10000, obs, 'pokeball-rod', '- Logi Rod');
    }

    if (reward === 'Pokeball on Les') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      showItemWithinScene(obs, 'pokeball-les', '- Logi Les');
      setTimeout(hideItemWithinScene, 10000, obs, 'pokeball-les', '- Logi Les');
    }

    if (reward === 'Böbl on Rod') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      showItemWithinScene(obs, 'bobl-rod', '- Logi Rod');
      setTimeout(hideItemWithinScene, 20000, obs, 'bobl-rod', '- Logi Rod');
    }

    if (reward === 'Böbl on Les') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      showItemWithinScene(obs, 'bobl-les', '- Logi Les');
      setTimeout(hideItemWithinScene, 20000, obs, 'bobl-les', '- Logi Les');
    }

    if (reward === 'BIGGER') {
      let width = null;
      let height = null;
      let scaleX = null;
      let scaleY = null;
      let positionX = null;
      let positionY = null;

      client.say('#gametimetelevision', `!yabbadabbaboo`);

      obs.send('GetSceneItemProperties',{
        'scene-name': '- Sidebar Big',
        'item': 'broccoli',
      }).then(data => {
        scaleX = (Math.round(data.scale.x * 10) / 10) + 0.1;
        scaleY = (Math.round(data.scale.y * 10) / 10) + 0.1;
        width = Math.floor(112 * scaleX);
        height = Math.floor(112 * scaleY);
        positionX = 1920 - (width);
        positionY = 1080 - (height);

        obs.send('SetSceneItemProperties',{
          'scene-name': '- Sidebar Big',
          'item': 'broccoli',
          'scale': { 'x': scaleX, 'y': scaleY },
          'position': { 'x': positionX, 'y': positionY }
        });
      });
    }

    if (reward === 'smaller') {
      let width = null;
      let height = null;
      let scaleX = null;
      let scaleY = null;
      let positionX = null;
      let positionY = null;

      client.say('#gametimetelevision', `!yabbadabbaboo`);

      obs.send('GetSceneItemProperties',{
        'scene-name': '- Sidebar Big',
        'item': 'broccoli',
      }).then(data => {
        scaleX = (Math.round(data.scale.x * 10) / 10) - 0.1;
        scaleY = (Math.round(data.scale.y * 10) / 10) - 0.1;
        width = Math.floor(112 * scaleX);
        height = Math.floor(112 * scaleY);
        positionX = 1920 - (width);
        positionY = 1080 - (height);

        if (scaleX > 0 && scaleY > 0) {
          obs.send('SetSceneItemProperties',{
            'scene-name': '- Sidebar Big',
            'item': 'broccoli',
            'scale': { 'x': scaleX, 'y': scaleY },
            'position': { 'x': positionX, 'y': positionY }
          });
        }
      });
    }

  }

  function onMessageHandler (target, context, msg, self) {
    console.log(`${context.username} - ${msg}`);
    const commandName = msg.trim().toLowerCase();

    if (commandName === '!commands') {
      client.say(target, `The INNOVATIVE commands are: ${commands.join(', ')}`);
    }

    if (commandName === '!urkelcam') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      showRandomCam(obs, urkels);
    }

    if (commandName === '!timallencam') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      showRandomCam(obs, timAllens);
    }

    if (commandName === '!bobl' || commandName === '!böbl') {
      client.say(target, `I am way better at Böbl than my man ChucklesW69. But you should follow him anyways.`);
      client.say(target, `http://twitch.tv/chucklesw73`);
      client.say(target, `https://morphcatgames.itch.io/bobl`);
    }

    if (commandName === '!red' ||
      commandName === '!aqua' ||
      commandName === '!blue' ||
      commandName === '!pink' ||
      commandName === '!green' ||
      commandName === '!orange' ||
      commandName === '!purple' ||
      commandName === '!yellow'
    ) {
      setSidebarColor(obs, commandName);
    }

    if (commandName.startsWith('!setcolor')) {
      var arr = commandName.split('#');
      if (arr.length !== 1) {
        var hex = arr[arr.length - 1]
        var r = hex.substring(4, 6);
        var g = hex.substring(2, 4);
        var b = hex.substring(0, 2);
        hex = parseInt(`ff${r}${g}${b}`, 16);
        if (hex >= 4278190080 && hex <= 4294967295) {
          setSidebarColor(obs, hex)
        }
      }
    }
  }

  function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);

    setSidebarColor(obs, 4278190080);

    obs.send('SetSceneItemProperties',{
      'scene-name': '- Sidebar Big',
      'item': 'broccoli',
      'scale': { 'x': 1, 'y': 1 },
      'position': { 'x': 1808, 'y': 968 }
    })
  }
});

obs.connect({ address: '10.0.1.57:4444', password: process.env.OBSPASSWORD});
