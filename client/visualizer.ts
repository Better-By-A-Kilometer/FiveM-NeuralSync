// ENV: Client

const textOnPeds: { [key: number]: any } = {};

// Function to draw text in 3D space
async function Draw3DText(text: string, ped: any, forever = false) {
    let remainder;
    if (text.length > 60) {
        remainder = "... " + text.substring(60);
        text = text.slice(0, 60) + " ...";
    }
    var netId = NetworkGetNetworkIdFromEntity(ped);
    if (pedsTalking[netId]) {
        textOnPeds[netId] = null;
        pedsTalking[netId] = false;
        await Delay(500);
    }
    pedsTalking[netId] = true;
    textOnPeds[netId] = null;
    var pedCoords = GetEntityCoords(ped, false);
    var x = pedCoords[0];
    var y = pedCoords[1];
    var z = pedCoords[2];
    textOnPeds[netId] = text;
    let timeLeft = text.length * 50;
    let distance = -1;
    let canSee = true;
    let task = -1;
    task = setTick(function () {
        if (distance > 5.0 || !canSee) return;
        SetTextScale(0.35, 0.35);
        SetTextColour(255, 255, 255, 215);
        SetTextEntry("STRING");
        AddTextComponentString(text);
        SetTextProportional(true);
        SetTextOutline();
        SetTextJustification(0);
        SetTextCentre(true);
        const xy = World3dToScreen2d(x, y, z + 1);
        if (xy[0])
            DrawText(xy[1], xy[2]);
    });

    while (textOnPeds[netId] === text && DoesEntityExist(ped)) {
        if (timeLeft < 0 && !forever) {
            break;
        }
        var [px, py, pz] = GetEntityCoords(PlayerPedId(), true);
        var [ex, ey, ez] = GetEntityCoords(ped, true);
        distance = Vdist(px, py, pz, ex, ey, ez);
        canSee = HasEntityClearLosToEntity(PlayerPedId(), ped, 17);
        if (distance > 5) break;
        PlayFacialAnim(ped, 'facials@gen_male@base', 'mood_talking_1');
        timeLeft -= 100;
        await Delay(100);
    }
    if (task > -1)
        clearTick(task);

    if (remainder && pedsTalking[netId])
        return await Draw3DText(remainder, ped, forever);
    else
        pedsTalking[netId] = false;
}

const Delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const pedsTalking: { [key: number]: boolean } = {};
let attention = false;

async function Attention(ped: number) {
    if (!attention) {
        NetworkRequestControlOfEntity(ped);
        await Delay(100);
        SetBlockingOfNonTemporaryEvents(ped, true);
        SetPedKeepTask(ped, true);
        ClearPedTasks(ped);
        TaskTurnPedToFaceEntity(ped, PlayerPedId(), -1);
        attention = true;
    }
}

async function EndAttention(ped: number, duration: number) {
    let timeLeft = duration;
    var netId = NetworkGetNetworkIdFromEntity(ped);
    while (!pedsTalking[netId] && timeLeft > 0 && attention) {
        await Delay(100);
        timeLeft -= 100;
    }
    if (attention && !pedsTalking[netId]) {
        SetBlockingOfNonTemporaryEvents(ped, false);
        SetPedKeepTask(ped, false);
        ClearPedTasks(ped);
        SetEntityAsNoLongerNeeded(ped);
        attention = false;
    }
}

RequestAnimDict('facials@gen_male@base');
on('attentionPed', async function (netId: number) {
    var ped = NetworkGetEntityFromNetworkId(netId);
    Attention(ped);
    EndAttention(ped, 10000);
})
onNet('visualizeMessage', async function (netId: number, message: string) {
    var ped = NetworkGetEntityFromNetworkId(netId);
    if (!ped) throw new Error(`Cannot visualize message for unknown ped [${netId}]`);
    Attention(ped);
    await Draw3DText(message, ped);
    EndAttention(ped, 15000);
});