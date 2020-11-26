module.exports = function() { 
  require("./helpers.js")();
  require("./obs-helpers.js")();

  var randomCam;
  var randomCamActive = false;
  var randomCamTimeout;

  this.showRandomCam = function (obs, arr) {
    if (randomCamActive === true) {
      hideItemWithinScene(obs, randomCam, '- Sidebar Cam');
      clearTimeout(randomCamTimeout);
    } else {
      hideItemWithinScene(obs, '- Sidebar Game', '- Sidebar Cam');
    }

    randomCam = randomElementFromArray(arr);
    showItemWithinScene(obs, randomCam, '- Sidebar Cam');
    randomCamActive = true;
    randomCamTimeout = setTimeout(hideRandomCam, 10000, obs);
  }

  hideRandomCam = function (obs) {
    hideItemWithinScene(obs, randomCam, '- Sidebar Cam');
    showItemWithinScene(obs, '- Sidebar Game', '- Sidebar Cam');
    randomCamActive = false;
  }
};
