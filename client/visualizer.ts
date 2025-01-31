// ENV: Client

const textOnPeds: {[key: number]: any} = {};

// Function to draw text in 3D space
function Draw3DText(text: string, ped: any, forever = false) {
    textOnPeds[ped] = null;
    var pedCoords = GetEntityCoords(ped, false);
    var x = pedCoords[0];
    var y = pedCoords[1];
    var z = pedCoords[2];
    textOnPeds[ped] = text;

    let timeLeft = text.length * 150;

    while (textOnPeds[ped] === text && DoesEntityExist(ped)) {
        if (timeLeft < 0 && !forever) {
            break;
        }
        var [px,py,pz] = GetEntityCoords(PlayerPedId(), true);
        var [ex,ey,ez] = GetEntityCoords(ped, true);
        if (Vdist(px, py, pz, ex, ey, ez) < 30.0 && HasEntityClearLosToEntityInFront(PlayerPedId(), ped)) {
            SetTextScale(0.35, 0.35);
            SetTextColour(255, 255, 255, 215);
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
onNet('visualize-message', function (netId: number, message: string) {
    var ped = NetworkGetEntityFromNetworkId(netId);
    if (!ped) throw new Error(`Cannot visualize message for unknown ped [${netId}]`);
    Draw3DText(message, ped);
});