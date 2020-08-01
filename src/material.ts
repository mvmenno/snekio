/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import * as BABYLON from 'babylonjs';


export class Material{
    
    private color: BABYLON.Color3 = new BABYLON.Color3(1,1,1);
    private scene: BABYLON.Scene;
    
    private materials: Array<BABYLON.StandardMaterial> = [];
    
    
    constructor(scene:BABYLON.Scene){
        this.scene = scene;
    }
    createMaterial(name:string){
        var mat = new BABYLON.StandardMaterial(name, this.scene);
        mat.diffuseColor = new BABYLON.Color3(0, 0, 0);
        mat.emissiveColor = this.color;
        
        var colorCat = this.color.r+this.color.g+this.color.b;
        
        if (!this.materials[colorCat]){
            this.materials[colorCat] = mat;
            return mat;
        }else{
            return this.materials[colorCat];
        }
    }
    setColor(color:BABYLON.Color3){
        this.color = color;
    }
}