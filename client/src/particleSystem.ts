/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
import * as BABYLON from 'babylonjs';

export class ParticleSystem{
    protected scene : BABYLON.Scene;
    protected world : {width: number ,height: number};
    protected SPSMirror: BABYLON.SolidParticleSystem;
    protected positionsSphere1: BABYLON.FloatArray;
    
    constructor(scene: BABYLON.Scene,world : {width: number ,height: number}){
        this.scene = scene;
        this.world = world;
    }
    createStarSystem(){
        

        var SPSMirror = new BABYLON.SolidParticleSystem('SPSMirror', this.scene);        
        let boxMirror = BABYLON.MeshBuilder.CreateSphere("SphereMirror", { segments: 1, diameter: 0.01 }, this.scene);
        boxMirror.isVisible = false;
        
        let MAX_SHAPES = 10000;
        SPSMirror.addShape(boxMirror, MAX_SHAPES);
        SPSMirror.buildMesh();
        let sphere2 = BABYLON.MeshBuilder.CreateSphere("Sphere2", { segments: 13, diameter: 10, updatable: true }, this.scene);
        let mat = new BABYLON.StandardMaterial("mat", this.scene);
        sphere2.material = mat;
        sphere2.isVisible = false;
        this.SPSMirror = SPSMirror;
        this.positionsSphere1 = sphere2.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    }
    updateSPS() : void{
        var SPSMirror = this.SPSMirror;
        var positionsSphere1 = this.positionsSphere1;
        let iMirrorParticel = 0;
        let MAX_SHAPES = 10000;
        for (let indexSphere1 = 0; indexSphere1 < positionsSphere1.length; indexSphere1 += 3) {
                SPSMirror.particles[iMirrorParticel].position.x = 2*(positionsSphere1[indexSphere1 + 0]);
                SPSMirror.particles[iMirrorParticel].position.y = 2*(positionsSphere1[indexSphere1 + 1]);
                SPSMirror.particles[iMirrorParticel].position.z = 2*(positionsSphere1[indexSphere1 + 2]);
                
                if (iMirrorParticel >= MAX_SHAPES)
                    break;
        }
        SPSMirror.setParticles();
    }
    
}