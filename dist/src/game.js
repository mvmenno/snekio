"use strict";
exports.__esModule = true;
var BABYLON = require("babylonjs");
var GUI = require("babylonjs-gui");
var scene_1 = require("./scene");
var geometry_1 = require("./geometry");
var Game = /** @class */ (function () {
    function Game() {
        var _this = this;
        this.canvas = document.getElementById("renderCanvas");
        this.snake = [];
        this.points = [];
        this.velocity = new BABYLON.Vector3(0, 0, 0);
        this.mouse = { x: 0, y: 0 };
        this.drawCircles = [];
        this.engine = new BABYLON.Engine(this.canvas, true);
        var self = this;
        this.scene = new scene_1.Scene(this.engine);
        this.geometry = new geometry_1.Geometry(this.scene);
        this.scene.onPointerObservable.add(function (pointerInfo) {
            _this.mouse = pointerInfo.pickInfo.ray.direction;
        });
        this.createMaterial();
        this.createSnake();
        this.createGUI();
        this.world = {
            width: 4,
            height: 4
        };
        var scene = this.scene;
        this.createBoundingBox();
        this.engine.runRenderLoop(function () {
            self.update();
            scene.render();
        });
    }
    Game.prototype.createMaterial = function () {
        var mat = new BABYLON.StandardMaterial("snakeMat", this.scene);
        mat.diffuseColor = new BABYLON.Color3(0, 0, 0);
        this.snakeMat = mat;
        return mat;
    };
    Game.prototype.drawCircle = function (position, radius, color, index) {
        if (color === void 0) { color = new BABYLON.Color3(1, 1, 1); }
        var detail = 100;
        var c = 4 / 3 * (Math.sqrt(2) - 1);
        var f = 1;
        var p = [
            new BABYLON.Vector3(f, 0, 0),
            new BABYLON.Vector3(f, c, 0),
            new BABYLON.Vector3(c, f, 0),
            new BABYLON.Vector3(0, f, 0),
            new BABYLON.Vector3(-c, f, 0),
            new BABYLON.Vector3(-f, c, 0),
            new BABYLON.Vector3(-f, 0, 0),
            new BABYLON.Vector3(-f, -c, 0),
            new BABYLON.Vector3(-c, -f, 0),
            new BABYLON.Vector3(0, -f, 0),
            new BABYLON.Vector3(c, -f, 0),
            new BABYLON.Vector3(f, -c, 0),
            new BABYLON.Vector3(f, 0, 0)
        ];
        /*   for (var i = 0; i < p.length; i++) {
               p[i] = p[i].add(position);
           }
        */
        radius = radius;
        var arcA = BABYLON.Curve3.CreateCubicBezier(p[0], p[1], p[2], p[3], detail);
        var arcB = BABYLON.Curve3.CreateCubicBezier(p[3], p[4], p[5], p[6], detail);
        var arcC = BABYLON.Curve3.CreateCubicBezier(p[6], p[7], p[8], p[9], detail);
        var arcD = BABYLON.Curve3.CreateCubicBezier(p[9], p[10], p[11], p[12], detail);
        var arcCurve1 = arcA["continue"](arcB);
        var arcCurve2 = arcC["continue"](arcD);
        var arcCurve = arcCurve1["continue"](arcCurve2);
        if (!this.drawCircles[index]) {
            //  var cubicBezierCurve = BABYLON.Mesh.CreateLines("cbezier", arcCurve.getPoints(), this.scene);
            var filled_hex = BABYLON.Mesh.CreateRibbon("hex", [arcCurve.getPoints()], true, false, 0, this.scene);
            //  cubicBezierCurve.color = new BABYLON.Color3(1, 1, 1);
            //  cubicBezierCurve.scaling = new BABYLON.Vector3(radius, radius, 0);
            var mat = this.createMaterial();
            mat.emissiveColor = color;
            filled_hex.material = mat;
            filled_hex.scaling = new BABYLON.Vector3(radius, radius, 0);
            this.drawCircles[index] = {
                ribbon: filled_hex
            };
        }
        else {
            var drawCircle = this.drawCircles[index];
            this.drawCircles[index].ribbon.position = position;
        }
    };
    Game.prototype.clearScene = function () {
        for (var i = 0; i < this.drawCircles.length; i++) {
            //  this.drawCircles[i].lines.dispose();
            this.drawCircles[i].ribbon.dispose();
        }
    };
    Game.prototype.checkCollision = function () {
        var snakePos = this.snake[0];
        var x1 = snakePos.x;
        var y1 = snakePos.y;
        for (var i = 0; i < this.points.length; i++) {
            var point = this.points[i];
            var distance = Math.sqrt(Math.pow(x1 - point.vector.x, 2) + Math.pow(y1 - point.vector.y, 2));
            if (distance < 0.1) {
                this.points.splice(i, 1);
                this.snake.push(new BABYLON.Vector3(0, this.snake.length * 0.0001, 0));
            }
        }
        for (var i = this.snake.length - 1; i >= 3; i--) {
            var point2 = this.snake[i];
            var distance = Math.sqrt(Math.pow(x1 - point2.x, 2) + Math.pow(y1 - point2.y, 2));
            if (distance < 0.1) {
                this.reset();
                break;
            }
        }
    };
    Game.prototype.reset = function () {
        this.snake = [];
        this.points = [];
        this.drawCircles = [];
        this.mouse = { x: 0, y: 0 };
        this.velocity = new BABYLON.Vector3();
        this.scene.dispose();
        new Game();
    };
    Game.prototype.createBoundingBox = function () {
        var boundingMesh = new BABYLON.Mesh("boundingMesh", this.scene);
        var width = 0.02;
        var positions = [];
        var p1 = [-this.world.width, -this.world.height, 0];
        var p2 = [this.world.width, -this.world.height, 0];
        var p3 = [-this.world.width, this.world.height, 0];
        var p4 = [this.world.width, this.world.height, 0];
        var p5 = [-this.world.width - width, -this.world.height - width, 0];
        var p6 = [this.world.width + width, -this.world.height - width, 0];
        var p7 = [-this.world.width - width, this.world.height + width, 0];
        var p8 = [this.world.width + width, this.world.height + width, 0];
        var positions = positions.concat(p1, p2, p3, p4, p5, p6, p7, p8);
        var indices = [0, 1, 2, 3, 4, 5, 6, 7];
        var vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.applyToMesh(boundingMesh);
        var mat = new BABYLON.StandardMaterial("boundingMay", this.scene);
        mat.emissiveColor = new BABYLON.Color3(1, 0, 0);
        boundingMesh.material = mat;
    };
    Game.prototype.createGUI = function () {
        var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        var score = new GUI.TextBlock();
        score.text = "Score: ";
        score.color = "#fff";
        score.transformCenterY = -10;
        advancedTexture.addControl(score);
        this.score = score;
    };
    Game.prototype.createSnake = function () {
        var length = 3;
        var addLength = 0.0001;
        var currentLength = 0;
        for (var i = 0; i < length; i++) {
            this.snake.push(new BABYLON.Vector3(0, currentLength, 0));
            currentLength += addLength;
        }
        this.snakeColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
    };
    Game.prototype.drawScore = function () {
        this.score.text = "Score: " + this.snake.length;
    };
    Game.prototype.drawSnake = function () {
        var snakeColor = this.snakeColor;
        for (var i = 0; i < this.snake.length; i++) {
            this.drawCircle(this.snake[i], 0.075, snakeColor, i);
        }
    };
    Game.prototype.createPoints = function () {
        while (this.points.length < 250) {
            var color = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
            var position = new BABYLON.Vector3();
            var maxWidth = this.world.width;
            var maxHeight = this.world.height;
            var posX = (Math.random() * maxWidth) - (maxWidth / 2);
            var posY = (Math.random() * maxHeight) - (maxHeight / 2);
            //posX = (posX / maxWidth) * 10 - 1;
            // posY = (posY / maxHeight) * 10 - 1;
            var point = {
                vector: new BABYLON.Vector3(posX, posY, 0),
                color: new BABYLON.Color3(Math.random(), Math.random(), Math.random())
            };
            this.points.push(point);
        }
    };
    Game.prototype.drawPoints = function () {
        for (var i = 0; i < this.points.length; i++) {
            var point = this.points[i];
            this.drawCircle(point.vector, 0.025, point.color, (this.snake.length + i));
        }
    };
    Game.prototype.update = function () {
        this.createPoints();
        var x1 = this.mouse.x + this.snake[0].x;
        var y1 = this.mouse.y + this.snake[0].y;
        var x2 = this.snake[0].x;
        var y2 = this.snake[0].y;
        var dx = x1 - x2;
        var dy = y1 - y2;
        var angle = Math.atan2(dy, dx);
        var d = 0.05;
        var snake = this.snake;
        var force = 0.018;
        var distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        // 
        this.velocity.x = force * Math.cos(angle);
        this.velocity.y = force * Math.sin(angle);
        //if(distance > 0.5){
        for (var i = snake.length - 1; i >= 1; i--) {
            this.snake[i].x = this.snake[i - 1].x - d * Math.cos(angle);
            this.snake[i].y = this.snake[i - 1].y - d * Math.sin(angle);
        }
        //  }
        for (var j = 0; j < snake.length; j++) {
            this.snake[j].x += this.velocity.x;
            this.snake[j].y += this.velocity.y;
        }
        // this.camera.position.x = this.snake[0].x * 100;
        //  this.camera.position.y = this.snake[0].y * 100;
        //this.camera.setTarget = this.snake[0];
        this.scene.camera.setTarget(this.snake[0]);
        this.checkCollision();
        this.drawPoints();
        this.drawSnake();
        this.drawScore();
        return this.scene;
    };
    return Game;
}());
var game = new Game();
//# sourceMappingURL=game.js.map