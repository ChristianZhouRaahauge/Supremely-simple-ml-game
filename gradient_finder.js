//An alternative system, for using stochastic gradients to find optimal parameters

function gradientFunction(){ //An object for handling gradients

	this.params=[]; //Starts as an empty array, then gets filled with other arrays

	this.loss=[]; //For loss values that need to be optimized.

	this.gradient=[0,0,0,0,0]; //The found optimal gradient (same dimensions as params)

	this.findGradient=function(current,currentloss){
		this.gradient=[0,0,0,0,0];
		for (var i=0; i <this.params.length; i++) {
				for(var k=0; k<this.gradient.length; k++){
					
					this.gradient[k]+=((currentloss-this.loss[i])/(current-this.params[i][k] || 1e-9))/this.params.length; 
					//averaged gradient in the position current over all params

			}
		}

	}

	//The averaged gradient is now found and can be used to change the parameters.




}