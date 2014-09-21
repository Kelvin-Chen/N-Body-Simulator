/// <reference path='barnes-hut.ts' />

module Stage {
    export class Stage {
        static count: number = 0;
        context: CanvasRenderingContext2D;
        bodies: BarnesHut.Body[];
        quadrant: BarnesHut.Quadrant;
        quadtree: BarnesHut.Quadtree;

        constructor(public width: number, public height: number) {
            this.bodies = [];
            this.quadrant = new BarnesHut.Quadrant(
                new BarnesHut.Point(this.width / 2, this.height / 2),
                                    this.width, this.height);

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
            this.quadtree = new BarnesHut.Quadtree(this.quadrant);
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
            if (this.quadtree)
                this.quadtree.render(this.context);
        }

        clear(): void {
            this.context.clearRect(0, 0, this.width, this.height);
        }
    }
}
