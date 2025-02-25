game 'gta5'
fx_version 'adamant'

name 'NeuralSync'
author 'DevKilo, Jonirulah'
description 'A standalone resource that connects ChatGPT to FiveM. Includes a fork of Voice Recognition from EvilRP by Jonirulah'

ui_page 'VoiceRecognition/html/main.html'
lua54 'yes'

files {
    './**/*.js',
    './**/*.lua',
    './**/config.json',
    './config.json',
    './VoiceRecognition/html/main.html',
    './VoiceRecognition/html/style.css',
    './VoiceRecognition/html/SpeechRecognition.js'
}

server_scripts {
    './ai_module.js',
    './**/server.js'
}

client_scripts {
    './visualizer.js',
    './**/client.js',
    './VoiceRecognition/client/client.lua',
    './VoiceRecognition/configuration.lua'
}

dependencies {
    'yarn'
}