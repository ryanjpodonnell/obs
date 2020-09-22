module.exports = function() { 
  this.showItemWithinScene = function (obs, item, scene) {
    obs.send('SetSceneItemProperties', {
      'item': item,
      'scene-name': scene,
      'visible': true
    });
  };

  this.hideItemWithinScene = function (obs, item, scene) {
    obs.send('SetSceneItemProperties', {
      'item': item,
      'scene-name': scene,
      'visible': false
    });
  };

  this.showItem = function (obs, item) {
    obs.send('SetSceneItemProperties', {
      'item': item,
      'visible': true
    });
  }

  this.hideItem = function (obs, item) {
    obs.send('SetSceneItemProperties', {
      'item': item,
      'visible': false
    });
  }

  this.setSidebarColor = function (obs, color) {
    var colorId;

    if (color === '!red') {
      colorId = 4278190335;
    } else if (color === '!aqua') {
      colorId = 4294967040;
    } else if (color === '!blue') {
      colorId = 4294901760;
    } else if (color === '!pink') {
      colorId = 4294902015;
    } else if (color === '!green') {
      colorId = 4278255360;
    } else if (color === '!orange') {
      colorId = 4278212095;
    } else if (color === '!purple') {
      colorId = 4286513237;
    } else if (color === '!yellow') {
      colorId = 4278255615;
    } else {
      colorId = 4278190080;
    }

    obs.send('SetSourceSettings', {
      'sourceName': 'PICK BG COLOR HERE',
      'sourceType': 'color_source_v2',
      'sourceSettings': { 'color': colorId }
    });
  }
}
