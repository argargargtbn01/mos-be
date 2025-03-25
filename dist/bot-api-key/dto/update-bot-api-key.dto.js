"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBotApiKeyDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_bot_api_key_dto_1 = require("./create-bot-api-key.dto");
class UpdateBotApiKeyDto extends (0, mapped_types_1.PartialType)(create_bot_api_key_dto_1.CreateBotApiKeyDto) {
}
exports.UpdateBotApiKeyDto = UpdateBotApiKeyDto;
//# sourceMappingURL=update-bot-api-key.dto.js.map