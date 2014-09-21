var BarnesHut;
(function (BarnesHut) {
    var Point = (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        Point.prototype.distanceTo = function (other) {
            return Math.sqrt(Math.pow(other.x - this.x, 2) + Math.pow(other.y - this.y, 2));
        };
        return Point;
    })();
    BarnesHut.Point = Point;

    var Body = (function () {
        function Body(location, mass) {
            var _this = this;
            this.location = location;
            this.mass = mass;
            this.render = function (context) {
                context.beginPath();
                context.arc(_this.location.x, _this.location.y, _this.radius(), 0, 2 * Math.PI, false);
                context.fillStyle = 'grey';
                context.fill();
            };
            this.force = { x: 0, y: 0 };
            this.velocity = { x: 0, y: 0 };
            this.mass = mass || 10;
        }
        Body.prototype.radius = function () {
            return Math.sqrt(this.mass / Body.DENSITY / Math.PI);
        };

        Body.prototype.distanceTo = function (other) {
            return this.location.distanceTo(other.location);
        };

        Body.prototype.add = function (other) {
            var m = this.mass + other.mass;
            var x = (this.location.x * this.mass + other.location.x * other.mass) / m;
            var y = (this.location.y * this.mass + other.location.y * other.mass) / m;
            return new Body(new Point(x, y), m);
        };

        Body.prototype.addForce = function (other) {
            var dx = other.location.x - this.location.x;
            var dy = other.location.y - this.location.y;
            var distance = this.distanceTo(other);

            var force = Body.G * this.mass * other.mass / (distance * distance + Body.EPS * Body.EPS);

            this.force.x += force * dx / distance;
            this.force.y += force * dy / distance;
        };

        Body.prototype.resetForce = function () {
            this.force.x = 0;
            this.force.y = 0;
        };

        Body.prototype.update = function (DT) {
            DT = DT || 1;

            this.velocity.x += this.force.x / this.mass * DT;
            this.velocity.y += this.force.y / this.mass * DT;

            this.location.x += this.velocity.x * DT;
            this.location.y += this.velocity.y * DT;
        };

        Body.prototype.equals = function (other) {
            return this.location.x === other.location.x && this.location.y === other.location.y && this.mass === other.mass;
        };
        Body.G = 6.673e-11;
        Body.EPS = 1e5;
        Body.DENSITY = 2 / (5 * Math.PI);
        return Body;
    })();
    BarnesHut.Body = Body;

    var Quadrant = (function () {
        function Quadrant(center, width, height) {
            var _this = this;
            this.center = center;
            this.width = width;
            this.height = height;
            this.render = function (context) {
                context.strokeStyle = 'blue';
                context.lineWidth = 1;
                context.strokeRect(_this.center.x - _this.width / 2, _this.center.y - _this.height / 2, _this.width, _this.height);
            };
        }
        Quadrant.prototype.contains = function (body) {
            var upperBound = this.center.y + this.height / 2;
            var lowerBound = this.center.y - this.height / 2;
            var rightBound = this.center.x + this.width / 2;
            var leftBound = this.center.x - this.width / 2;

            return leftBound <= body.location.x && body.location.x <= rightBound && lowerBound <= body.location.y && body.location.y <= upperBound;
        };

        Quadrant.prototype.topLeft = function () {
            var width = this.width / 2;
            var height = this.height / 2;
            var center = new Point(this.center.x - width / 2, this.center.y + height / 2);
            return new Quadrant(center, width, height);
        };

        Quadrant.prototype.topRight = function () {
            var width = this.width / 2;
            var height = this.height / 2;
            var center = new Point(this.center.x + width / 2, this.center.y + height / 2);
            return new Quadrant(center, width, height);
        };

        Quadrant.prototype.bottomRight = function () {
            var width = this.width / 2;
            var height = this.height / 2;
            var center = new Point(this.center.x + width / 2, this.center.y - height / 2);
            return new Quadrant(center, width, height);
        };

        Quadrant.prototype.bottomLeft = function () {
            var width = this.width / 2;
            var height = this.height / 2;
            var center = new Point(this.center.x - width / 2, this.center.y - height / 2);
            return new Quadrant(center, width, height);
        };
        return Quadrant;
    })();
    BarnesHut.Quadrant = Quadrant;

    var Quadtree = (function () {
        function Quadtree(quadrant) {
            var _this = this;
            this.quadrant = quadrant;
            this.insert = function (body) {
                if (!_this.centerOfMass) {
                    _this.centerOfMass = body;
                } else if (_this.isExternal()) {
                    if (_this.quadrant.topLeft().contains(_this.centerOfMass)) {
                        _this.topLeft = new Quadtree(_this.quadrant.topLeft());
                        _this.topLeft.insert(_this.centerOfMass);
                    } else if (_this.quadrant.topRight().contains(_this.centerOfMass)) {
                        _this.topRight = new Quadtree(_this.quadrant.topRight());
                        _this.topRight.insert(_this.centerOfMass);
                    } else if (_this.quadrant.bottomLeft().contains(_this.centerOfMass)) {
                        _this.bottomLeft = new Quadtree(_this.quadrant.bottomLeft());
                        _this.bottomLeft.insert(_this.centerOfMass);
                    } else {
                        _this.bottomRight = new Quadtree(_this.quadrant.bottomRight());
                        _this.bottomRight.insert(_this.centerOfMass);
                    }
                    _this.insert(body);
                } else {
                    _this.centerOfMass = _this.centerOfMass.add(body);

                    if (_this.quadrant.topLeft().contains(body)) {
                        if (!_this.topLeft) {
                            _this.topLeft = new Quadtree(_this.quadrant.topLeft());
                        }
                        _this.topLeft.insert(body);
                    } else if (_this.quadrant.topRight().contains(body)) {
                        if (!_this.topRight) {
                            _this.topRight = new Quadtree(_this.quadrant.topRight());
                        }
                        _this.topRight.insert(body);
                    } else if (_this.quadrant.bottomRight().contains(body)) {
                        if (!_this.bottomRight) {
                            _this.bottomRight = new Quadtree(_this.quadrant.bottomRight());
                        }
                        _this.bottomRight.insert(body);
                    } else {
                        if (!_this.bottomLeft) {
                            _this.bottomLeft = new Quadtree(_this.quadrant.bottomLeft());
                        }
                        _this.bottomLeft.insert(body);
                    }
                }
            };
            this.render = function (context) {
                if (_this.topLeft)
                    _this.topLeft.render(context);
                if (_this.topRight)
                    _this.topRight.render(context);
                if (_this.bottomLeft)
                    _this.bottomLeft.render(context);
                if (_this.bottomRight)
                    _this.bottomRight.render(context);
                _this.quadrant.render(context);
            };
        }
        Quadtree.prototype.isExternal = function () {
            return !this.topLeft && !this.topRight && !this.bottomLeft && !this.bottomRight;
        };

        Quadtree.prototype.updateForce = function (body) {
            if (this.isExternal() && !this.centerOfMass.equals(body) || this.quadrant.width / this.centerOfMass.distanceTo(body) < Quadtree.THETA) {
                body.addForce(this.centerOfMass);
            } else {
                if (this.topLeft)
                    this.topLeft.updateForce(body);
                if (this.topRight)
                    this.topRight.updateForce(body);
                if (this.bottomLeft)
                    this.bottomLeft.updateForce(body);
                if (this.bottomRight)
                    this.bottomRight.updateForce(body);
            }
        };
        Quadtree.THETA = 0.5;
        return Quadtree;
    })();
    BarnesHut.Quadtree = Quadtree;
})(BarnesHut || (BarnesHut = {}));
var Stage;
(function (_Stage) {
    var Stage = (function () {
        function Stage(width, height) {
            var _this = this;
            this.width = width;
            this.height = height;
            this.bodies = [];
            this.renderTree = false;
            this.DT = 1e8;

            var canvas = document.createElement('canvas');
            canvas.id = "stage" + Stage.count++;
            canvas.width = width;
            canvas.height = height;

            this.context = canvas.getContext('2d');

            document.body.appendChild(canvas);

            canvas.onclick = function (e) {
                _this.bodies.push(new BarnesHut.Body(new BarnesHut.Point(e.x, e.y)));
            };
        }
        Stage.prototype.update = function () {
            var _this = this;
            var maxx;
            var maxy;
            var minx;
            var miny;

            this.bodies.forEach(function (body) {
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
            this.bodies.forEach(function (body) {
                body.resetForce();
                _this.quadtree.updateForce(body);
                body.update(_this.DT);
            });
        };

        Stage.prototype.render = function () {
            var _this = this;
            this.clear();

            this.bodies.forEach(function (body) {
                body.render(_this.context);
            });

            if (this.renderTree && this.quadtree)
                this.quadtree.render(this.context);
        };

        Stage.prototype.clear = function () {
            this.context.clearRect(0, 0, this.width, this.height);
        };
        Stage.count = 0;
        return Stage;
    })();
    _Stage.Stage = Stage;
})(Stage || (Stage = {}));
var Main;
(function (Main) {
    var run;

    function mainLoop() {
        setTimeout(function () {
            stage.render();

            if (!run)
                return window.requestAnimationFrame(mainLoop);

            stage.update();

            window.requestAnimationFrame(mainLoop);
        }, 1000 / 60);
    }

    window.onkeypress = function (e) {
        switch (String.fromCharCode(e.which)) {
            case ' ':
                run = !run;
                break;
            case 't':
                stage.renderTree = !stage.renderTree;
                break;

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
    };

    var stage = new Stage.Stage(window.innerWidth, window.innerHeight);

    window.requestAnimationFrame(mainLoop);
})(Main || (Main = {}));
