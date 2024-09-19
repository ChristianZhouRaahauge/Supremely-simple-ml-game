var redblock;
var g=10;
var dt=0.1;
var fullwidth=800;
var fullheight=600;
var vtyp=20;
var drag=0.1; //drag coefficent
var bounce=0.5;    //How much speed is kept when hitting a wall. 0=full stop, 1=full elastic (will fail then)
var Fx=0;   //tryk i x-retningen controlled by arrows
var Fy=0;   //tryk i y-retning, husk ned er positiv
var patience=0.95;   //the chance a random does not change direction

var step=0.00001; //size of random steps during machine learning
var caught=0; //to be briefly made 1 if the swarm catches their target
var penaltymean=0;      //the mean of the penalties

var n=0;    //dummy variabel
var t=0;    //dummy variable counting steps
var tarray=[100];   //An array containing the times of catching the target
var tmean=0;    //to be used for calculating mean times
var m=0;    //dummy variabel counting nr of times the blue army have caught the green block

var qweight1=math.zeros(4);       //for taking weighted mean of weights when updatin neural network

var pointmax=0;                    //for containing max points gained
var pointsarray=math.zeros(14);

var youcaught=0;
var itcaught=0;

var paused=0;       //can become one when paused
var bar1width=0.5


document.addEventListener("keydown",pressdown);
document.addEventListener("keyup",letgo);

function pressdown(event){      //if a key is pressed
    const key=event.keyCode;
  
    switch(key){
        case 37: //left arrow
            Fx=-1;
           
            break;
        case 38: //up arrow
            Fy=-1;
            break;
        case 39: //Right arrow
            Fx=1;
            break;
        case 40: //down arrow
            Fy=1;
            break;

    }
}

function letgo(event){
    
    switch(event.keyCode){
        case 37: //left arrow
            Fx=0;
            
            break;
        case 38: //up arrow
            Fy=0;
            break;
        case 39: //Right arrow
            Fx=0;
            break;
        case 40: //down arrow
            Fy=0;
            break;

    }

}
function startGame() {
    redblock=new component(25, 25, "red", 250, 350, 0, 0, 1);
    greenblock=new component(20,20, "green", 200,360, 20,0, 0);
    bluearmy=[new neural_component(10,10,"purple", 100,100,0,0),
    new neural_component(10,10,"blue", 150,150,0,0),
    new neural_component(10,10,"blue", 50,50,0,0),
    new neural_component(10,10,"blue", 200,200,0,0),
    new neural_component(10,10,"blue", 250,250,0,0),
    new neural_component(10,10,"blue",300,300,0,0),
    new neural_component(10,10,"blue",350,350,0,0),
    new neural_component(10,10,"blue",400,400,0,0),
    new neural_component(10,10,"blue",450,450,0,0),
    new neural_component(10,10,"blue",500,500,0,0),
    new neural_component(10,10,"blue",300,300,0,0),
    new neural_component(10,10,"blue",300,300,0,0),
    new neural_component(10,10,"blue",300,300,0,0),
    new neural_component(10,10,"blue",300,300,0,0)];

    for (var i = bluearmy.length - 1; i >= 0; i--) {
        bluearmy[i].randomize();
        bluearmy[i].randomize();
        bluearmy[i].randomize();
    }

    
    myGameArea.start();
    setWeightstring();

}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = fullwidth;
        this.canvas.height = fullheight;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval=setInterval(UpdateGameArea, 10);
    },
    clear : function(){
        this.context.clearRect(0,0, this.canvas.width, this.canvas.height);
    }
}



