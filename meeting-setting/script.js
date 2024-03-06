var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;


var team;

$(function(){
  $.ajax({
    type: "POST",
    url: "team_members.json",
    dataType: "json",
    success: function(result){
      team = result;
    }
  })
});

team_member = [
  {
     "name": "John Smith",
     "email": "john@teamcal.ai"
  },
  {
     "name": "Serena Bai",
     "email": "serena@teamcal.ai"
  }
];

var phrasePara = document.querySelector('.phrase');
var resultPara = document.querySelector('.result');
var diagnosticPara = document.querySelector('.output');

var testBtn = document.querySelector('button');

var today = new Date();
var year = today.toLocaleString("default", {year: "numeric"});
var month = today.toLocaleString("default", {month: "2-digit"});
var day = today.toLocaleString("default", {day: "2-digit"});

var formattedDate = year + "/" + month + "/" + day;

function testSpeech() {
  testBtn.disabled = true;
  testBtn.textContent = 'Test in progress';

  // To ensure case consistency while checking with the returned output text
  var phrase = "set up a meeting with [who] at [what time] on [what day]";
  phrasePara.textContent = phrase;
  resultPara.textContent = 'Please speak clearly';
  resultPara.style.background = 'rgba(0,0,0,0.2)';
  diagnosticPara.textContent = '...diagnostic messages';

  var grammar = '#JSGF V1.0; grammar phrase; public <phrase> = ' + phrase +';';
  var recognition = new SpeechRecognition();
  var speechRecognitionList = new SpeechGrammarList();
  speechRecognitionList.addFromString(grammar, 1);
  recognition.grammars = speechRecognitionList;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = function(event) {
    // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
    // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
    // It has a getter so it can be accessed like an array
    // The first [0] returns the SpeechRecognitionResult at position 0.
    // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
    // These also have getters so they can be accessed like arrays.
    // The second [0] returns the SpeechRecognitionAlternative at position 0.
    // We then return the transcript property of the SpeechRecognitionAlternative object 
    var speechResult = event.results[0][0].transcript.toLowerCase();
    diagnosticPara.textContent = 'Speech received: ' + speechResult + '.';

    var success = true;
    
    if(speechResult.includes("set") === false){
      success = false;
    }
    if(speechResult.includes("up") === false){
      success = false;
    }
    if(speechResult.includes("meeting") === false){
      success = false;
    }
    if(speechResult.includes("today") === false){
      success = false;
    }

    if(success === true) {
      // resultPara.textContent = 'I heard the correct phrase!';
      var meeting_member = new Array();
      for(var i = 0; i < team_member.length; i++){
        var member_name = team_member[i].name.split(' ');
        for(var j = 0; j < member_name.length; j++){
          if(speechResult.includes(member_name[j])){
            meeting_member.push(team_member[i].email);
            break;
          }
        }
      }
      var meeting_member_string = meeting_member[0];
      for(var i = 1; i < meeting_member.length; i++){
        meeting_member_string = meeting_member_string + "and" + meeting_member[i];
      }

      var hourfull = speechResult.match('[\d]+:[\d]{2}');
      var hours = speechResult.match('[\d]+');
      if(hourfull){
        var hour = hourfull.split(':')[0] % 12;
      }
      else if(hours){
        var hour = hours % 12;
      }
      if(speechResult.includes(" p.m. ")){
        hour = hour + 12;
      }
      var timefull = hour + ":" + hourfull.split(':')[1];

      resultPara.textContent = `Set up a meeting with ${meeting_member_string} at ${timefull} on ${formattedDate}.`;
      resultPara.style.background = 'lime';
    } else {
      resultPara.textContent = 'That didn\'t sound right.';
      resultPara.style.background = 'red';
    }

    console.log('Confidence: ' + event.results[0][0].confidence);
  }

  recognition.onspeechend = function() {
    recognition.stop();
    testBtn.disabled = false;
    testBtn.textContent = 'Start new test';
  }

  recognition.onerror = function(event) {
    testBtn.disabled = false;
    testBtn.textContent = 'Start new test';
    diagnosticPara.textContent = 'Error occurred in recognition: ' + event.error;
  }
  
  recognition.onaudiostart = function(event) {
      //Fired when the user agent has started to capture audio.
      console.log('SpeechRecognition.onaudiostart');
  }
  
  recognition.onaudioend = function(event) {
      //Fired when the user agent has finished capturing audio.
      console.log('SpeechRecognition.onaudioend');
  }
  
  recognition.onend = function(event) {
      //Fired when the speech recognition service has disconnected.
      console.log('SpeechRecognition.onend');
  }
  
  recognition.onnomatch = function(event) {
      //Fired when the speech recognition service returns a final result with no significant recognition. This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
      console.log('SpeechRecognition.onnomatch');
  }
  
  recognition.onsoundstart = function(event) {
      //Fired when any sound — recognisable speech or not — has been detected.
      console.log('SpeechRecognition.onsoundstart');
  }
  
  recognition.onsoundend = function(event) {
      //Fired when any sound — recognisable speech or not — has stopped being detected.
      console.log('SpeechRecognition.onsoundend');
  }
  
  recognition.onspeechstart = function (event) {
      //Fired when sound that is recognised by the speech recognition service as speech has been detected.
      console.log('SpeechRecognition.onspeechstart');
  }
  recognition.onstart = function(event) {
      //Fired when the speech recognition service has begun listening to incoming audio with intent to recognize grammars associated with the current SpeechRecognition.
      console.log('SpeechRecognition.onstart');
  }
}

testBtn.addEventListener('click', testSpeech);
