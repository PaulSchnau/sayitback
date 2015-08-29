snippets = null;
randomSnippet = null;
randomVideo = null;
randomVideoTranscript = "hello hello baby you called i can't hear a thing";
ping = new Audio('ping.mp3');
userTranscript = null;
score = 0;

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

		// array_of_captions = randomVideo.caption().download;
		// console.log("this is the array of captions" + array_of_captions);
		
		player.loadVideoById(randomVideo.id.videoId);
		$('#message').text('Listen to the lyrics!');
	});
}

function chooseRandomVideo(snippets){
	return snippets[Math.floor(Math.random()*snippets.length)];
}

recognizer = new webkitSpeechRecognition();
// recognizer.lang = "en";
recognizer.interimResults = false;
recognizer.continuous = false;
recognizer.onstart = function(event){
	console.log('Recognition started');
	$("#userLyricsMessage").text('Listening...');
};
recognizer.onend = function(event){
	$("#userLyricsMessage").text('');
	console.log('Recognition ended');
	compareResults(userTranscript, randomVideoTranscript);
};
recognizer.onresult = function(event) {
	console.log('Result of recognition');
    if (event.results.length > 0) {
        var result = event.results[event.results.length-1];
        if(result.isFinal) {
        	userTranscript = result[0].transcript;
            console.log(userTranscript);
        }
    }  
    $('#userTranscript').text(userTranscript);
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
	var score = matches.length / officialTranscriptArray.length * 100;
	$('#message').text('Score: ' + score.toFixed(2).toString());
	$('#officialTranscript').text(randomVideoTranscript);
	stuffToHighlight = document.getElementById('officialTranscript');
	for (var i=0; i < matches.length; i++){
		hiliter(matches[i], stuffToHighlight);
	}
	$('#officialTranscript');
	// $('#matches').text(matches.join(' '));
}

function hiliter(word, element) {
    var rgxp = new RegExp(word, 'g');
    var repl = '<span class="highlight">' + word + '</span>';
    element.innerHTML = element.innerHTML.replace(rgxp, repl);
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


