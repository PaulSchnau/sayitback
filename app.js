snippets = null;
randomSnippet = null;
randomVideo = null;


function search(){
	var query = $("#query").val();
	console.log('Searching youtube for: ' + query);
	var request = gapi.client.youtube.search.list({
		type: 'video',
		q: query,
		part: 'snippet',
		videoCaption: 'closedCaption',
		videoCategoryId : '10'
	});

	request.execute(function(response) {
		console.log('Found youtube videos for: ' + query);
		console.log(response);
		snippets = response.items;
		randomVideo = chooseRandomVideo(snippets);
		player.loadVideoById(randomVideo.id.videoId);
	});
}

function chooseRandomVideo(snippets){
	return snippets[Math.floor(Math.random()*snippets.length)];
}

var recognizer = new webkitSpeechRecognition();
recognizer.lang = "en";
recognizer.interimResults = true;
recognizer.continuous = true;
recognizer.onstart = function(event){
	console.log('Started recognition');
};
recognizer.onresult = function(event) {
    if (event.results.length > 0) {
        var result = event.results[event.results.length-1];
        if(result.isFinal) {
            console.log(result[0].transcript);
        }
    }  
};
recognizer.start();
