game 'gta5'
fx_version 'cerulean'

author 'DevKilo'
description 'A standalone resource that connects ChatGPT to FiveM'

server_scripts {
    './ai_module.js',
    './**/server.js'
}

client_scripts {
    './visualizer.js',
    './**/client.js'
}

dependencies {
    'yarn'
}