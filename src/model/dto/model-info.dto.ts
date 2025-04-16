export interface ModelInfoDto {
  data: ModelInfo[];
}

export interface ModelInfo {
  model_name: string;
  litellm_params: {
    custom_llm_provider: string;
    use_in_pass_through: boolean;
    merge_reasoning_content_in_choices: boolean;
    model: string;
  };
  model_info: {
    id: string;
    db_model: boolean;
    key: string;
    max_tokens: number;
    max_input_tokens: number;
    max_output_tokens: number;
    input_cost_per_token: number;
    cache_creation_input_token_cost: number | null;
    cache_read_input_token_cost: number | null;
    input_cost_per_character: number;
    input_cost_per_token_above_128k_tokens: number;
    input_cost_per_query: number | null;
    input_cost_per_second: number | null;
    input_cost_per_audio_token: number | null;
    input_cost_per_token_batches: number | null;
    output_cost_per_token_batches: number | null;
    output_cost_per_token: number;
    output_cost_per_audio_token: number | null;
    output_cost_per_character: number;
    output_cost_per_token_above_128k_tokens: number;
    output_cost_per_character_above_128k_tokens: number;
    output_cost_per_second: number | null;
    output_cost_per_image: number | null;
    output_vector_size: number | null;
    litellm_provider: string;
    mode: string;
    supports_system_messages: boolean;
    supports_response_schema: boolean;
    supports_vision: boolean;
    supports_function_calling: boolean;
    supports_tool_choice: boolean;
    supports_assistant_prefill: boolean;
    supports_prompt_caching: boolean;
    supports_audio_input: boolean;
    supports_audio_output: boolean;
    supports_pdf_input: boolean;
    supports_embedding_image_input: boolean;
    supports_native_streaming: boolean | null;
    supports_web_search: boolean;
    search_context_cost_per_query: number | null;
    tpm: number;
    rpm: number;
    supported_openai_params: string[];
  };
}