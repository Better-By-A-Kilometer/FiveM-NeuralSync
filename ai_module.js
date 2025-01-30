// ENV: Server

const OpenAI = require('openai');

const {openaiKey} = require('./config.json');
const net = require("node:net");

if (!openaiKey) throw new Error('OpenAI key not found in config.json!');
const client = new OpenAI({
    apiKey: openaiKey
});

const conversations = {}; // { [token]: [] // Conversation data }

function NewToken() {
    return Math.random().toString(36).substr(2, 9);
}

enum ConversationRoles {
    user
}

class Conversation {
    get Token() {
        return this.token;
    }

    get Conversation() {
        return this.conversationData;
    }

    private conversationData = [{ role: 'system', content: "You are an average person living in a state called San Andreas. Your life is boring."}];
    private participants = []; // Array of Peds
    constructor(token) {
        this.token = token;
    }
    
    AddMessage(role: ConversationRoles, message: string) {
        this.conversationData.push({
            role: role.toString(),
            content: message
        });
    }

    AddPed(ped: Ped) {
        // Add a ped to the conversation
        this.participants.push(ped);
    }
}

const Peds = {};

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
    private conversation: Conversation;
    private systemPrompt: string;
    private hasKids: boolean;
    private kids: number;

    constructor(netId, name) {
        this.netId = netId;
        this.name = name;
        this.hasKids = Math.random() > 0.5;
        this.kids = this.hasKids ? Math.min(1, Math.fround((Math.random() * 10) / 1.564656436546746)) : 0;
        this.systemPrompt = `DO NOT BREAK CHARACTER: You are an average person living in a state called San Andreas. Your life is boring. You keep to yourself. Your name is ${this.Name}. You ${this.kids ? `have ${this.kids} kids.` : "do not have kids."} You don't like to talk about your personal life.`;
    }

    // This method is used to address the ped directly as the local player.
    async Ask(message: string) {
        if (!this.conversation) throw new Error('Ped is not in a conversation.');
        this.conversation.AddMessage('user', `Player says to ${this.Name}: ${message}`);
        // Ask the AI
        const completion = await client.completions.create({
            messages: this.conversation.Conversation,
            model: 'gpt-4o-mini'
        });
        return completion.choices[0];
    }
}

exports('ai-message', async function (netId: number, name: string, message: string) {
    const ped: Ped = GetPed(netId, name);
    if (!ped) throw new Error("Ped should exist! This should not occur.");
    return await ped.Ask(message);
});

/* 
* USAGE:
* response = exports['Kilo_AIPeds']['ai-message'](networkId, name, message);
* */