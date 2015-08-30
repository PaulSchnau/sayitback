snippets = null;
randomSnippet = null;
randomVideo = null;
randomVideoTranscript = "hello hello baby you called i can't hear a thing";
ping = new Audio('ping.mp3');
userTranscript = null;
score = 0;
captions = null;
recognizer = null;
timeout = null;

function search(){
	if (timeout != null){
		clearTimeout(timeout);
	};
	$('#message').text('Searching for videos...');
	$('#userTranscript').text('');
	$('#officialTranscript').text('');
	stuffToHighlight = document.getElementById('officialTranscript');
	var query = $("#query").val();
	console.log('Searching youtube for: ' + query);
	var request = gapi.client.youtube.search.list({
		type: 'video',
		q: query,
		part: 'snippet',
		videoCaption: 'closedCaption',
		videoCategoryId : '10',
		maxResults: 50
	});

	request.execute(function(response) {
		snippets = response.items;
		getSong();
	});
}

function getSong(){
		
		console.log('Found youtube videos for: ' + query);
		console.log(snippets);
		randomVideo = chooseVideo(snippets);
		$.ajax({
		    type: "GET",
			url: 'https://video.google.com/timedtext?lang=en&v=' + randomVideo.id.videoId,
			dataType: "xml",
			success: function(xml) {
				console.log(xml);
				randomVideoTranscript = '';
				startTime = null;
				totalDuration = 3;
				var j = 0;

				$(xml).find('text').each(function(){
					j++;
					if (j > 5 && totalDuration < 5){
						randomVideoTranscript += ($.parseHTML($(this).text())[0].textContent  + ' ').replace(/(\r\n|\n|\r)/gm,"");
						if (startTime === null){
							startTime = parseFloat($(this).attr('start'));
						}
						totalDuration += parseFloat($(this).attr('dur'));
					}
				});

				if (totalDuration < 5 || totalDuration*1000 > 10000){
					console.log('panic');
					$('#message').append('.');
					getSong();
				} else {
					player.loadVideoById(randomVideo.id.videoId);
					player.seekTo(startTime);
					timeout = setTimeout(function(){
						player.pauseVideo();
						startRecognition();
					}, totalDuration*1000);
				$('#message').text('Listen to the lyrics!');
				}
			}
		});
}

counter = 0;
function chooseVideo(snippets){
	counter ++;
	if (counter > snippets.length){
		counter = 0;
	}
	var snippet = snippets[counter];
	delete snippets[counter];
	return snippet;
}


function startRecognition(){
	ping.play();
	recognizer = new webkitSpeechRecognition();
	recognizer.lang = "en";
	recognizer.interimResults = false;
	recognizer.continuous = false;
	recognizer.onstart = function(event){
		console.log('Recognition started');
		$("#userLyricsMessage").text('Listening...');
		if (timeout != null){
			clearTimeout(timeout);
		};
		timeout = setTimeout(function(){
			recognizer.stop();
		}, (totalDuration + 10)*1000);
	};
	recognizer.onend = function(event){
		$("#userLyricsMessage").text('');
		console.log('Recognition ended');
		compareResults(userTranscript, randomVideoTranscript);
	};
	recognizer.onresult = function(event) {
	    if (event.results.length > 0) {
	        var result = event.results[event.results.length-1];
	        if(result.isFinal) {
	        	userTranscript = result[0].transcript;
	            console.log(userTranscript);
	            recognizer.stop();
	        }
	    }  
	};
	recognizer.start();
	$('#message').text('Say back the lyrics!');
}

function compareResults(testTranscript, officialTranscript){
	if (typeof(testTranscript) != undefined && testTranscript != null && testTranscript != ""){
		testTranscriptArray = testTranscript.split(" ");
	} else{
		testTranscriptArray = [""];
		userTranscript = "PLEASE SPEAK LOUDER! <3 <3 <3";
	};
	officialTranscriptArray = officialTranscript.split(" ");
	matches = getMatch(testTranscriptArray, officialTranscriptArray);
	var score = matches.length / officialTranscriptArray.length * 100;
	$('#message').text('Score: ' + score.toFixed(2).toString());
	$('#userTranscript').text(userTranscript);
	$('#officialTranscript').text(randomVideoTranscript);
	stuffToHighlight = document.getElementById('officialTranscript');
	for (var i=0; i < matches.length; i++){
		hiliter(matches[i], stuffToHighlight);
	}
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

$(document).ready(function(){
    $('#query').keypress(function(e){
      if(e.keyCode==13)
      $('#nextSong').click();
    });
});


