/// <reference path='barnes-hut.ts' />

module Stage {
    export class Stage {
        static count: number = 0;
        context: CanvasRenderingContext2D;
        bodies: BarnesHut.Body[];
        quadtree: BarnesHut.Quadtree;
        renderTree: boolean;

        constructor(public width: number, public height: number) {
            this.bodies = [];
            this.renderTree = false;

            var canvas = document.createElement('canvas');
            canvas.id = "stage" + Stage.count++;
            canvas.width = width;
            canvas.height = height;

            this.context = canvas.getContext('2d');

            document.body.appendChild(canvas);

            // Add new body at location of mouse click
            canvas.onclick = (e: MouseEvent): void => {
                this.bodies.push(new BarnesHut.Body(
                                 new BarnesHut.Point(e.x, e.y)));
            }
        }

        update(): void {
            var maxx: number;
            var maxy: number;
            var minx: number;
            var miny: number;

            this.bodies.forEach((body: BarnesHut.Body) => {
                maxx = Math.max(maxx, body.location.x) || body.location.x;
                maxy = Math.max(maxy, body.location.y) || body.location.y;
                minx = Math.min(minx, body.location.x) || body.location.x;
                miny = Math.min(miny, body.location.y) || body.location.y;
            });

            var dx = maxx - minx;
            var dy = maxy - miny;
            var center = new BarnesHut.Point(minx + dx / 2, miny + dy / 2);

            var quadrant = new BarnesHut.Quadrant(center, dx, dy);

            this.quadtree = new BarnesHut.Quadtree(quadrant);

            this.bodies.forEach(this.quadtree.insert);
            this.bodies.forEach((body: BarnesHut.Body) => {
                body.resetForce();
                this.quadtree.updateForce(body);
                body.update(1e9);
            });
        }

        render(): void {
            this.clear();

            // Render all the bodies
            this.bodies.forEach((body: BarnesHut.Body) => {
                body.render(this.context);
            });

            // Render trees
            if (this.renderTree && this.quadtree)
                this.quadtree.render(this.context);
        }

        clear(): void {
            this.context.clearRect(0, 0, this.width, this.height);
        }
    }
}
