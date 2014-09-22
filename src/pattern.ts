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
}
