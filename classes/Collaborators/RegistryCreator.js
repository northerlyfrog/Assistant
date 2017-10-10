'use strict'
/*
 *
 */
class RegistryCreator{
	constructor(){
		var serviceList = [];

		function validateService(service){
		
		}

		this.create = function(){
			var serviceArgs = arguments[0];
			for(var i=0; i < serviceArgs.length; i++){
				validateService(serviceArgs[i]);
				serviceList.push(serviceArgs[i]);
			}

			return serviceList;
		}

		this.listServices = function(){
			return serviceList;
		}

	}
}
module.exports = RegistryCreator;
