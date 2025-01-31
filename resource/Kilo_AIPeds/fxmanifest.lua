game 'gta5'
fx_version 'cerulean'

author 'DevKilo'
description 'A standalone resource that connects ChatGPT to FiveM'

client_scripts {
    './visualizer.js',
    './**/client.js',
}

server_scripts {
    './ai_module.js',
    './**/server.js'
}

dependencies {
    './package.json'
}