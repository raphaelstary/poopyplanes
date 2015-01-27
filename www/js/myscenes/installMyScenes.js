var installMyScenes = (function (SceneManager, PlayGame, SplashScreen, ChoosePlaneScreen, ChooseGameScreen, EndScreen) {
    "use strict";

    function installMyScenes(sceneServices) {
        // create your scenes and add them to the scene manager

        var sceneManager = new SceneManager();

        var splash = new SplashScreen(sceneServices);
        var choosePlane = new ChoosePlaneScreen(sceneServices);
        var chooseGame = new ChooseGameScreen(sceneServices);
        var playGame = new PlayGame(sceneServices);
        var end = new EndScreen(sceneServices);

        sceneManager.add(splash.show.bind(splash), true);
        //sceneManager.add(choosePlane.bind(choosePlane), true);
        //sceneManager.add(chooseGame.bind(chooseGame));
        sceneManager.add(playGame.show.bind(playGame));
        //sceneManager.add(end.show.bind(end));

        return sceneManager;
    }

    return installMyScenes;
})(SceneManager, PlayGame, SplashScreen, ChoosePlaneScreen, ChooseGameScreen, EndScreen);