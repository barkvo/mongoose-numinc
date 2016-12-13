var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CounterModel;

module.exports = function(schema, options) {
	var options = options || {},
		defaultName = schema.options.collection,
		fieldName = options.fieldName || "counter",
		counterName = options.counterName || defaultName + "Counter",
		collectionName = options.collectionName || "counters";

	if(!CounterModel){
		var counterSchema = new Schema({
			name : String,
			counter : Number
		},{
			"collection" : collectionName,
			"versionKey" : false
		});
		CounterModel = mongoose.model("counters", counterSchema);
	}

	schema.pre("save", function (next) {
		if (!this.isNew) {
			return next();
		}

		var self = this;

		CounterModel.findOneAndUpdate(
			{
				name : counterName
			}, 
			{ 
				$inc : {
					counter : 1
				}
			},
			{
				upsert : true,
				new : true
			},
			function(err, counter) {
				if (err) return next(err);

				self.set(fieldName, counter.counter);

				next();
			}
		);
	});
}