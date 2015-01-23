var installMyScenes = (function (SceneManager, PlayGame) {
    "use strict";

    function installMyScenes(sceneServices) {
        // create your scenes and add them to the scene manager

        var sceneManager = new SceneManager();

        var playGame = new PlayGame(sceneServices);

        sceneManager.add(playGame.show.bind(playGame));

        return sceneManager;
    }

    return installMyScenes;
})(SceneManager, PlayGame);