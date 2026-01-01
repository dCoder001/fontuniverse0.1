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
function testEndpoints() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Testing Font Universe API...');
        // Test 1: Generate Text
        try {
            console.log('\n1. Testing /api/generate-text...');
            const genResponse = yield fetch('http://127.0.0.1:3000/api/generate-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: 'Space exploration',
                    type: 'slogan'
                })
            });
            if (genResponse.ok) {
                const genData = yield genResponse.json();
                console.log('✅ Generate Text Success:', genData);
            }
            else {
                console.error('❌ Generate Text Failed:', genResponse.statusText);
            }
        }
        catch (error) {
            console.error('❌ Generate Text Error:', error.message);
        }
        // Test 2: Optimize Prompt
        try {
            console.log('\n2. Testing /api/optimize-prompt...');
            const optResponse = yield fetch('http://127.0.0.1:3000/api/optimize-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: 'Write a story about a cat',
                    focus: 'creativity',
                    intensity: 80
                })
            });
            if (optResponse.ok) {
                const optData = yield optResponse.json();
                console.log('✅ Optimize Prompt Success:', optData);
            }
            else {
                console.error('❌ Optimize Prompt Failed:', optResponse.statusText);
            }
        }
        catch (error) {
            console.error('❌ Optimize Prompt Error:', error.message);
        }
    });
}
testEndpoints();
