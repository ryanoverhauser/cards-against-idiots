app.factory('audio', audio);

audio.$inject = ['ngAudio'];

function audio(ngAudio) {
    var muted = false;
    var sounds = {
        round: ngAudio.load("audio/round.mp3"),
        alert: ngAudio.load("audio/alert.mp3"),
        drip: ngAudio.load("audio/drip.mp3"),
        plink: ngAudio.load("audio/plink.mp3")
    };
    var service = {
        play: play,
        toggleMute: toggleMute,
        isMuted: isMuted
    };

    return service;

    function play(sound) {
        if (!muted) sounds[sound].play();
    }

    function toggleMute() {
        if (muted) {
            muted = false;
            console.log('unmuted');
        } else {
            muted = true;
            console.log('muted');
        }
    }

    function isMuted() {
        return muted;
    }

}
