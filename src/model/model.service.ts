import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Model } from './entities/model.entity';
import { ModelInfo } from './dto/model-info.dto';
import {
  BedrockClient,
  GetFoundationModelAvailabilityCommand,
  ListFoundationModelsCommand,
  type FoundationModelSummary,
} from '@aws-sdk/client-bedrock';

@Injectable()
export class ModelService {
  constructor(
    @InjectRepository(Model)
    private readonly modelRepository: Repository<Model>,
    private readonly configService: ConfigService,
  ) {}

  async findAll(): Promise<ModelInfo[]> {
    try {
      const bedrock = new BedrockClient({
        region: this.configService.get<string>('AWS_REGION'),
        credentials: {
          accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
          secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
        },
      });
      const response = await bedrock.send(
        new ListFoundationModelsCommand({
          byOutputModality: 'TEXT',
        }),
      );
      const models = (response.modelSummaries || []).filter(
        (model): model is FoundationModelSummary =>
          Boolean(model.modelId) && model.modelLifecycle?.status !== 'LEGACY',
      );
      const availableModels = await Promise.all(
        models.map(async (model) => ((await this.isAvailable(bedrock, model.modelId)) ? model : null)),
      );

      return availableModels
        .filter((model): model is FoundationModelSummary => Boolean(model))
        .map((model) => ({
          model_name: model.modelId,
          litellm_params: {
            custom_llm_provider: (model.providerName || 'aws').toLowerCase(),
            use_in_pass_through: false,
            merge_reasoning_content_in_choices: false,
            model: model.modelId,
          },
          model_info: {
            id: model.modelId,
            db_model: false,
            key: '',
            max_tokens: 2000,
            max_input_tokens: 0,
            max_output_tokens: 2000,
            input_cost_per_token: 0,
            cache_creation_input_token_cost: null,
            cache_read_input_token_cost: null,
            input_cost_per_character: 0,
            input_cost_per_token_above_128k_tokens: 0,
            input_cost_per_query: null,
            input_cost_per_second: null,
            input_cost_per_audio_token: null,
            input_cost_per_token_batches: null,
            output_cost_per_token_batches: null,
            output_cost_per_token: 0,
            output_cost_per_audio_token: null,
            output_cost_per_character: 0,
            output_cost_per_token_above_128k_tokens: 0,
            output_cost_per_character_above_128k_tokens: 0,
            output_cost_per_second: null,
            output_cost_per_image: null,
            output_vector_size: null,
            litellm_provider: 'bedrock',
            mode: model.outputModalities?.includes('TEXT') ? 'chat' : 'unknown',
            supports_system_messages: model.inputModalities?.includes('TEXT') || false,
            supports_response_schema: false,
            supports_vision: model.inputModalities?.includes('IMAGE') || false,
            supports_function_calling: false,
            supports_tool_choice: false,
            supports_assistant_prefill: false,
            supports_prompt_caching: false,
            supports_audio_input: false,
            supports_audio_output: false,
            supports_pdf_input: false,
            supports_embedding_image_input: false,
            supports_native_streaming: model.responseStreamingSupported || false,
            supports_web_search: false,
            search_context_cost_per_query: null,
            tpm: 0,
            rpm: 0,
            supported_openai_params: [],
          },
        }));
    } catch (error) {
      throw new Error(`Failed to fetch Bedrock models: ${error.message}`);
    }
  }

  private async isAvailable(
    bedrock: BedrockClient,
    modelId: string | undefined,
  ): Promise<boolean> {
    if (!modelId) {
      return false;
    }

    const availability = await bedrock.send(
      new GetFoundationModelAvailabilityCommand({ modelId }),
    );

    return (
      availability.authorizationStatus === 'AUTHORIZED' &&
      availability.entitlementAvailability === 'AVAILABLE' &&
      availability.regionAvailability === 'AVAILABLE' &&
      (!availability.agreementAvailability ||
        availability.agreementAvailability.status === 'AVAILABLE')
    );
  }

  async findOne(id: number): Promise<Model> {
    return this.modelRepository.findOneBy({ id });
  }

  async findByName(name: string): Promise<ModelInfo | undefined> {
    try {
      const models = await this.findAll();
      return models.find((model) => model.model_name === name);
    } catch (error) {
      throw new HttpException(
        `Error finding model by name: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(model: Partial<Model>): Promise<Model> {
    const newModel = this.modelRepository.create(model);
    return this.modelRepository.save(newModel);
  }

  async update(id: number, model: Partial<Model>): Promise<Model> {
    await this.modelRepository.update(id, model);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.modelRepository.delete(id);
  }
}
