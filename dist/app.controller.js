"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const axios_1 = __importDefault(require("axios"));
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    getHello() {
        return this.appService.getHello();
    }
    verifyWebhook(mode, verifyToken, challenge, res) {
        if (mode === 'subscribe' && verifyToken === 'my_secret_token') {
            return res.send(challenge);
        }
        else {
            return res.send('Invalid request');
        }
    }
    async handleWebhook(body) {
        console.log('Received webhook event:', body);
        if (body.object === 'page') {
            for (const entry of body.entry) {
                const messagingEvents = entry.messaging;
                if (messagingEvents) {
                    for (const event of messagingEvents) {
                        const senderId = event.sender.id;
                        if (event.message) {
                            await this.handleMessage(senderId, event.message);
                        }
                    }
                }
            }
        }
        return 'EVENT_RECEIVED';
    }
    async handleMessage(senderId, message) {
        let responsePayload;
        if (message.text) {
            responsePayload = { text: `PVBANK LOONF` };
        }
        else {
            responsePayload = { text: 'Không nhận được tin nhắn text' };
        }
        await this.callSendAPI(senderId, responsePayload);
    }
    async callSendAPI(senderId, responsePayload) {
        const url = `https://graph.facebook.com/v21.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`;
        try {
            await axios_1.default.post(url, {
                recipient: { id: senderId },
                message: responsePayload,
            });
            console.log(`Message sent to ${senderId}`);
        }
        catch (error) {
            console.error(`Unable to send message: ${error}`);
        }
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('/webhook'),
    __param(0, (0, common_1.Query)('hub.mode')),
    __param(1, (0, common_1.Query)('hub.verify_token')),
    __param(2, (0, common_1.Query)('hub.challenge')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "verifyWebhook", null);
__decorate([
    (0, common_1.Post)('/webhook'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "handleWebhook", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map