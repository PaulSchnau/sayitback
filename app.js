var app = angular.module("sayitback", ["firebase"]);

app.controller("gameController", function($scope, $firebaseObject) {
	var ref = new Firebase("https://sayitback.firebaseio.com/data");
	var syncObject = $firebaseObject(ref);
	syncObject.$bindTo($scope, "data");


	$scope.start = function(){
		alert('start!');
	};


});


var recognizer = new webkitSpeechRecognition();
recognizer.lang = "en";
recognizer.interimResults = true;
recognizer.continuous = true;
recognizer.onstart = function(event){
	console.log('Started recognition');
}
recognizer.onresult = function(event) {
    if (event.results.length > 0) {
        var result = event.results[event.results.length-1];
        if(result.isFinal) {
            console.log(result[0].transcript);
        }
    }  
};
recognizer.start();