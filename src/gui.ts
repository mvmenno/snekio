import * as GUI from 'babylonjs-gui';


export class Gui{
    
    private score: number = 0;
    
    private GUIScoreText: GUI.TextBlock;
    
    private GUIdeathNoteText: GUI.TextBlock;
    
    
    constructor(){
        this.createScore();
    }
    
    createScore(){
        var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        
        var score = new GUI.TextBlock();
        score.text = "Score: "
        score.color = "#fff";
        score.transformCenterY = -10;
        advancedTexture.addControl(score);
        this.GUIScoreText = score;
    }
    
    
    createDeathNote(){
        var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        var deathNote = new GUI.TextBlock();
     
        deathNote.text = "Game Over"
        deathNote.color = "#f00";
        deathNote.fontFamily ="Verdana";
        deathNote.fontSize = 64;
        deathNote.fontWeight = "bold";
        deathNote.outlineWidth = 10;
        deathNote.outlineColor = "#fff";
        
        
        advancedTexture.addControl(deathNote);
        
        this.GUIdeathNoteText = deathNote;
    }
    
    getDeathNote(){
        return this.GUIdeathNoteText;
    }
    showDeathNote(){
        this.createDeathNote();
    }
    removeDeathNote(){
        if (this.GUIdeathNoteText){
            this.GUIdeathNoteText.dispose();
            
            this.GUIdeathNoteText = null;
        }
    }
    
    
    
    getScore(){
        return this.score;
    }
    setScore(score:number){
        this.score = score;
        this.GUIScoreText.text = "Score: "+this.score;
    }
}