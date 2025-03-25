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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotApiKey = void 0;
const bot_entity_1 = require("../../bot/entities/bot.entity");
const typeorm_1 = require("typeorm");
let BotApiKey = class BotApiKey {
};
exports.BotApiKey = BotApiKey;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BotApiKey.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BotApiKey.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], BotApiKey.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bot_entity_1.Bot, (bot) => bot.botApiKeys),
    __metadata("design:type", bot_entity_1.Bot)
], BotApiKey.prototype, "bot", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], BotApiKey.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], BotApiKey.prototype, "updated_at", void 0);
exports.BotApiKey = BotApiKey = __decorate([
    (0, typeorm_1.Entity)()
], BotApiKey);
//# sourceMappingURL=bot-api-key.entity.js.map