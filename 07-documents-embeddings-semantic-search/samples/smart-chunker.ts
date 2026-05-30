/**
 * Chapter 6 Sample: Smart Chunker
 *
 * Run: npx tsx 07-documents-embeddings-semantic-search/samples/smart-chunker.ts
 */

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import "dotenv/config";

const structuredDocument = `
# LangChain.js Complete Guide

## Chapter 1: Introduction

### What is LangChain.js?

LangChain.js is a powerful framework for building applications with large language models. It provides a comprehensive set of tools and abstractions that make it easier to work with LLMs in production environments.

The framework is designed to be modular and composable, allowing developers to build complex AI applications by combining simple, reusable components.

### Key Features

LangChain.js offers several important features that make it stand out:

- Model abstraction across different providers
- Prompt template management
- Document processing capabilities
- Vector store integrations
- Chain composition for complex workflows

## Chapter 2: Getting Started

### Installation

To install LangChain.js, you can use npm or yarn. The basic installation is straightforward and only requires a single command.

First, ensure you have Node.js installed on your system. Then run the appropriate package manager command for your project.

### Configuration

After installation, you'll need to configure your environment variables. This includes setting up API keys for the AI providers you plan to use.

Create a .env file in your project root and add the necessary configuration values. Make sure to never commit this file to version control.

## Chapter 3: Core Concepts

### Models

Models are the foundation of any LangChain application. They provide the interface for interacting with large language models from various providers.

LangChain.js supports multiple model types including chat models and LLM models. Each has its own use cases and advantages.

### Prompts

Prompts are how you communicate with AI models. Effective prompt engineering can dramatically improve the quality of responses you receive from the model.

LangChain provides prompt templates that make it easy to create reusable, parameterized prompts for your applications.

## Chapter 4: Additional Topics

### Tools

Tools extend AI capabilities by providing access to external functions and APIs. This allows AI models to interact with the real world and perform actions beyond text generation.

You can create custom tools for specific tasks like database queries, web searches, or calculations that the AI can use when needed.

### Agents

Agents are AI systems that can make decisions and use tools to accomplish tasks. They represent a powerful way to build autonomous AI applications.

LangChain's agent framework provides the building blocks needed to create intelligent systems that can reason and act on their own.
`.trim();

interface SmartChunk {
  content: string;
  metadata: {
    section: string;
    subsection?: string;
    subsubsection?: string;
    level: number;
    chunkIndex: number;
  };
}

function parseStructure(content: string): SmartChunk[] {
  const lines = content.split("\n");
  const chunks: SmartChunk[] = [];

  let currentSection = "";
  let currentSubsection = "";
  let currentSubsubsection = "";
  let currentContent: string[] = [];
  let chunkIndex = 0;

  function saveChunk(level: number) {
    if (currentContent.length > 0) {
      chunks.push({
        content: currentContent.join("\n").trim(),
        metadata: {
          section: currentSection,
          subsection: currentSubsection || undefined,
          subsubsection: currentSubsubsection || undefined,
          level: level,
          chunkIndex: chunkIndex++,
        },
      });
      currentContent = [];
    }
  }

  for (const line of lines) {
    // Detect headers
    if (line.startsWith("# ")) {
      saveChunk(1);
      currentSection = line.substring(2).trim();
      currentSubsection = "";
      currentSubsubsection = "";
      currentContent.push(line);
    } else if (line.startsWith("## ")) {
      saveChunk(2);
      currentSubsection = line.substring(3).trim();
      currentSubsubsection = "";
      currentContent.push(line);
    } else if (line.startsWith("### ")) {
      saveChunk(3);
      currentSubsubsection = line.substring(4).trim();
      currentContent.push(line);
    } else {
      currentContent.push(line);

      // Create chunk if content is getting large (but keep paragraphs together)
      if (currentContent.join("\n").length > 500 && line.trim() === "") {
        saveChunk(3);
      }
    }
  }

  // Save any remaining content
  saveChunk(3);

  return chunks;
}

