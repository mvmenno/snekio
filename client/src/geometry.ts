import * as BABYLON from 'babylonjs';
import {Material} from './material';

export class Geometry {
    
    private scene : BABYLON.Scene;
    private material : Material;
    public drawCircles: Array<{ribbon: BABYLON.Mesh}> = [];
    private lastRadius : number;
    
    constructor(scene:BABYLON.Scene,material:Material){
        this.scene = scene;
        this.material = material;
    }
    
    drawCircle(position: BABYLON.Vector3, radius: number, color: BABYLON.Color3 = new BABYLON.Color3(1, 1, 1),index  : number) {
        
        if (!this.drawCircles[index]){
                var detail = 1;
                var c = 0.552285;

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

                radius = radius;

                var arcA = BABYLON.Curve3.CreateCubicBezier(p[0], p[1], p[2], p[3], detail);
                var arcB = BABYLON.Curve3.CreateCubicBezier(p[3], p[4], p[5], p[6], detail);
                var arcC = BABYLON.Curve3.CreateCubicBezier(p[6], p[7], p[8], p[9], detail);
                var arcD = BABYLON.Curve3.CreateCubicBezier(p[9], p[10], p[11], p[12], detail);

                var arcCurve1 = arcA.continue(arcB);
                var arcCurve2 = arcC.continue(arcD);
                var arcCurve = arcCurve1.continue(arcCurve2);
                
                
                var filled_hex = BABYLON.Mesh.CreateRibbon("hex", [arcCurve.getPoints()], true, false, 0, this.scene);
	      
		
		var points = arcCurve.getPoints();
		
		
		for(var i =0 ; i < points.length / 3;i++){
		 //   colors.push(color4);
		}
		//var filled_hex = BABYLON.MeshBuilder.CreateRibbon("hex", { pathArray :[arcCurve.getPoints()]},this.scene );
		
		this.setColorMesh(filled_hex,color);
                //filled_hex.visibility = 0;
		
		
		this.material.setColor(color);
                var mat = this.material.createMaterial('snakemat');
		filled_hex.material = mat;
                filled_hex.scaling = new BABYLON.Vector3(radius, radius, 0);
                    this.drawCircles[index] = {
                        ribbon: filled_hex
                };
                this.drawCircles[index].ribbon.position = position;
		filled_hex.visibility = 1;
		this.lastRadius = radius;
            }else{
		//this.setColorMesh(this.drawCircles[index].ribbon,color);

                this.drawCircles[index].ribbon.position = position;	
                if(radius != this.lastRadius && radius != this.drawCircles[index].ribbon.scaling.x){
                    this.drawCircles[index].ribbon.scaling = new BABYLON.Vector3(radius,radius,0);
                }
            }
    }
    setColorMesh(mesh:BABYLON.Mesh,color:BABYLON.Color3){
	var colors = mesh.getVerticesData(BABYLON.VertexBuffer.ColorKind);
	if(!colors){
	    colors = [];
	    var positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
	    
	    for(var p = 0; p < positions.length / 3; p++) {
		colors.push(color.r, color.g, color.b, 1);
	    }
	}
	mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors);
	
	return mesh;
    }
    clearIndex(index:number){
        if(this.drawCircles[index]){
            this.drawCircles[index].ribbon.dispose();
        }
    }
    
    clearAll(){
        for (var i = 0; i < this.drawCircles.length;i++){
            if(this.drawCircles[i]){
                this.drawCircles[i].ribbon.dispose();
            }
        }
        
        
        this.drawCircles = [];
    }
}