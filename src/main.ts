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
            case 't':
                stage.renderTree = !stage.renderTree;
                break;
            // Create a circular pattern
            case 'c':
                for (var theta = 0; theta <= 2 * Math.PI; theta += 2 * Math.PI / 50) {
                    var x = stage.width / 2 + Math.cos(theta) * 300;
                    var y = stage.height / 2 + Math.sin(theta) * 300;
                    stage.bodies.push(new BarnesHut.Body(new BarnesHut.Point(x, y), 5));
                }
                break;
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