async function naiveChunking(content: string) {
  console.log("📝 Naive Character-Based Chunking");
  console.log("─".repeat(80));

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const chunks = await splitter.createDocuments([content]);

  console.log(`Total chunks: ${chunks.length}\n`);

  // Show first 3 chunks
  chunks.slice(0, 3).forEach((chunk, index) => {
    console.log(`Chunk ${index + 1}:`);
    console.log(`  Length: ${chunk.pageContent.length} characters`);
    console.log(`  Preview: ${chunk.pageContent.substring(0, 100)}...`);
    console.log();
  });

  return chunks;
}

function smartChunking(content: string): SmartChunk[] {
  console.log("\n🧠 Smart Structure-Based Chunking");
  console.log("─".repeat(80));

  const chunks = parseStructure(content);

  console.log(`Total chunks: ${chunks.length}\n`);

  // Show first 3 chunks with metadata
  chunks.slice(0, 3).forEach((chunk, index) => {
    console.log(`Chunk ${index + 1}:`);
    console.log(`  Section: ${chunk.metadata.section}`);
    if (chunk.metadata.subsection) {
      console.log(`  Subsection: ${chunk.metadata.subsection}`);
    }
    if (chunk.metadata.subsubsection) {
      console.log(`  Subsubsection: ${chunk.metadata.subsubsection}`);
    }
    console.log(`  Level: ${chunk.metadata.level}`);
    console.log(`  Length: ${chunk.content.length} characters`);
    console.log(`  Preview: ${chunk.content.substring(0, 100).replace(/\n/g, " ")}...`);
    console.log();
  });

  return chunks;
}

async function main() {
  console.log("🧠 Smart Document Chunker\n");
  console.log("=".repeat(80) + "\n");

  console.log(`Document Statistics:`);
  console.log(`  Total Length: ${structuredDocument.length} characters`);
  console.log(`  Lines: ${structuredDocument.split("\n").length}`);
  console.log();

  console.log("=".repeat(80) + "\n");

  // Test naive chunking
  const naiveChunks = await naiveChunking(structuredDocument);

  // Test smart chunking
  const smartChunks = smartChunking(structuredDocument);

  console.log("=".repeat(80) + "\n");

  // Comparison
  console.log("📊 COMPARISON\n");
  console.log("─".repeat(80) + "\n");

  console.log("Naive Chunking:");
  console.log(`  ✅ Simple to implement`);
  console.log(`  ✅ Works with any text`);
  console.log(`  ❌ May split in middle of sections (${naiveChunks.length} chunks)`);
  console.log(`  ❌ No structural context`);
  console.log(`  ❌ Example: May cut headers from their content\n`);

  console.log("Smart Chunking:");
  console.log(`  ✅ Respects document structure (${smartChunks.length} chunks)`);
  console.log(`  ✅ Keeps related content together`);
  console.log(`  ✅ Rich metadata for filtering`);
  console.log(`  ✅ Better for hierarchical documents`);
  console.log(`  💡 Each chunk knows its section context\n`);

  // Demonstrate metadata usage
  console.log("─".repeat(80) + "\n");
  console.log("🏷️  Metadata Benefits Example:\n");

  const chapter2Chunks = smartChunks.filter(
    (chunk) => chunk.metadata.section === "Chapter 2: Getting Started"
  );

  console.log(`Can easily filter to "Chapter 2: Getting Started": ${chapter2Chunks.length} chunks`);

  chapter2Chunks.forEach((chunk) => {
    console.log(
      `  - ${chunk.metadata.subsection || chunk.metadata.section} (Level ${chunk.metadata.level})`
    );
  });

  console.log("\n" + "=".repeat(80));
  console.log("\n✅ Smart chunking demonstrates better structure preservation!");
  console.log("💡 Use structure-aware chunking for documents with clear hierarchy!");
}

main().catch(console.error);
