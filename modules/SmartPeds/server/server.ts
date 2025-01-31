const resourceName: string = GetCurrentResourceName();
const moduleName: string = "SmartPeds";
const ePrefix = `${resourceName}:${moduleName}`;
onNet(`${ePrefix}::sendAIMessage`, function (netId: number, name: string, message: string, code: string) {
    console.log("Received server.ts");
    // @ts-ignore
    const response = aiMessage(netId, name, message, source);
    emitNet(`${ePrefix}::sendAIMessage:Code=${code}`, source, response);
})