'use strict'
/*
 *
 */
class Assistant{
	constructor(registryCreator, registryRunner, registryReporter){
		this.registryCreator = registryCreator;
		this.registryRunner = registryRunner;
		this.registryReporter = registryReporter;

	}

	async reportOnMetrics(listOfServiceClasses){
		console.log('Starting Report.');
		var registry = this.registryCreator.create(listOfServiceClasses);
		var metricsWithValues = await this.registryRunner.run(registry);

		this.registryReporter.report(metricsWithValues);

	}
}
module.exports = Assistant;

