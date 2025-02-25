Config = {}

local endpoint = string.gsub(GetCurrentServerEndpoint() or "", ":%d+", "");

Config.Endpoint = "http://"..endpoint..":8000/speech"

Config.Voices = {
    ["entorno"] = "esx_voicesystem:voice:entorno",
    ["acción"] = "esx_voicesystem:voice:action",
    ["auxilio"] = "esx_voicesystem:voice:auxilio",
}

Config.ReTranslate = {
    ["c entorno"] = "zentorno",
    ["el porno"] = "entorno",
    ["en torno"] = "entorno",
    ["en tono"] = "entorno",
    ["entonó"] = "entorno",
    ["pista"] = "pistola",
    ["same address, police department"] = "san andreas police department",
    ["santa dres"] = "san andreas",
    ["hilo"] = "kilo",
    ["stand endurance"] = "san andreas",
    ["santa address"] = "san andreas"
}

Config.Ban = {
    ""
}
