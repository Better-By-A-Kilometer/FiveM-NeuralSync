// ENV: Server

// @ts-ignore
import {ChatCompletionCreateParamsNonStreaming, ChatCompletionMessageParam} from "openai";

const OpenAI = require("openai");
const resourceName = GetCurrentResourceName() || "Kilo_AIPeds";
const config = JSON.parse(LoadResourceFile(resourceName, "config.json"));
const openaiKey: string = config["openai-key"];
if (!openaiKey) throw new Error('OpenAI key not found in config.json!');

const client = new OpenAI({
    apiKey: openaiKey
});


class Conversation {
    get Conversation() {
        return this.conversationData;
    }

    private conversationData: ChatCompletionMessageParam[] = [];
    public speaker: number | undefined = undefined;
    private participants: Ped[] = []; // Array of Peds
    constructor() {
    }

    AddMessage(role: "user" | "system" | "assistant" | "function" | "tool" | "developer", message: string) {
        this.conversationData.push({
            role: role,
            content: message,
        });
        return this.Conversation;
    }

    AddPed(ped: Ped) {
        // Add a ped to the conversation
        this.participants.push(ped);
    }
}

const Peds: { [key: number]: Ped } = {};

function GetPed(netId: number, name: string) {
    return Peds[netId] ? Peds[netId] : new Ped(netId, name);
}

const Actions: {[key: string]: Function} = {
    action_flee: function (ped: Ped, tool: any) {
        const plrHandle = NetworkGetEntityFromNetworkId(ped.conversation!.speaker!);
        const handle = NetworkGetEntityFromNetworkId(ped.NetworkId);
        const args = JSON.parse(tool.function.arguments);
        if (args.flee) {
            TaskReactAndFleePed(handle, plrHandle);
        }
        else
            ClearPedTasks(handle);
    }
}

class Ped {
    get NetworkId() {
        return this.netId;
    }

    get Name() {
        return this.name;
    }

    private readonly netId: number;
    private readonly name: string;
    public conversation: Conversation | undefined;
    private readonly identityPrompt: string;
    private readonly actionPrompt: string;
    private readonly hasKids: boolean;
    private readonly kids: number;
    
    private readonly tools = [
        {
            type: "function",
            function: {
                name: "action_flee",
                description: "Flee from the person you're talking to.",
                parameters: {
                    type: "object",
                    properties: {
                        flee: { type: "boolean" }
                    },
                    required: ["flee"],
                    additionalProperties: false
                },
                strict: true
            }
        }
    ]

    constructor(netId: number, name: string) {
        this.netId = netId;
        this.name = name;
        this.hasKids = Math.random() > 0.5;
        this.kids = this.hasKids ? Math.min(1, Math.fround((Math.random() * 10) / 1.564656436546746)) : 0;
        this.identityPrompt = `[IDENTITY PROMPT] DO NOT BREAK CHARACTER: You are an average person living in a state called San Andreas. Your life is boring. You keep to yourself. Your name is ${this.Name}. You ${this.kids ? `have ${this.kids} kids.` : "do not have kids."} You don't like to talk about your personal life. You don't like to repeat yourself, but you are willing to.`;
        this.actionPrompt = `[ACTION PROMPT] (THIS IS NOT PART OF YOUR CHARACTER): Only run the 'action_flee' function when it makes sense for your character to flee from the speaker. Such as signs of aggression. In order to start fleeing, set the property 'flee' to true. In order to stop fleeing, set the property 'flee' to false. Remember to stop fleeing when deciding to speak to the speaker again.`
    }

    // This method is used to address the ped directly as the local player.
    async Ask(message: string, speaker: number) {
        // Investigate: Does chatgpt add its own responses into the conversation?
        if (!this.conversation) {
            this.conversation = new Conversation();
            this.conversation.AddMessage("system", this.actionPrompt);
        }
        this.conversation.speaker = speaker;
        this.conversation.AddMessage("system", this.identityPrompt);
        // Ask the AI
        const startTime = new Date().getTime();
        const completion = await client.chat.completions.create({
            messages: this.conversation.AddMessage("user", `[World Time]: "You don't have the current time."] Player says to ${this.Name}: ${message}`),
            model: 'gpt-4o-mini',
            tools: this.tools,
            max_tokens: 40
        });
        const endTime = new Date().getTime();
        const latency = (endTime - startTime);
        console.log("Got response in", `${latency}ms`);
        const completionMessage = completion.choices[0].message;
        
        const toolCalls = completionMessage.tool_calls;
        if (toolCalls) {
            toolCalls.forEach((tool: any) => {
                Actions[tool.function?.name as keyof typeof Actions](this, tool);
            })
        }
        
        return !completionMessage.refusal && !toolCalls ? completionMessage.content : undefined;
    }
}

export {}

declare global {
    interface CitizenExports {
        Kilo_AIPeds: {
            aiMessage(netId: number, name: string, message: string): Promise<string>;
        }
    }
}

async function aiMessage(netId: number, name: string, message: string, source: string) {
    const ped: Ped = GetPed(netId, name);
    if (!ped) throw new Error("Ped should exist! This should not occur.");
    const player = GetPlayerPed(source);
    const playerNetId = NetworkGetNetworkIdFromEntity(player);
    const response = await ped.Ask(message, playerNetId);
    if (response)
        emitNet("visualizeMessage", -1, netId, response);
    return response;
}

exports('aiMessage', aiMessage);
/* 
* USAGE:
* response = exports['Kilo_AIPeds']['ai-message'](networkId, name, message);
* */