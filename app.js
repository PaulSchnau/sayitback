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
		
		randomVideoId = randomVideo.id.videoId;
		console.log(randomVideo.snippet);
		// console.log(randomVideo.snippet.captions.download({
		// 	id: randomVideoId,
		// }));
		
		player.loadVideoById(randomVideo.id.videoId);
		$('#message').text('Listen to the lyrics!');
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

function startRecognition(){
	ping.play();
	recognizer.start();
	$('#message').text('Say back the lyrics!');
}

function compareResults(testTranscript, officialTranscript){
	testTranscriptArray = testTranscript.split(" ");
	officialTranscriptArray = officialTranscript.split(" ");
	matches = getMatch(testTranscriptArray, officialTranscriptArray);
	$('#message').text('How did you do?');
	$('#officialTranscript').text(randomVideoTranscript);
	$('#matches').text(matches.join(' '));
}

function getMatch(a, b) {
    var matches = [];
    for ( var i = 0; i < a.length; i++ ) {
        for ( var e = 0; e < b.length; e++ ) {
            if ( a[i] === b[e] ) matches.push( a[i] );
        }
    }
    return matches;
}


