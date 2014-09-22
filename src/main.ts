/// <reference path='stage.ts' />
/// <reference path='pattern.ts' />

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
            case 't':
                stage.renderTree = !stage.renderTree;
                break;
            // Create a circular pattern
            case 'c':
                stage.bodies = stage.bodies.concat(
                    Pattern.circle(stage.width, stage.height));
                break;
            // Create ellipse
            case 'e':
                stage.bodies = stage.bodies.concat(
                    Pattern.ellipse(stage.width, stage.height));
                break;
            case 's':
                stage.bodies = stage.bodies.concat(
                    Pattern.square(stage.width, stage.height));
                break;
            case 'r':
                stage.bodies = [];
            case '[':
                stage.DT /= 10;
                break;
            case ']':
                stage.DT *= 10;
                break;
            default:
                console.log(e.which);
        }
    }

    var stage = new Stage.Stage(window.innerWidth, window.innerHeight);

    // Start main loop
    window.requestAnimationFrame(mainLoop);
}
