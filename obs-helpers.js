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
}
