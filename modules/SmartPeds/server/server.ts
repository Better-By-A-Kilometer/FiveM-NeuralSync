const resourceName: string = GetCurrentResourceName();
const moduleName: string = "SmartPeds";
const ePrefix = `${resourceName}:${moduleName}`;
onNet(`${ePrefix}::sendAIMessage`, function (netId: number, name: string, message: string, code: string) {
    // @ts-ignore
    const response = aiMessage(netId, name, message, source);
    emitNet(`${ePrefix}::sendAIMessage:Code=${code}`, source, response);
})