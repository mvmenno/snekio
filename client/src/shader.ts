import * as BABYLON from 'babylonjs';

import {Scene} from './scene';

export class Shader{
    
    protected shader:any;
    protected plane: BABYLON.Mesh;
    protected bgPosition : BABYLON.Vector3;
    
    //protected newPos : BABYLON.Vector3;
    
    //protected oldPos : BABYLON.Vector3;
    protected shaderCreated : boolean = false;
    
 
    
    createShader(scene: Scene,world: {width: number ,height: number}){
        if(!this.shaderCreated){
        
        BABYLON.Effect.ShadersStore["basicVertexShader"] = `
        attribute vec3 position;
        attribute vec3 normal;
        attribute vec2 uv;

        uniform mat4 worldViewProjection;
        uniform float time;

        varying vec3 vPosition;
        varying vec2 vUV;

        void main() {
            vec4 p = vec4( position, 1. );
            vPosition = p.xyz;
            vUV = uv;	

            gl_Position = worldViewProjection * p;
        }
        `;

        BABYLON.Effect.ShadersStore["basicFragmentShader"] = `
        uniform vec2      iResolution;           // viewport resolution (in pixels)
        uniform float     iTime;                 // shader playback time (in seconds)
        uniform vec4      iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click
        
        varying vec3 vPosition;
        varying vec2      vUV;

        #define NUM_LAYERS 2.

        mat2 Rot(float a){
                float s=sin(a),c=cos(a);
            return mat2(c, -s, s, c);
        }

        float Hash21(vec2 p){
            p = fract(p*vec2(123.34,456.21));

            p += dot(p,p+45.32);
            return fract(p.x*p.y);
        }

        float Star(vec2 uv, float flare){
                float d = length(uv);

            float m = .05/d; //smoothstep(.1, .05, d);

            float rays =max(0.,1.-abs(uv.x * uv.y * 1000.));
            m += rays * .2* flare;
            uv *= Rot(3.1415/4.);
            rays =max(0.,1.-abs(uv.x * uv.y * 1000.));
            m += rays*.5* flare;

            m *= smoothstep(1.,.2,d);

                return m;
        }

        vec3 StarLayer(vec2 uv){

            vec3 col = vec3(0);
            vec2 gv = fract(uv)-.5;
            vec2 id = floor(uv);


            for(int y=-1;y<=1;y++){

                for(int x=-1;x<=1;x++){
                    vec2 offs = vec2(x,y);

                        float n = Hash21(id+offs);
                    float size = fract(n * 99.97);
                        float star = Star(gv-offs-vec2(n,fract(n*13.))+.5, smoothstep(.8,1.,size) * .2);
                        
                    //vec3 color = sin(vec3(.2,.3,.6)*fract(n*2995.2) * 123.2)*.5+.5;
                    vec3 color = sin(vec3(.2,.3,.6)*fract(n*2995.2) * 123.2)*.5+.9;

                    color = color * vec3(1.,.2,1.+size);

                    star *= sin(iTime*3.+n*6.2831)*.1+1.;

                    col += star*size*color;
                }
            }
            return col;

        }
        void mainImage( out vec4 fragColor, in vec2 fragCoord )
        {
            vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;

            vec2 M = (iMouse.xy-iResolution.xy*.5)/iResolution.y;           

            float t = iTime * .0005;

           // float t = 1.;
             //uv *=10.;
            uv *= Rot(-t);



            vec3 col = vec3(0);

            for(float i=0.; i<=1.;i+=1./NUM_LAYERS){
            
                float depth = fract(i + .1);

                float scale = mix(100.,.5,depth);

                float fade = depth * smoothstep(1.,.9,depth);
                //float fade = .5;
                
                
                col += StarLayer(uv * scale +i*432.32+M) * fade;
            }





           // if(gv.x >.48 || gv.y>.48) col.r=1.;
                //col.rg += id *.4;    

            //col += Hash21(id);

            fragColor = vec4(col,1.0);
        }
        void main(){
            mainImage(gl_FragColor, vUV * iResolution.xy);
        }
        `;
        
        const shader = new BABYLON.ShaderMaterial(
            "shader",
            scene,
            {
              vertex: "basic",
              fragment: "basic"
            },
            {
              attributes: ["position", "normal", "uv"],
              defines: ["precision highp float;"],
              uniforms: [
                "world",
                "worldView",
                "worldViewProjection",
                "view",
                "iTime",
                "iResolution",
                "iMouse"
              ]
            }
        );
        
        shader.setVector2("iResolution", new BABYLON.Vector2(1, 1));
        
        var time = 0;
       console.log(window.innerWidth);
        var plane = BABYLON.MeshBuilder.CreatePlane("plane", {width: 20,height:8},scene);
        //var plane = BABYLON.MeshBuilder.CreatePlane("ground1", {width: world.width,height:world.height}, scene);
        plane.position = new BABYLON.Vector3(0,0,-1.01); 
        
        this.bgPosition = plane.position;
        plane.material = shader;
       // plane.material.backFaceCulling = false;
        plane.material.backFaceCulling = false;
        this.plane = plane;
        
        scene.registerBeforeRender(() => {
            
            time += 0.01;
            
            shader.setFloat("iTime", time);

            shader.setVector4("iMouse", new BABYLON.Vector4(this.bgPosition.x,this.bgPosition.y,0,0));
            const aRatio = scene.getEngine().getAspectRatio(scene.camera);
            
            shader.setVector2("iResolution", new BABYLON.Vector2(aRatio, 1));
            
            this.plane.position = this.bgPosition;
           // shader.setVector2("iResolution", new BABYLON.Vector2(1, 1));
        });
        
            this.shaderCreated = true;        
        }
    }
    
    updateShader(snake : BABYLON.Vector3){
        this.bgPosition.x = snake.x;
        this.bgPosition.y = snake.y;
    }
    
    
}