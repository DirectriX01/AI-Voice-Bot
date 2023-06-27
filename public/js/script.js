const outputme = document.getElementById("output1");
const outputbot = document.getElementById("output2");
const mic = document.getElementById("mic");
const socket = io();
// allowing a silence of 2.5 seconds before recognition stops
let silenceTimer = null;
// fromBot is a marker which is used to check if the bot is speaking or not, or the mic has been turned off
let fromBot = false;
let userText = [] , botText = [];


mic.addEventListener("click" , (e) => {
  let clickedElementDataValue = e.currentTarget.getAttribute("data-value");
  let newValue = clickedElementDataValue === "true" ? "false" : "true";
  e.currentTarget.setAttribute("data-value", newValue);
  if (newValue === "true") {
    document.querySelector(".mic-button").style.backgroundColor = "#8B0000";
    document.getElementById("user").classList.add("user1-card");
    startListening();
  } else {
    fromBot = true;
    document.getElementById("user").classList.remove("user1-card");
    document.querySelector(".mic-button").style.backgroundColor = "#787878";
    endListening();
  }
})

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = "en-US";
recognition.interimResults = false;

let speechBuffer = ''; 

recognition.onstart = function () {
  speechBuffer = ''; 
};

recognition.onresult = function (event) {
  const last = event.results.length - 1;
  const text = event.results[last][0].transcript;
  speechBuffer += text; 
  outputme.textContent = speechBuffer;

  clearTimeout(silenceTimer); 
  silenceTimer = setTimeout(endListening, 2500); 
};

recognition.onend = function () {
  if(fromBot) {
    return;
  }
  if (speechBuffer.trim() !== '') {
    userText.push(speechBuffer);
    socket.emit("chat message", speechBuffer);
  }
  startListening();
};

function startListening() {
  recognition.start();
}

function stopListening() {
  recognition.abort();
}

function endListening() { 
  recognition.stop();
}

const playAudio = async (text) => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  synth.speak(utterance);
  return new Promise(resolve => {
    utterance.onend = resolve;
  });
};

const botReply = async (text) => { 
  fromBot = true;
  endListening();
  document.getElementById("bot").classList.add("user1-card");
  let x = await playAudio(text);
  // wait for the audio to finish playing to avoid overlap from user and bot
  if(x) {
    fromBot = false;
    // start transcribing again 
    document.getElementById("bot").classList.remove("user1-card");
    // check if the user has clicked the mic button
    if(mic.getAttribute("data-value") === "true") {
      startListening();
    }
  }
};

socket.on("bot reply", (text) => {
  botText.push(text);
  outputbot.textContent = text;
  botReply(text);
});

document.getElementById("transcript").addEventListener("click", () => {
   // use this to get the transcript
    let finalTranscript = [];
    for(let i = 0; i < userText.length; i++) {
        finalTranscript.push(`User: ${userText[i]} \n Nimbo: ${botText[i]}`);
     }
     // download the transcript
      const blob = new Blob([finalTranscript.join("\n")], {type: "text/plain"});
      const anchor = document.createElement("a");
      anchor.download = "transcript.txt";
      anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
      anchor.dataset.downloadurl = ["text/plain", anchor.download, anchor.href].join(":");
      anchor.click();
});