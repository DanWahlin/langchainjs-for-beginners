/**
 * Shared Model Configuration Utilities
 *
 * This module provides helper functions to create LangChain model instances
 * with proper configuration for both GitHub Models and Microsoft Foundry.
 *
 * Usage:
 *   import { createChatModel, createEmbeddings } from "@/scripts/create-model.js";
 *   const model = createChatModel();
 *   const embeddings = createEmbeddings();
 */

import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

/**
 * Creates a ChatOpenAI instance configured for GitHub Models or Microsoft Foundry
 *
 * Automatically detects Azure endpoints and adds the required deployment path.
 * Works seamlessly with GitHub Models endpoints as well.
 *
 * @param options - Optional ChatOpenAI configuration overrides
 * @returns Configured ChatOpenAI instance
 */
export function createChatModel(options?: ConstructorParameters<typeof ChatOpenAI>[0]) {
  return new ChatOpenAI({
    model: process.env.AI_MODEL,
    configuration: { baseURL: process.env.AI_ENDPOINT },
    apiKey: process.env.AI_API_KEY,
    ...options, // Allow overriding any defaults
  });
}

/**
 * Creates an OpenAIEmbeddings instance configured for GitHub Models or Microsoft Foundry
 *
 * Automatically detects Azure endpoints and adds the required deployment path.
 * Works seamlessly with GitHub Models endpoints as well.
 *
 * @param options - Optional OpenAIEmbeddings configuration overrides
 * @returns Configured OpenAIEmbeddings instance
 */
export function createEmbeddingsModel(options?: ConstructorParameters<typeof OpenAIEmbeddings>[0]) {
  return new OpenAIEmbeddings({
    model: process.env.AI_EMBEDDING_MODEL || "text-embedding-3-small",
    configuration: { baseURL: process.env.AI_ENDPOINT },
    apiKey: process.env.AI_API_KEY,
    ...options, // Allow overriding any defaults
  });
}
