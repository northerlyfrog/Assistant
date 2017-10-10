const td = require('testdouble');
const mocha = require('mocha');
const assert = require('chai').assert;

const AhaIdeaDataStore = require('../../classes/DataStores/AhaIdeaDataStore.js');

describe('AhaIdeaDataStore#useCacheData', function(){

	var subject;

	before(function(){
	
		subject = new AhaIdeaDataStore();
	})

	it('Decides to fetch the data from Aha or use the stored data', function(){
	
		var result = subject.useCache();
		assert.equal(result, true);
	})

	after(function(){})
})
