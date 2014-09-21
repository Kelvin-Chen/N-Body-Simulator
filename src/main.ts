/// <reference path='stage.ts' />
/// <reference path='barnes-hut.ts' />

module Main {
    var run: boolean;

    function mainLoop(): void {
        setTimeout(function () {
            stage.render();

            // Pause/unpause loop
            if (!run) return window.requestAnimationFrame(mainLoop);

            // Actions for each frame
            stage.update();

            window.requestAnimationFrame(mainLoop);
        }, 1000/60); // Cap at 60 FPS
    }

    // Get key events
    window.onkeypress = (e: KeyboardEvent): void => {
        switch (String.fromCharCode(e.which)) {
            case ' ':
                run = !run;
                break;
        }
    }

    var stage = new Stage.Stage(window.innerWidth, window.innerHeight);

    // Start main loop
    window.requestAnimationFrame(mainLoop);
}
