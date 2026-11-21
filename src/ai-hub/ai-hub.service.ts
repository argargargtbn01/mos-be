import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

interface GenerateTextOptions {
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
}

interface BedrockResponse {
  completion?: string;
  outputText?: string;
  generation?: string;
  results?: Array<{ outputText?: string }>;
  content?: Array<{ text?: string }>;
  output?: {
    message?: {
      content?: Array<{ text?: string }>;
    };
  };
}

@Injectable()
export class AIHubService {
  private readonly logger = new Logger(AIHubService.name);
  private readonly bedrockRuntime: AWS.BedrockRuntime;
  private readonly defaultModelId: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');
    this.defaultModelId =
      this.configService.get<string>('BEDROCK_MODEL_ID') ||
      'anthropic.claude-3-haiku-20240307-v1:0';

    this.bedrockRuntime = new AWS.BedrockRuntime({
      region,
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
    });
  }

  async generateText(prompt: string, options: GenerateTextOptions = {}): Promise<string> {
    const modelId = this.resolveModelId(options.modelId);
    const maxTokens = options.maxTokens ?? 2000;
    const temperature = options.temperature ?? 0.7;

    this.logger.log(
      `Gọi AWS Bedrock với model: ${modelId}, temperature: ${temperature}, maxTokens: ${maxTokens}`,
    );

    const response = await this.invokeModelWithProfileFallback(
      modelId,
      prompt,
      temperature,
      maxTokens,
    );

    const payload = JSON.parse(Buffer.from(response.body as Uint8Array).toString()) as BedrockResponse;
    const text = this.extractResponseText(payload);

    if (!text) {
      throw new Error(`AWS Bedrock trả về response không có nội dung cho model ${modelId}`);
    }

    return text;
  }

  async generateAnswer(
    query: string,
    documents: unknown[],
    options: GenerateTextOptions = {},
  ): Promise<string> {
    return this.generateText(`${query}\nDocuments: ${JSON.stringify(documents)}`, options);
  }

  private resolveModelId(modelId?: string): string {
    const configuredModelId = modelId?.trim();

    if (configuredModelId && !configuredModelId.includes('/')) {
      return configuredModelId;
    }

    return this.defaultModelId;
  }

  private async invokeModelWithProfileFallback(
    modelId: string,
    prompt: string,
    temperature: number,
    maxTokens: number,
  ): Promise<AWS.BedrockRuntime.InvokeModelResponse> {
    try {
      return await this.invokeModel(modelId, prompt, temperature, maxTokens);
    } catch (error) {
      if (!this.requiresInferenceProfile(error, modelId)) {
        throw error;
      }

      const profileModelId = `us.${modelId}`;
      this.logger.warn(`Model ${modelId} yêu cầu inference profile, thử lại với ${profileModelId}`);
      return this.invokeModel(profileModelId, prompt, temperature, maxTokens);
    }
  }

  private invokeModel(
    modelId: string,
    prompt: string,
    temperature: number,
    maxTokens: number,
  ): Promise<AWS.BedrockRuntime.InvokeModelResponse> {
    return this.bedrockRuntime
      .invokeModel({
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(this.buildRequestBody(modelId, prompt, temperature, maxTokens)),
      })
      .promise();
  }

  private requiresInferenceProfile(error: any, modelId: string): boolean {
    return (
      !modelId.startsWith('us.') &&
      `${error?.message || ''}`.toLowerCase().includes('inference profile')
    );
  }

  private buildRequestBody(
    modelId: string,
    prompt: string,
    temperature: number,
    maxTokens: number,
  ): Record<string, unknown> {
    const modelFamilyId = modelId.replace(/^[a-z]{2}\./, '');

    if (modelFamilyId.startsWith('anthropic.')) {
      return {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: maxTokens,
        temperature,
        messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
      };
    }

    if (modelFamilyId.startsWith('amazon.')) {
      return {
        inputText: prompt,
        textGenerationConfig: {
          maxTokenCount: maxTokens,
          temperature,
        },
      };
    }

    if (modelFamilyId.startsWith('meta.')) {
      return {
        prompt,
        max_gen_len: maxTokens,
        temperature,
      };
    }

    if (modelFamilyId.startsWith('cohere.')) {
      return {
        prompt,
        max_tokens: maxTokens,
        temperature,
      };
    }

    throw new Error(
      `Model Bedrock "${modelId}" chưa được hỗ trợ. Hãy dùng model Anthropic, Amazon, Meta hoặc Cohere.`,
    );
  }

  private extractResponseText(payload: BedrockResponse): string {
    return (
      payload.content?.map((item) => item.text || '').join('') ||
      payload.output?.message?.content?.map((item) => item.text || '').join('') ||
      payload.completion ||
      payload.outputText ||
      payload.generation ||
      payload.results?.[0]?.outputText ||
      ''
    ).trim();
  }
}
