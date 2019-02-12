$(window).ready(function() { 
  // $('body').jmspinner();
  $('.app, .back-button').hide();
  
  // setTimeout(myFunction, 3000)
 
  
});

// function myFunction(){
//   $('body').jmspinner(false);
// }

// var timer2 = "1:00";
// var interval = setInterval(function() {


//   var timer = timer2.split(':');
//   //by parsing integer, I avoid all extra string processing
//   var minutes = parseInt(timer[0], 10);
//   var seconds = parseInt(timer[1], 10);
//   --seconds;
//   minutes = (seconds < 0) ? --minutes : minutes;
//   if (minutes < 0) clearInterval(interval);
//   seconds = (seconds < 0) ? 59 : seconds;
//   seconds = (seconds < 10) ? '0' + seconds : seconds;
//   //minutes = (minutes < 10) ?  minutes : minutes;
//   $('.countdown').html(minutes + ':' + seconds);
//   timer2 = minutes + ':' + seconds;
// }, 1000);

try {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
}
catch(e) {
  console.error(e);
  $('.no-browser-support').show();
  $('.app').hide();
}


var noteTextarea = $('#note-textarea');
var instructions = $('#recording-instructions');
var notesList = $('ul#notes');

var noteContent = '';

// Get all notes from previous sessions and display them.
var notes = getAllNotes();
renderNotes(notes);



/*-----------------------------
      Voice Recognition 
------------------------------*/

// If false, the recording will stop after a few seconds of silence.
// When true, the silence period is longer (about 15 seconds),
// allowing us to keep recording even when the user pauses. 
recognition.continuous = true;

// This block is called every time the Speech APi captures a line. 
recognition.onresult = function(event) {

  // event is a SpeechRecognitionEvent object.
  // It holds all the lines we have captured so far. 
  // We only need the current one.
  var current = event.resultIndex;

  // Get a transcript of what was said.
  var transcript = event.results[current][0].transcript;

  // Add the current transcript to the contents of our Note.
  // There is a weird bug on mobile, where everything is repeated twice.
  // There is no official solution so far so we have to handle an edge case.
  var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

  if(!mobileRepeatBug) {
    noteContent += transcript;
    noteTextarea.val(noteContent);
    console.log(noteContent);
    sendDataForSpeedCheck(noteContent)
  }
};

function sendDataForSpeedCheck(noteContent){
  console.log("hiii");
   let data= noteContent;
  // $.post("locathost:5000/speedtest",data, function(data, status){
  //   alert("Data: " + data + "\nStatus: " + status);
  // });
  $.ajax({
    type: 'POST',
    url: 'http://127.0.0.1:5000/speedtest',
    crossDomain: true,
    data: data,
    dataType: 'text',
    timeout: 3000,
    success: function(responseData, textStatus, jqXHR) 
    {   
      var responsedata = JSON.parse(responseData);
      console.log(typeof(responsedata));
        for(key in responsedata){
          console.log(key)
        }
        var response = 'Your Word Count is: ' + responsedata['length'];
        $('span#response').html(response);
        console.log(responseData);

    },
    error: function (responseData, textStatus, errorThrown) 
    {
        console.warn(responseData, textStatus, errorThrown);
        alert('failed - ' + textStatus);
    }
});
}

recognition.onstart = function() { 
  instructions.text('Voice recognition activated. Try speaking into the microphone.');
}

recognition.onspeechend = function() {
  instructions.text('You were quiet for a while so voice recognition turned itself off.');
}

recognition.onerror = function(event) {
  if(event.error == 'no-speech') {
    instructions.text('No speech was detected. Try again.');  
  };
}



/*-----------------------------
      App buttons and input 
------------------------------*/

$('#start-record-btn').on('click', function(e) {
  if (noteContent.length) {
    noteContent += ' ';
  }
  recognition.start();
});


$('#pause-record-btn').on('click', function(e) {
  recognition.stop();
  instructions.text('Voice recognition paused.');
});

