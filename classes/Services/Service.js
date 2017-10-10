'use strict'

class Service{
	constructor(){
		if(this.constructor === Service){
		
			throw new Error("Can't instantiate an abstract class");
		}
	}

	returnMetrics(){
		throw new Error('Abstract Method');

	}
}
module.exports = Service;
