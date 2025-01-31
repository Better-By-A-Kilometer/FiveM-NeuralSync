// ENV: Client

let textOnPeds = {};

// Function to draw text in 3D space
function Draw3DText(text, ped, forever = false) {
    textOnPeds[ped] = null;
    var pedCoords = GetEntityCoords(ped, false);
    var x = pedCoords.x;
    var y = pedCoords.y;
    var z = pedCoords.z;
    textOnPeds[ped] = text;

    let timeLeft = text.length * 150;

    while (textOnPeds[ped] === text && DoesEntityExist(ped)) {
        if (timeLeft < 0 && !forever) {
            break;
        }
        var playerCoords = GetEntityCoords(PlayerPedId());
        var pedCoords = GetEntityCoords(ped);
        if (Vdist(pedCoords.x, pedCoords.y, pedCoords.z, playerCoords.x, playerCoords.y, playerCoords.z) < 30.0 && HasEntityClearLosToEntityInFront(PlayerPedId(), ped) === true) {
            SetTextScale(0.35, 0.35);
            SetTextColor(255, 255, 255, 215);
            SetTextEntry("STRING");
            AddTextComponentString(text);
            SetTextProportional(true);
            SetTextOutline();
            SetTextJustification(0);
            SetTextCentre(true);
            World3dToScreen2d(x, y, z);
            DrawText(x, y);
        }
        timeLeft--;
        Wait(0);
    }
}

onNet('visualize-message', function (netId, message) {
    var ped = NetworkGetEntityFromNetworkId(netId);
    if (!ped) throw new Error(`Cannot visualize message for unknown ped [${netId}]`);
    Draw3DText(message, ped);
});