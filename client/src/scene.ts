import * as BABYLON from 'babylonjs';
export class Scene extends BABYLON.Scene {
    public camera: BABYLON.ArcRotateCamera;


    private particleSystem: BABYLON.ParticleSystem;

    constructor(engine: BABYLON.Engine) {
        super(engine);
        this.createScene();
    }
    public createScene() {
        this.camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(0, 0, 5), this);
        var color = new BABYLON.Color4(0, 0, 0, 1);
        this.clearColor = color;
        this.blockfreeActiveMeshesAndRenderingGroups = true;

        var particleSystem = new BABYLON.ParticleSystem("starParticles", 1000, this);

        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.5;

        particleSystem.minLifeTime = 0.3;
        particleSystem.maxLifeTime = 1.5;
        particleSystem.emitter = new BABYLON.Vector3(0, 0, -6);
        particleSystem.emitRate = 1500;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

        particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
        particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);

        // Angular speed, in radians
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;
        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 3;
        particleSystem.updateSpeed = 0.005;
        
        particleSystem.direction1 = new BABYLON.Vector3(-7, 8, -10);
        particleSystem.direction2 = new BABYLON.Vector3(7, 8, -20);


        particleSystem.start();
    }

    public render() {
        this.renderBackground();
        super.render();
    }

    public renderBackground() {





    }

}