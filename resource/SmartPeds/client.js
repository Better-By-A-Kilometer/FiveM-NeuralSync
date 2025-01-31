// Function to show an input box on the screen
async function ShowKeyboard(): Promise<string> {
    var text = "";
    DisplayOnscreenKeyboard(0, "FMMC_KEY_TIP8", "", "", "", "", "", 100);

    while (UpdateOnscreenKeyboard() == 0) {
        if (UpdateOnscreenKeyboard() == 0) {
            DisableAllControlActions(0);
        }
        Wait(0);
    }
    if (GetOnscreenKeyboardResult() == null) return text;
    return GetOnscreenKeyboardResult();
}

function GetClosestPedToPlayer(playerPed, radius) {
    let closestPed = -1; // Default to -1 (no ped found)
    let playerCoords = GetEntityCoords(playerPed, false);

    const allPeds = GetGamePool('CPed'); // Get all peds in the game
    let closestDistance = -1; // To store the closest distance found so far
    // Loop through all peds to find the closest one
    for (let i = 0; i < allPeds.length; i++) {
        let ped = allPeds[i];
        let pedCoords = GetEntityCoords(ped, false);
        let distance = Vdist(playerCoords.x, playerCoords.y, playerCoords.z, pedCoords.x, pedCoords.y, pedCoords.z);

        // If closestDistance is -1 then we need to set it to the first distance
        if (closestDistance === -1) {
            closestDistance = distance;
            closestPed = ped;
        }

        // Check if the ped is within the radius and closer than the previous closest ped
        if (distance <= radius && (closestPed === 0 || distance < closestDistance)) {
            closestPed = ped;
            closestDistance = distance;
        }
        Wait(0);
    }
    return closestPed;
}

function ShowNotification(text: string) {
    SetTextComponentFormat("STRING");
    AddTextComponentString(text);
    DisplayHelpTextFromStringLabel(0, false, true, -1);
}

CreateThread(function () {
    RegisterCommand("talk", async function (source, args, rawCommand) {
        if (source <= 0) return;

        var closestPed = GetClosestPedToPlayer(PlayerPedId(), 5.0);
        if (closestPed < 0)
            return ShowNotification("There's no peds nearby to speak to.");
        var netId = NetworkGetNetworkIdFromEntity(closestPed) || -1;
        if (!netId || netId < 0)
            return ShowNotification("This ped isn't AI enabled!")

        const msg = await ShowKeyboard();
        const response = exports[resourceName]['ai-message'](netId, "Stranger", msg);
        emit("visualize-message", netId, msg);
    });

    RegisterKeyMapping("talk", "Talk to an AI", "keyboard", "e");  
})