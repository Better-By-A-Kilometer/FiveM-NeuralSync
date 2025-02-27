const resourceName: string = GetCurrentResourceName();
const moduleName: string = "SmartPeds";
const ePrefix = `${resourceName}:${moduleName}`;
onNet(`${ePrefix}::sendAIMessage`, function (netId: number, name: string, gender: string, message: string, code: string) {
    // @ts-ignore
    const response = aiMessage(netId, name, gender, message, source);
    emitNet(`${ePrefix}::sendAIMessage:Code=${code}`, source, response);
})