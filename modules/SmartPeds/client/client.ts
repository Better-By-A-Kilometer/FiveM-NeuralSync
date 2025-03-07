// Function to show an input box on the screen

const firstNames: string[] = JSON.parse(LoadResourceFile(GetCurrentResourceName(), "SmartPeds/first_names.json") ?? "{}");
const lastNames: string[] = JSON.parse(LoadResourceFile(GetCurrentResourceName(), "SmartPeds/last_names.json") ?? "{}");
async function ShowKeyboard(): Promise<string> {
    var text = "";
    DisplayOnscreenKeyboard(0, "FMMC_KEY_TIP8", "", "", "", "", "", 100);

    while (UpdateOnscreenKeyboard() == 0) {
        if (UpdateOnscreenKeyboard() == 0) {
            DisableAllControlActions(0);
        }
        await Delay(0);
    }
    if (GetOnscreenKeyboardResult() == null) return text;
    return GetOnscreenKeyboardResult();
}

const Delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function GetClosestPedToPlayer(playerPed: number, radius: number) {
    let closestPed = -1; // Default to -1 (no ped found)
    let playerCoords = GetEntityCoords(playerPed, false);

    const allPeds: number[] = GetGamePool('CPed'); // Get all peds in the game
    let closestDistance = 9999999999; // To store the closest distance found so far
    // Loop through all peds to find the closest one

    for (let ped of allPeds) {
        if (ped == PlayerPedId()) continue;
        if (IsEntityDead(ped) || IsPedFleeing(ped) || IsPedShooting(ped) || IsPedAPlayer(ped)) continue;
        let pedCoords = GetEntityCoords(ped, false);
        let distance = Vdist(playerCoords[0], playerCoords[1], playerCoords[2], pedCoords[0], pedCoords[1], pedCoords[2]);

        // Check if the ped is within the radius and closer than the previous closest ped
        if (distance <= radius && (closestPed === 0 || distance < closestDistance)) {
            closestPed = ped;
            closestDistance = distance;
        }
        await Delay(0);
    }
    return closestPed;
}

function ShowNotification(text: string) {
    SetTextComponentFormat("STRING");
    AddTextComponentString(text);
    DisplayHelpTextFromStringLabel(0, false, true, -1);
}

const resourceName: string = GetCurrentResourceName();
const moduleName: string = "SmartPeds";
const ePrefix = `${resourceName}:${moduleName}`;

const PedsWithNames: {[key: number]: string} = {};

function GenerateName(netId: number) {
    if (!PedsWithNames[netId]) {
        PedsWithNames[netId] = firstNames[GetRandomIntInRange(0, firstNames.length - 1)] + " " + lastNames[GetRandomIntInRange(0, lastNames.length - 1)];
    }
    return PedsWithNames[netId];
}

RegisterCommand("talk", async function (source: number) {
    if (source < 0) return;

    var closestPed = await GetClosestPedToPlayer(PlayerPedId(), 5.0);
    if (closestPed < 0)
        return;
    var netId = NetworkGetNetworkIdFromEntity(closestPed) || -1;
    if (!netId || netId < 0)
        return ShowNotification("This ped isn't AI enabled!")
    
    emit("attentionPed", netId);
    const msg = await ShowKeyboard();
    let response = "";
    var code = GetGameTimer();
    if (msg != "") {
        function callback(res: string) {
            response = res;
            removeEventListener(`${ePrefix}::sendAIMessage:Code=${code}`, callback);
        }
        addNetEventListener(`${ePrefix}::sendAIMessage:Code=${code}`, callback);
        emitNet(`${ePrefix}::sendAIMessage`, netId, GenerateName(netId), IsPedMale(closestPed) ? "male" : "female", msg);    
    }
}, false);

let lastPed: number | undefined;

async function PlayerSpeaks() {
    lastPed = await GetClosestPedToPlayer(PlayerPedId(), 5.0);
    if (lastPed < 0) return;
    var netId = NetworkGetNetworkIdFromEntity(lastPed);
    emit("attentionPed", netId);
}

async function ParseVoiceMessage(text: string) {
    console.log("Got voice message: "+text);
    if (!!lastPed) {
        if (lastPed < 0) return;
        var netId = NetworkGetNetworkIdFromEntity(lastPed);
        emit("attentionPed", netId);
        let response = "";
        var code = GetGameTimer();
        if (text != "") {
            function callback(res: string) {
                response = res;
                removeEventListener(`${ePrefix}::sendAIMessage:Code=${code}`, callback);
            }
            addNetEventListener(`${ePrefix}::sendAIMessage:Code=${code}`, callback);
            emitNet(`${ePrefix}::sendAIMessage`, netId, GenerateName(netId), IsPedMale(lastPed) ? "male" : "female", text);
        }
    }
}


on("KiloVoiceRecognition:PlayerSpeaks:Subscribe", PlayerSpeaks);
on("KiloVoiceRecognition:VoiceMessage:Subscribe", ParseVoiceMessage);

RegisterKeyMapping("talk", "Talk to an AI", "keyboard", "y");