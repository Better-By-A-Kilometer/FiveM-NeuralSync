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
    private participants: Ped[] = []; // Array of Peds
    constructor() {
    }

    AddMessage(role: "user" | "system", message: string) {
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

class Ped {
    get NetworkId() {
        return this.netId;
    }

    get Name() {
        return this.name;
    }

    private netId: number;
    private name: string;
    private conversation: Conversation | undefined;
    private systemPrompt: string;
    private hasKids: boolean;
    private kids: number;

    private talking: boolean = false;

    constructor(netId: number, name: string) {
        this.netId = netId;
        this.name = name;
        this.hasKids = Math.random() > 0.5;
        this.kids = this.hasKids ? Math.min(1, Math.fround((Math.random() * 10) / 1.564656436546746)) : 0;
        this.systemPrompt = `DO NOT BREAK CHARACTER: You are an average person living in a state called San Andreas. Your life is boring. You keep to yourself. Your name is ${this.Name}. You ${this.kids ? `have ${this.kids} kids.` : "do not have kids."} You don't like to talk about your personal life.`;
    }

    // This method is used to address the ped directly as the local player.
    async Ask(message: string) {
        // Investigate: Does chatgpt add its own responses into the conversation?
        if (!this.conversation)
            this.conversation = new Conversation();
        this.conversation.AddMessage("system", this.systemPrompt);
        //this.conversation.AddMessage("user", `[World Time: "You don't have the time."] Player says to ${this.Name}: ${message}`);
        // Ask the AI
        const completion = await client.chat.completions.create({
            messages: this.conversation.AddMessage("user", `[World Time]: "You don't have the time."] Player says to ${this.Name}: ${message}`),
            model: 'gpt-4o-mini',
            max_tokens: 40
        });
        return !completion.choices[0].message.refusal ? completion.choices[0].message.content : "No response.";
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

async function aiMessage(netId: number, name: string, message: string, source: number) {
    const ped: Ped = GetPed(netId, name);
    if (!ped) throw new Error("Ped should exist! This should not occur.");
    console.log("Check3");
    const response = await ped.Ask(message);

    emitNet("visualizeMessage", -1, netId, response);
    return response;
}

exports('aiMessage', aiMessage);
/* 
* USAGE:
* response = exports['Kilo_AIPeds']['ai-message'](networkId, name, message);
* */