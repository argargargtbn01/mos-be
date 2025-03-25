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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotController = void 0;
const common_1 = require("@nestjs/common");
const bot_service_1 = require("./bot.service");
const create_bot_dto_1 = require("./dto/create-bot.dto");
const update_bot_dto_1 = require("./dto/update-bot.dto");
let BotController = class BotController {
    constructor(botService) {
        this.botService = botService;
    }
    create(createBotDto) {
        return this.botService.create(createBotDto);
    }
    findAll() {
        return this.botService.findAll();
    }
    findOne(id) {
        return this.botService.findOne(+id);
    }
    update(id, updateBotDto) {
        return this.botService.update(+id, updateBotDto);
    }
    remove(id) {
        return this.botService.remove(+id);
    }
};
exports.BotController = BotController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_bot_dto_1.CreateBotDto]),
    __metadata("design:returntype", void 0)
], BotController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BotController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BotController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_bot_dto_1.UpdateBotDto]),
    __metadata("design:returntype", void 0)
], BotController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BotController.prototype, "remove", null);
exports.BotController = BotController = __decorate([
    (0, common_1.Controller)('bot'),
    __metadata("design:paramtypes", [bot_service_1.BotService])
], BotController);
//# sourceMappingURL=bot.controller.js.map