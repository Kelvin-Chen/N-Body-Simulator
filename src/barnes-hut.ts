module BarnesHut {
    export class Point {
        constructor(public x: number, public y: number) {}

        distanceTo(other: Point): number {
            return Math.sqrt(Math.pow(other.x - this.x, 2)
                   + Math.pow(other.y - this.y, 2));
        }
    }

    export interface Vector {
        x: number;
        y: number;
    }

    export class Body {
        force: Vector;
        velocity: Vector;
        static G = 6.673e-11;

        constructor(public location: Point, public mass?: number) {
            this.force = { x: 0, y: 0 };
            this.velocity = { x: 0, y: 0 };
            this.mass = mass || 10;
        }

        distanceTo(other: Body): number {
            return this.location.distanceTo(other.location);
        }

        // Combine two bodies at the center of mass
        add(other: Body): Body {
            var m = this.mass + other.mass;
            var x = (this.location.x * this.mass
                     + other.location.x * other.mass) / m;
            var y = (this.location.y * this.mass
                     + other.location.y * other.mass) / m;
            return new Body(new Point(x, y), m);
        }

        addForce(other: Body): void {
            var dx = other.location.x - this.location.x;
            var dy = other.location.y - this.location.y;
            var distance = this.distanceTo(other);

            // Law of universal gravitation F = GMm/r^2
            var force = Body.G * this.mass * other.mass / (distance * distance);

            this.force.x += force * dx / distance;
            this.force.y += force * dy / distance;
        }

        resetForce(): void {
            this.force.x = 0;
            this.force.y = 0;
        }

        // Update velocity/position for each frame
        update(): void {
            // Add acceleration (F/M) to velocity
            this.velocity.x += this.force.x / this.mass;
            this.velocity.y += this.force.y / this.mass;

            this.location.x += this.velocity.x;
            this.location.y += this.velocity.y;
        }

        equals(other: Body): boolean {
            return this.location.x === other.location.x
                   && this.location.y === other.location.y
                   && this.mass === other.mass;
        }

        render = (context: CanvasRenderingContext2D): void => {
            context.beginPath();
            // Set default radius to 10
            context.arc(this.location.x, this.location.y,
                                10, 0, 2 * Math.PI, false);
            context.fillStyle = 'grey';
            context.fill();
        }
    }

    export class Quadrant {
        // Set a margin to prevent too much quadrants from being created
        static MARGIN = 0.5;

        constructor(public center: Point, public width: number,
                    public height: number) {}

        contains(body: Body): boolean {
            var upperBound = this.center.y + this.height / 2 + Quadrant.MARGIN;
            var lowerBound = this.center.y - this.height / 2 - Quadrant.MARGIN;
            var rightBound = this.center.x + this.width / 2 + Quadrant.MARGIN;
            var leftBound = this.center.x - this.width / 2 - Quadrant.MARGIN;

            return leftBound <= body.location.x && body.location.x <= rightBound
                   && lowerBound <= body.location.y && body.location.y <= upperBound;
        }

        // Functions to get the quadrants in the quadrant
        topLeft(): Quadrant {
            var width = this.width / 2;
            var height = this.height / 2;
            var center = new Point(this.center.x - width / 2,
                                   this.center.y + height / 2);
            return new Quadrant(center, width, height);
        }

        topRight(): Quadrant {
            var width = this.width / 2;
            var height = this.height / 2;
            var center = new Point(this.center.x + width / 2,
                                   this.center.y + height / 2);
            return new Quadrant(center, width, height);
        }

        bottomRight(): Quadrant {
            var width = this.width / 2;
            var height = this.height / 2;
            var center = new Point(this.center.x + width / 2,
                                   this.center.y - height / 2);
            return new Quadrant(center, width, height);
        }

        bottomLeft(): Quadrant {
            var width = this.width / 2;
            var height = this.height / 2;
            var center = new Point(this.center.x - width / 2,
                                   this.center.y - height / 2);
            return new Quadrant(center, width, height);
        }
    }

    export class Quadtree {
        topLeft: Quadtree;
        topRight: Quadtree;
        bottomRight: Quadtree;
        bottomLeft: Quadtree;
        centerOfMass: Body;

        // Threshold that the ratio of the width of each node in the tree
        // and the distance between a body and the quadrant's center of mass
        // must be less than
        static THETA = 0.5

        constructor(public quadrant: Quadrant) {}

        // Is a bottom node, doesn't contain any other trees
        isExternal(): boolean {
            return !this.topLeft && !this.topRight
                   && !this.bottomLeft && !this.bottomRight;
        }

        // Recursively insert a body into the tree
        insert = (body: Body): void => {
            if (!this.centerOfMass) {
                this.centerOfMass = body;
            } else if (this.isExternal()) {
                // Create new quadrant for existing body if a body is being
                // added at the same level in the tree

                if (this.quadrant.topLeft().contains(this.centerOfMass)) {
                    this.topLeft = new Quadtree(this.quadrant.topLeft());
                    this.topLeft.insert(this.centerOfMass);
                } else if (this.quadrant.topRight().contains(this.centerOfMass)) {
                    this.topRight = new Quadtree(this.quadrant.topRight());
                    this.topRight.insert(this.centerOfMass);
                } if (this.quadrant.bottomLeft().contains(this.centerOfMass)) {
                    this.bottomLeft = new Quadtree(this.quadrant.bottomLeft());
                    this.bottomLeft.insert(this.centerOfMass);
                } else {
                    this.bottomRight = new Quadtree(this.quadrant.bottomRight());
                    this.bottomRight.insert(this.centerOfMass);
                }
                this.insert(body);
            } else {
                // Combine the center of mass with new body
                this.centerOfMass = this.centerOfMass.add(body);

                // Find sub-quadtree the body should go into
                // Create new quadtrees as necessary
                if (this.quadrant.topLeft().contains(body)) {
                    if (!this.topLeft) {
                        this.topLeft = new Quadtree(this.quadrant.topLeft());
                    }
                    this.topLeft.insert(body);
                } else if (this.quadrant.topRight().contains(body)) {
                    if (!this.topRight) {
                        this.topRight = new Quadtree(this.quadrant.topRight());
                    }
                    this.topRight.insert(body);
                } else if (this.quadrant.bottomRight().contains(body)) {
                    if (!this.bottomRight) {
                        this.bottomRight = new Quadtree(this.quadrant.bottomRight());
                    }
                    this.bottomRight.insert(body);
                } else {
                    if (!this.bottomLeft) {
                        this.bottomLeft = new Quadtree(this.quadrant.bottomLeft());
                    }
                    this.bottomLeft.insert(body);
                }
            }
        }

        updateForce(body: Body): void {
            if (this.isExternal() && !this.centerOfMass.equals(body)
                || this.quadrant.width / this.centerOfMass.distanceTo(body)
                < Quadtree.THETA) {

                body.addForce(this.centerOfMass);
            } else {
                if (this.topLeft) this.topLeft.updateForce(body);
                if (this.topRight) this.topRight.updateForce(body);
                if (this.bottomLeft) this.bottomLeft.updateForce(body);
                if (this.bottomRight) this.bottomRight.updateForce(body);
            }
        }
    }
}
