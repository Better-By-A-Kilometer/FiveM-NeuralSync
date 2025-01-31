const resourceName: string = GetCurrentResourceName();
const moduleName: string = "SmartPeds";
const ePrefix = `${resourceName}:${moduleName}`;

onNet(`${ePrefix}::sendAIMessage`, function (netId: number, name: string, message: string, code: string) {
    const response = exports[resourceName]['ai-message'](netId, name, message);
    
    emitNet(`${ePrefix}::sendAIMessage:Code=${code}`, source, response);
})