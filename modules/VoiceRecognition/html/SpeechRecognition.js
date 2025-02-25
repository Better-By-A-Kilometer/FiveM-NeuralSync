navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    let mediaRecorder;
    let audioChunks = [];
    document.getElementById("main-container").style.display = "none";

    window.addEventListener("message", function(event) {
        if (event.data.listening == "false") {
            document.getElementById('mic-icon').setAttribute('fill', 'red');
            document.getElementById("mic-status").innerHTML = "Speech Recognition Stopped";
            document.getElementById("main-container").style.display = "inline-block";
            var oldValue = document.getElementById("mic-status").innerHTML;
            this.setTimeout(function() {
                if (document.getElementById("mic-status").innerHTML != oldValue) return;
                document.getElementById("main-container").style.display = "none";
            }, 3500);
        }
        
        if (event.data.listening == "true") {
            document.getElementById("main-container").classList.remove("slide-out-bck-center");
            document.getElementById("main-container").classList.add("puff-in-center");
            document.getElementById("recognized_text").innerHTML = "";
            document.getElementById('detected_action').innerHTML = "";
            document.getElementById("options").style.display = "none";
            document.getElementById('mic-icon').setAttribute('fill', 'green');
            document.getElementById("mic-status").innerHTML = "Speech Recognition Started";
            document.getElementById("main-container").style.display = "inline-block";

            var oldValue = document.getElementById("mic-status").innerHTML;
            this.setTimeout(function() {
                if (document.getElementById("mic-status").innerHTML != oldValue) return;
                document.getElementById("main-container").style.display = "none";
            }, 3500);
        }
        
        
        if (event.data.record == "false") {
            setTimeout(function() {
                if (mediaRecorder.state == "inactive") return;
                mediaRecorder.stop();
                document.getElementById('mic-icon').setAttribute('fill', 'yellow');
                document.getElementById("mic-status").innerHTML = "Speech Recognition (Processing)";
                document.getElementById("main-container").style.display = "inline-block";
                mediaRecorder.addEventListener("stop", () => {
                    const audioBlob = new Blob(audioChunks);
                    PerformReq(audioBlob, event.data.url);
                    // audio.play();
                });
                var oldValue = document.getElementById("mic-status").innerHTML;
                this.setTimeout(function() {
                    if (document.getElementById("mic-status").innerHTML != oldValue) return;
                    document.getElementById("main-container").style.display = "inline-block";
                    document.getElementById('mic-icon').setAttribute('fill', 'green');
                    document.getElementById("mic-status").innerHTML = "Speech Recognition Started";
                    document.getElementById("main-container").style.display = "inline-block";

                    oldValue = document.getElementById("mic-status").innerHTML;
                    this.setTimeout(function() {
                        if (document.getElementById("mic-status").innerHTML != oldValue) return;
                        document.getElementById("main-container").style.display = "none";
                    }, 3500);
                }, 1500);
            }, 150);
        }
        

        if (event.data.record == "true") {
            document.getElementById("main-container").classList.remove("slide-out-bck-center");
            document.getElementById("main-container").classList.add("puff-in-center");
            document.getElementById("recognized_text").innerHTML = "";
            document.getElementById('detected_action').innerHTML = "";
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            document.getElementById("mic-status").innerHTML = "Voice Recognition (Recording)";
            document.getElementById("options").style.display = "none";
            document.getElementById('mic-icon').setAttribute('fill', 'cyan');
            mediaRecorder.addEventListener("dataavailable", (event) => {
                audioChunks = [];
                audioChunks.push(event.data);
            });
            document.getElementById("main-container").style.display = "inline-block";
            // console.log("Voice Recognition has started");

            var oldValue = document.getElementById("mic-status").innerHTML;
            this.setTimeout(function() {
                if (document.getElementById("mic-status").innerHTML != oldValue) return;
                document.getElementById("main-container").style.display = "none";
            }, 3500);
        }

        if (event.data.action) {
            document.getElementById("options").style.display = "inline-block";
            document.getElementById('detected_action').innerHTML = event.data.action;
            if (event.data.action == "Not detected") {
                document.getElementById('mic-icon').setAttribute('fill', 'red');
            } else {
                document.getElementById('mic-icon').setAttribute('fill', 'green');
            }
        }

        if (event.data.status) {
            document.getElementById("mic-status").innerHTML = event.data.status;
        }

        if (event.data.recognized_text) {
            document.getElementById("recognized_text").innerHTML = event.data.recognized_text;
        }

        if (event.data.send) {
            document.getElementById("main-container").classList.add("slide-out-bck-center");
            document.getElementById("main-container").classList.remove("puff-in-center");
        }
    });
});

function PerformReq(audioBlob, voiceUrl) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            $.post(`http://KiloAIPeds/send_text`, xhr.responseText);
        }
    };
    xhr.open("POST", voiceUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(audioBlob);
}
