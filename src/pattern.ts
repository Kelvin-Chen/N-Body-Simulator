/// <reference path='barnes-hut.ts' />

module Pattern {
    export function ellipse(width: number, height: number): BarnesHut.Body[] {
        var bodies: BarnesHut.Body[] = [];
        for (var theta = 0; theta < 2 * Math.PI; theta += 2 * Math.PI / 500) {
            var x = width / 2 + Math.cos(theta) * width / 2;
            var y = height / 2 + Math.sin(theta) * height / 2;
            bodies.push(new BarnesHut.Body(new BarnesHut.Point(x, y), 1));
        }
        return bodies;
    }

    export function circle(width: number, height: number): BarnesHut.Body[] {
        var bodies: BarnesHut.Body[] = [];
        for (var theta = 0; theta < 2 * Math.PI; theta += 2 * Math.PI / 500) {
            var x = width / 2 + Math.cos(theta) * height / 2;
            var y = height / 2 + Math.sin(theta) * height / 2;
            bodies.push(new BarnesHut.Body(new BarnesHut.Point(x, y), 1));
        }
        return bodies;
    }

    export function square(width: number, height: number): BarnesHut.Body[] {
        var bodies: BarnesHut.Body[] = [];
        for (var i = -25; i < 25; ++i) {
            for (var j = -25; j < 25; ++j) {
                var x = width / 2 + i * height / 50;
                var y = height / 2 + j * height / 50;
                bodies.push(new BarnesHut.Body(new BarnesHut.Point(x, y), 1));
            }
        }
        return bodies;
    }

    export function spiral(width: number, height: number): BarnesHut.Body[] {
        var bodies: BarnesHut.Body[] = [];
        var theta = 0;
        for (var i = 1; i <= 750; ++i) {
            var x = width / 2 + Math.cos(theta) * i / 2;
            var y = height / 2 + Math.sin(theta) * i / 2;
            bodies.push(new BarnesHut.Body(new BarnesHut.Point(x, y), 1));
            theta += 1.618033988749894848;
        }
        return bodies;
    }
}