// Sync the text inside the text area with the noteContent variable.
noteTextarea.on('input', function() {
  noteContent = $(this).val();
})

$('#save-note-btn').on('click', function(e) {
  recognition.stop();

  if(!noteContent.length) {
    instructions.text('Could not save empty note. Please add a message to your note.');
  }
  else {
    // Save note to localStorage.
    // The key is the dateTime with seconds, the value is the content of the note.
    saveNote(new Date().toLocaleString(), noteContent);

    // Reset variables and update UI.
    noteContent = '';
    renderNotes(getAllNotes());
    noteTextarea.val('');
    instructions.text('Note saved successfully.');
  }
      
})


notesList.on('click', function(e) {
  e.preventDefault();
  var target = $(e.target);

  // Listen to the selected note.
  if(target.hasClass('listen-note')) {
    var content = target.closest('.note').find('.content').text();
    readOutLoud(content);
  }

  // Delete note.
  if(target.hasClass('delete-note')) {
    var dateTime = target.siblings('.date').text();  
    deleteNote(dateTime);
    target.closest('.note').remove();
  }
});



/*-----------------------------
      Speech Synthesis 
------------------------------*/

function readOutLoud(message) {
	var speech = new SpeechSynthesisUtterance();

  // Set the text and voice attributes.
	speech.text = message;
	speech.volume = 1;
	speech.rate = 1;
	speech.pitch = 1;
  
	window.speechSynthesis.speak(speech);
}



/*-----------------------------
      Helper Functions 
------------------------------*/

function renderNotes(notes) {
  var html = '';
  if(notes.length) {
    notes.forEach(function(note) {
      html+= `<li class="note">
        <p class="header">
          <span class="date">${note.date}</span>
          <a href="#" class="listen-note" title="Listen Your Text">Listen Your Text</a>
          <a href="#" class="delete-note" title="Delete">Delete</a>
        </p>
        <p class="content">${note.content}</p>
      </li>`;    
    });
  }
  else {
   // html = '<li><p class="content">You don\'t have any notes yet.</p></li>';
  }
  notesList.html(html);
}


function saveNote(dateTime, content) {
  localStorage.setItem('note-' + dateTime, content);
}


function getAllNotes() {
  var notes = [];
  var key;
  for (var i = 0; i < localStorage.length; i++) {
    key = localStorage.key(i);

    if(key.substring(0,5) == 'note-') {
      notes.push({
        date: key.replace('note-',''),
        content: localStorage.getItem(localStorage.key(i))
      });
    } 
  }
  return notes;
}


function deleteNote(dateTime) {
  localStorage.removeItem('note-' + dateTime); 
}


function speedTest(){
  console.log("speed test");
  $('.button-options-left').hide();
  $('.button-options-right').hide();
  $('.option-select').append('Speed Test');
  $('.app, .back-button').show();

  window.location.replace("http://127.0.0.1:8080/speedTest");
}


function back(){
  location.reload();
}


function searchModules(){
  console.log("modules test");
  $('.button-options-left').hide();
  $('.button-options-right').hide();
  $('.option-select').append('Modules');
  window.location.replace("http://127.0.0.1:8080/modules");
}

function startPreparation(){
  console.log("start preparation test");
  $('.button-options-left').hide();
  $('.button-options-right').hide();
  $('.option-select').append('Modules');
  window.location.replace("http://127.0.0.1:8080/startPreparation");
}

function postureControl(){
  console.log("start preparation test");
  $('.button-options-left').hide();
  $('.button-options-right').hide();
  $('.option-select').append('Modules');
  window.location.replace("http://127.0.0.1:8080/postureControl");

}

function goRealTime(){
  console.log("start preparation test");
  $('.button-options-left').hide();
  $('.button-options-right').hide();
  $('.option-select').append('Modules');
  window.location.replace("http://127.0.0.1:8080/goRealTime");

}