function component(width, height, color, x, y,vx,vy,player) {
    //player is either 1 (player controlled) or 0 (random controlled)
    this.width = width;
    this.height = height;
    //this.penalty=1; //Will be used for neural network. You get a penalty for distance from target
    this.x = x;
    this.y = y;  
    this.vx= vx;
    this.vy= vy;
    this.v2=vx**2+vy**2;
    this.ax=0;
    this.ay=0;

    

    
    this.move=function(){
        //this.v2=this.vx**2+this.vy**2;    //former speed squared
        if(player==1){  //player control
            this.ax=Fx*vtyp*(1+1/(this.v2+0.1));//-this.v2*drag*Math.sign(this.vx); //random acceleration and drag
            this.ay=Fy*vtyp*(1+1/(this.v2+0.1));//-this.v2*drag*Math.sign(this.vy);
        }else{  //randomly changes direction
            if(Math.random()>patience){
            //change direction occasionally
                this.ax=(Math.random()*2-1)*vtyp;
                this.ay=(Math.random()*2-1)*vtyp;
            }
        }
        this.vx=this.vx+this.ax*dt;
        this.vy=this.vy+this.ay*dt;      //updating speeds
        this.v2=this.vy**2+this.vx**2;
        this.x +=this.vx*dt+0.5*this.ax*(dt**2);
        this.y +=this.vy*dt+0.5*this.ay*(dt**2);

        if(this.x<0){
            this.vx*=-1*bounce;
            this.x*=-1;
            
        } else if(this.x>fullwidth-this.width){
            this.vx*=-1*bounce;
            this.x=2*(fullwidth-this.width)-this.x;
        }
        if(this.y<0){
            this.vy*=-1*bounce;
            this.y*=-1;
        }else if(this.y>fullheight-this.height){
            this.vy*=-1*bounce;
            this.y=2*(fullheight-this.height)-this.y;
        }
       
    }

    this.restart=function(){
        this.x=Math.random()*fullwidth;
        this.y=Math.random()*fullheight;
        this.vx=(Math.random()*1.8-0.9)*vtyp;
        this.vy=(Math.random()*1.8-0.9)*vtyp;
        this.ax=0;
        this.ay=0;
    }
     

    


    this.update = function(){
        ctx = myGameArea.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}


function UpdateGameArea(){

    if(paused==1){
        return;
    }
    myGameArea.clear();
    redblock.move();
    redblock.update();
    greenblock.move();

    
    if((redblock.x-greenblock.x)**2+(redblock.y-greenblock.y)**2<500){  //closer than 20 now
        greenblock.restart();   //greenblock disappears and reappears
        youcaught++;
        document.getElementById("yourscore").innerHTML="Red score: "+youcaught;
    }
    greenblock.update();
    for (var i = bluearmy.length - 1; i >= 0; i--) {
        bluearmy[i].calculate(redblock,greenblock);
        bluearmy[i].move();
        if(i==0){
        bluearmy[i].update();
        }
        
    }

    for (var i = 0; i < bluearmy.length; i++) {

        


        if((bluearmy[i].x-redblock.x)**2+(bluearmy[i].y-redblock.y)**2<500){    //caught by a blue
            caught=1;
                
            if(i==0){
                caught=2;//caught by main blue one
                    
                    

                    
            }
           
        break;
        }
    }
    if(caught>0){
            
        
            
            
        penaltymean=0;
        for (var i = bluearmy.length - 1; i >= 0; i--) {
                bluearmy[i].penalty=(bluearmy[i].x-greenblock.x)**2+(bluearmy[i].y-greenblock.y)**2;
                //penalties equals distance squared at the time they are caught.
                penaltymean+=bluearmy[i].penalty;       //to calculate the mean distance squared
        }

        penaltymean=penaltymean/bluearmy.length;    //mean distance squared

        if(caught==2){
            redblock.restart();    //only restart if nr 0 caught it
            itcaught++;
            document.getElementById("itsscore").innerHTML="Purple score: "+itcaught;
                
        }

        caught=0;                   //reset

        
           

            for (var i=bluearmy.length -1; i>=0; i--){  //NB, not counting nr 0

                if(n>30){
                

                if (bluearmy[i].penalty<penaltymean) {
                    pointsarray.set([i],pointsarray.get([i])+1);
                    
                }else if(bluearmy[i].penalty>penaltymean){
                    pointsarray.set([i],pointsarray.get([i])-1);
                    
                }
                if (pointsarray.get([i])<-5) {    //has been in the lower half too long
                    bluearmy[i].weight1=math.add(math.zeros(5),bluearmy[0].weight1);    //throw away this mutation
                         
                    console.log(" nr "+i+" has died out");
                    pointsarray.set([i],0);
                    bluearmy[i].randomize();  //randomize
                }

                    if(i!=0){

                        bluearmy[i].x=bluearmy[0].x;            //set back to nr 0
                        bluearmy[i].y=bluearmy[0].y;
                        bluearmy[i].vx=bluearmy[0].vx*0.99;
                        bluearmy[i].vy=bluearmy[0].vy*0.99;
                        console.log("updated");
                    }

                }else if(i!=0){ 
                        //In case it was caught in less than 20 steps, only reset
                    bluearmy[i].x=bluearmy[0].x;            //set back to nr 0
                    bluearmy[i].y=bluearmy[0].y;
                    bluearmy[i].vx=bluearmy[0].vx*0.99;
                    bluearmy[i].vy=bluearmy[0].vy*0.99;


                
                }
                
            }
            
            

            pointmax=math.max(pointsarray);     //max score. NB several might have this one

            for (var i = 0; i < bluearmy.length; i++) {     //start from 0 and count up
                if(pointsarray.get([i])==pointmax){
                    if(i==0){
                        pointsarray.set([0],pointsarray.get([0])-1);    //set back one
                        
                        break;  //then the 0'th already is ahead
                    }
                    bluearmy[0].weight1=bluearmy[i].weight1;       //change to this one.
                    bluearmy[i].randomize();    //randomize this one;
                    pointsarray.set([i],pointsarray.get([i])-5);
                    break;

                    
                }
            }

        n=0;
       
        

        

        


    }
    


    n+=1;

    if(n>100){
        n=0;
        dmin=(bluearmy[0].x-redblock.x)**2+(bluearmy[0].y-redblock.y)**2;
        dindex=0;
         for (var i=bluearmy.length -1; i>0; i--){
            di=(bluearmy[i].x-redblock.x)**2+(bluearmy[i].y-redblock.y)**2
            if (di<dmin){
                dmin=di;
                dindex=i;
            
            }


         }
         for (var i=bluearmy.length -1; i>=0; i--){
            bluearmy[i].weight1=bluearmy[dindex].weight1;

            bluearmy[i].x=bluearmy[0].x;            //set back to nr 0
            bluearmy[i].y=bluearmy[0].y;
            bluearmy[i].vx=bluearmy[0].vx;
            bluearmy[i].vy=bluearmy[0].vy;

            bluearmy[i].randomize();
            setWeightstring();
        }

    }

    

}


function setWeightstring(){
    weightstring="weights: ";
    weightarray=["Own position: ","Own velocity: ","Red position: ","Red velocity: ", "Green position: "];
    for (var i =0; i< 5;  i++) {
        weightstring = weightstring + "<br>"+weightarray[i]+math.floor((bluearmy[0].weight1.get([i])*1000000));
    }
    document.getElementById('values').innerHTML=weightstring;

}

function showExplanation(){
    if(paused==0){
        document.getElementById('exp').style.display='inline';
        paused=1;
        document.getElementById('pausebtn').innerHTML="Back to the game";

       setWeightstring();
    }else{
        document.getElementById('exp').style.display='none';
        paused=0;
        document.getElementById('pausebtn').innerHTML="So how does it work?";
    }

}



