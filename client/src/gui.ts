import * as GUI from 'babylonjs-gui';


export class Gui{
    
    private score: number = 0;
    
    private GUIScoreText: GUI.TextBlock;
    private GUIdeathNoteText: GUI.TextBlock;
    
    private GUINicknameTitle: GUI.TextBlock;
    private GUINickname: GUI.InputText;
    
    private GUIPlayButton: GUI.Button;
    private GUITitle: GUI.TextBlock;
    private GuiHighScores: GUI.Container;
    private GuiHighScoreContent: GUI.TextBlock;
    private nickName : string;
    
    private validPlayState : boolean = false;
    
    constructor(){
        //this.createScore();
    }
    
    createScore(){
        var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        
        var score = new GUI.TextBlock();
        score.text = "Score: "
        score.color = "#fff";
        
        score.width = "100px";
        score.height = "25px";
        
        score.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        score.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(score);
        this.GUIScoreText = score;
    }
    
    createMainMenuText(){
        var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        
        var title = new GUI.TextBlock();
        
        title.text = "Snek.IO"
        title.color = "#49a0de";
        title.fontSize = "72px";
        title.fontWeight = "bold";
        title.outlineWidth = 5;
        title.top = -100;
        title.shadowBlur = 20;
        title.shadowColor = "#000";
        title.shadowOffsetY = 14;
        
        this.GUITitle = title;
        advancedTexture.addControl(title);
    }
    createMainMenuTextField(){
        var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        
        var textFieldTitle = new GUI.TextBlock();
        textFieldTitle.text = "Nickname:";
        textFieldTitle.color = "#fff";
        textFieldTitle.top = -35;
         
        this.GUINicknameTitle = textFieldTitle;       
        var textField = new GUI.InputText();
        textField.width = "200px";
        textField.height = "40px";
        textField.text = "player";
        if(window.localStorage.getItem('nickName')){
            textField.text = window.localStorage.getItem('nickName');
            this.nickName = window.localStorage.getItem('nickName');
        }
        textField.color = "#fff";
        advancedTexture.addControl(textFieldTitle);
        advancedTexture.addControl(textField);
        
        var self = this;
        
        textField.onTextChangedObservable.add(function(e){
            self.nickName = textField.text;
            if(textField.text.length > 0){
                window.localStorage.setItem('nickName',textField.text);
            }
        });
        this.GUINickname = textField;
    }
    removeMainMenuElements(){
        this.GUINicknameTitle.dispose();
        this.GUINickname.dispose();
        this.GUITitle.dispose();
        this.GUIPlayButton.dispose();
    }
    triggerPlayState(){
        this.validPlayState = true;
    }
    
    getNickName(){
        return this.nickName;
    }
    
    getValidPlayState(){
        return this.validPlayState;
    }
    
    
    createMainMenuPlayButton(){
        var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        
        var playButton = GUI.Button.CreateSimpleButton("play-button","Play");        
     //   playButton.textBlock.text = "Play!";
    /*    playButton.background = "#59e639";
        
        playButton.color = "#fff";
        
        playButton.width = "120px";
        playButton.height = "40px";
        playButton.top = 60; */
        playButton.top = 60;
        playButton.width = "120px";
        playButton.height = "40px";
        
        playButton.color = "#000";
        playButton.background = "#59e639";
        playButton.textBlock.fontSize = "24px";
        playButton.textBlock.fontWeight = "bold";
        var self = this;    

        playButton.onPointerClickObservable.add(function(e){
            if (self.GUINickname.text.length > 0){
                self.triggerPlayState();
            }else{
                alert('Please enter a nickname!');
            }
        });
        advancedTexture.addControl(playButton);
        this.GUIPlayButton = playButton;
    }
    updateGUIHighScores(scores: [{nickName :string,score:number}]){
        if (!this.GuiHighScores){
                        
            var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

            
            var highScores = new GUI.Container();
            
            highScores.width = 0.1;
            highScores.height = 1;
            
            highScores.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            highScores.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            
         //   highScores.transformCenterY = -20;
            
            advancedTexture.addControl(highScores);
            
            var highScoreTitle = new GUI.TextBlock();
            highScoreTitle.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            highScoreTitle.top = 0;
            highScoreTitle.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            highScoreTitle.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

            highScoreTitle.text = "HighScores:";
            highScoreTitle.color = "#fff";
            highScores.addControl(highScoreTitle);
            
            
            var highScoreContent = new GUI.TextBlock();
            highScoreContent.color = "#fff";
            highScoreContent.name = "hs-content";
            highScoreContent.fontSize = "12px";
            highScoreContent.top  = 25;
           // highScoreContent.height= "300px";
            highScoreContent.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            highScoreContent.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            highScoreContent.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            this.GuiHighScoreContent = highScoreContent;
            highScores.addControl(highScoreContent);
            this.GuiHighScores = highScores;
        }
        var text = "";

        for(var i = 0; i < scores.length; i ++){
            text +=  scores[i].score+"  "+scores[i].nickName+"\n";
            if(i > 9){
                break;
            }
        }
        this.GuiHighScoreContent.text = text;

        
        
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