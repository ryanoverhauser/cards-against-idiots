(function() {
  'use strict';

  angular
    .module('cati')
    .controller('MainController', MainController);

  MainController.$inject = ['$log', 'audio', 'socket', 'user'];

  function MainController($log, audio, socket, user) {

    var $ctrl = this;

    $ctrl.addAlert = addAlert;
    $ctrl.alerts = [];
    $ctrl.audio = audio;
    $ctrl.closeAlert = closeAlert;
    $ctrl.inGame = false;
    $ctrl.init = init;
    $ctrl.initialized = false;
    $ctrl.leaveGame = leaveGame;
    $ctrl.toggleMute = toggleMute;
    $ctrl.volume = {
      value: 50,
      prevValue: 50,
      options: {
        floor: 0,
        ceil: 100,
        hidePointerLabels: true,
        hideLimitLabels: true,
        onChange: onVolumeChange,
        showSelectionBar: true,
      }
    };

    // Set default volume
    audio.setVolume($ctrl.volume.value / 100);

    // // Auto init - For testing only
    // socket.emit('init', {name: 'foobar'});

    socket.on('alert', function(data) {
      addAlert(data);
    });

    socket.on('disconnect', function() {

    });

    socket.on('reconnect', function() {

    });

    socket.on('initialized', function (data) {
      user.init(data.userId, data.userName);
      $ctrl.initialized = true;
    });

    socket.on('joinedGame', function (data) {
      $ctrl.inGame = true;
    });

    socket.on('leftGame', function () {
      $ctrl.inGame = false;
    });

    //////

    function addAlert(alert) {
      $ctrl.alerts.push({
        type: alert.type || 'warning',
        msg: alert.msg
      });
    }

    function closeAlert(index) {
      $ctrl.alerts.splice(index, 1);
    }

    function init() {
      if ($ctrl.user.$valid) {
        socket.emit('init', {name: $ctrl.user.name});
      }
    }

    function leaveGame() {
      socket.emit('leaveGame');
      socket.emit('refreshLobby');
    }

    function onVolumeChange() {
      audio.setVolume($ctrl.volume.value / 100);
      $ctrl.volume.prevValue = $ctrl.volume.value;
    }

    function toggleMute() {
      if ($ctrl.volume.value) { // mute
        $ctrl.volume.value = 0;
        audio.setVolume(0);
      } else { // unmute
        $ctrl.volume.value = $ctrl.volume.prevValue;
        audio.setVolume($ctrl.volume.value / 100);
      }
    }

  }

})();
