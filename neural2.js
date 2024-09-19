//Here is a modified neural network.
//It takes as input: x, y, vx, vy, the distance to target along x: dx, same for y: dy, speed difference dvx and dvy
//It then calculates 2 outputs, which determine it's acceleration along the x and y direction.
//However, the weights must be symmetric in the x and y direction, so there only exist 4x4 of them.
// at last an output with 2 outputs: dax and day, controlling
//acceleration in the x and y direction

function neural_component(width, height, color, x, y,vx,vy) {
    //
    this.width = width;
    this.height = height;
    this.penalty=1; //Will be used for neural network. You get a penalty for distance from target
    this.x = x;
    this.y = y;  
    this.vx= vx;
    this.vy= vy;
    this.v2=vx**2+vy**2;
    this.ax=0;
    this.ay=0;

    this.q=0;

    this.inlayerx=math.zeros(5); 
    this.inlayery=math.zeros(5);
    //this.hiddenx=math.zeros(4);
    //this.hiddeny=math.zeros(4);
    this.outlayer=math.zeros(2);

    this.weight1=math.zeros(5);


    this.weight1.set([0],-0.001);
   
    



    this.randomize=function(){
        //adds a tiny random amount to a random part of the weight vector
        for (var i = 0; i <5; i++) {
            
        

        
        this.weight1.set([i],this.weight1.get([i])+(Math.random()*2-1)*step);
       
        }

        

    }


    this.calculate=function(target,target2){
    	//target is an object, which must also be a function like this one with speed and position
        //This calculation then calculates the movement of the object

    	this.inlayerx.set([0],((this.x-fullwidth/2)*0.1)**3); //position to the power of 3 to lessen the chance of getting stuck in a corner for extended periods
    	this.inlayery.set([0],((this.y-fullheight/2)*0.1)**3);
    	this.inlayerx.set([1],this.vx/vtyp*0.01);
    	this.inlayery.set([1],this.vy/vtyp*0.01);
    	this.inlayerx.set([2],(target.x-this.x)*fullwidth*10);
    	this.inlayery.set([2],(target.y-this.y)*fullheight*10);
    	this.inlayerx.set([3],(target.vx-this.vx)/vtyp);
    	this.inlayery.set([3],(target.vy-this.vy)/vtyp);
        this.inlayerx.set([4],(target2.x-this.x)/fullwidth*10);
        this.inlayery.set([4],(target2.y-this.y)/fullwidth*10);

    	//this.hiddenx=math.multiply(this.weight1,this.inlayerx);    //the x-hidden only acted on by x-input etc
        //this.hiddeny=math.multiply(this.weight1,this.inlayery);
        this.outlayer.set([0],math.sum(math.dotMultiply(this.weight1,this.inlayerx)));
        this.outlayer.set([1],math.sum(math.dotMultiply(this.weight1,this.inlayery)));


    	

    }

    this.move=function(){
        
        this.ax=Math.tanh(this.outlayer.get([0]))*vtyp*0.3;
        this.ay=Math.tanh(this.outlayer.get([1]))*vtyp*0.3;
        
        this.vx=this.vx+this.ax*dt;
        this.vy=this.vy+this.ay*dt;      //updating speeds
        //this.v2=this.vy**2+this.vx**2;
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
