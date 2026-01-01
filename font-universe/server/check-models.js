"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function listModels() {
    return __awaiter(this, void 0, void 0, function* () {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('No API key found!');
            return;
        }
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        try {
            console.log('Fetching models from:', url.replace(apiKey, 'HIDDEN'));
            const response = yield fetch(url);
            if (!response.ok) {
                console.error('Failed to list models:', response.status, response.statusText);
                const text = yield response.text();
                console.error('Response:', text);
                return;
            }
            const data = yield response.json();
            console.log('Available models:');
            if (data.models) {
                data.models.forEach((m) => {
                    if (m.name.includes('gemini')) {
                        console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
                    }
                });
            }
            else {
                console.log('No models found in response:', data);
            }
        }
        catch (error) {
            console.error('Error listing models:', error.message);
        }
    });
}
listModels();
