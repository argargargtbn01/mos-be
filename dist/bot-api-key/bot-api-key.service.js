"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotApiKeyService = void 0;
const common_1 = require("@nestjs/common");
let BotApiKeyService = class BotApiKeyService {
    create(createBotApiKeyDto) {
        return 'This action adds a new botApiKey';
    }
    findAll() {
        return `This action returns all botApiKey`;
    }
    findOne(id) {
        return `This action returns a #${id} botApiKey`;
    }
    update(id, updateBotApiKeyDto) {
        return `This action updates a #${id} botApiKey`;
    }
    remove(id) {
        return `This action removes a #${id} botApiKey`;
    }
};
exports.BotApiKeyService = BotApiKeyService;
exports.BotApiKeyService = BotApiKeyService = __decorate([
    (0, common_1.Injectable)()
], BotApiKeyService);
//# sourceMappingURL=bot-api-key.service.js.map