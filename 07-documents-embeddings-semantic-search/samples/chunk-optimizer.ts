/**
 * Chapter 6 Sample: Chunk Optimizer
 *
 * Run: npx tsx 07-documents-embeddings-semantic-search/samples/chunk-optimizer.ts
 */

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import "dotenv/config";

const longDocument = `
The History and Future of Artificial Intelligence

Artificial Intelligence has fascinated humanity for decades. From early philosophers pondering mechanical reasoning to modern neural networks solving complex problems, the journey has been remarkable.

The Birth of AI (1950s-1960s)
The term "Artificial Intelligence" was coined in 1956 at the Dartmouth Conference. Pioneers like Alan Turing, John McCarthy, and Marvin Minsky laid the groundwork for what would become one of the most transformative technologies in human history. Early AI focused on symbolic reasoning and problem-solving, with programs like the Logic Theorist and General Problem Solver demonstrating that machines could tackle tasks previously thought to require human intelligence.

The AI Winter (1970s-1980s)
Despite initial enthusiasm, AI research faced significant challenges. The limitations of computing power, insufficient data, and overly ambitious promises led to reduced funding and skepticism. This period, known as the "AI Winter," saw many projects abandoned and researchers moving to other fields. However, some continued working on foundational concepts that would later prove crucial.

The Renaissance (1990s-2000s)
The advent of the internet, increased computing power, and new approaches like machine learning brought AI back into focus. Companies began applying AI to real-world problems: recommendation systems, search engines, and spam filters. IBM's Deep Blue defeating chess champion Garry Kasparov in 1997 captured public imagination and demonstrated AI's potential.

The Deep Learning Revolution (2010s)
The breakthrough came with deep learning neural networks. Using vast amounts of data and powerful GPUs, systems achieved superhuman performance in image recognition, speech processing, and game playing. AlphaGo's victory over world champion Lee Sedol in 2016 marked another milestone, as Go had long been considered too complex for computers to master.

The Age of Large Language Models (2020s)
The development of large language models like GPT-3, GPT-4, and others has opened new possibilities. These models can understand and generate human-like text, translate languages, write code, and assist with complex reasoning tasks. The integration of AI into everyday applications has accelerated dramatically.

Challenges and Considerations
As AI becomes more powerful, society faces important questions. How do we ensure AI systems are safe, fair, and aligned with human values? What are the implications for employment, privacy, and decision-making? Researchers and policymakers are working to address these challenges through responsible AI development, regulation, and ethical frameworks.

The Future Landscape
Looking ahead, AI will likely become even more integrated into our lives. Advances in areas like artificial general intelligence (AGI), quantum computing, and brain-computer interfaces may push the boundaries further. The key will be developing AI that augments human capabilities while remaining under human control and serving human interests.

The story of AI is still being written. Each breakthrough opens new possibilities and raises new questions. As we stand at this technological frontier, the decisions we make today will shape the AI-powered future for generations to come.`.trim();

interface ChunkConfig {
  name: string;
  chunkSize: number;
  chunkOverlap: number;
  description: string;
  useCase: string;
}

const configs: ChunkConfig[] = [
  {
    name: "Small Chunks",
    chunkSize: 200,
    chunkOverlap: 20,
    description: "Precise, focused chunks",
    useCase: "Precise question answering, specific fact retrieval",
  },
  {
    name: "Medium Chunks",
    chunkSize: 500,
    chunkOverlap: 50,
    description: "Balanced approach",
    useCase: "General-purpose RAG, balanced context and specificity",
  },
  {
    name: "Large Chunks",
    chunkSize: 1000,
    chunkOverlap: 100,
    description: "Comprehensive context",
    useCase: "Understanding broad topics, cost optimization",
  },
];

async function testChunking(config: ChunkConfig) {
  console.log(`📊 ${config.name}`);
  console.log("─".repeat(80));

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: config.chunkSize,
    chunkOverlap: config.chunkOverlap,
  });

  const chunks = await splitter.createDocuments([longDocument]);

  // Calculate statistics
  const totalChars = chunks.reduce((sum, chunk) => sum + chunk.pageContent.length, 0);
  const avgChunkSize = Math.round(totalChars / chunks.length);
  const minChunkSize = Math.min(...chunks.map((c) => c.pageContent.length));
  const maxChunkSize = Math.max(...chunks.map((c) => c.pageContent.length));

  console.log(`Configuration:`);
  console.log(`  Chunk Size: ${config.chunkSize} characters`);
  console.log(`  Overlap: ${config.chunkOverlap} characters`);
  console.log(`  Description: ${config.description}\n`);

  console.log(`Results:`);
  console.log(`  Total Chunks: ${chunks.length}`);
  console.log(`  Average Size: ${avgChunkSize} characters`);
  console.log(`  Range: ${minChunkSize} - ${maxChunkSize} characters\n`);

  console.log(`First Chunk Preview:`);
  console.log(`  "${chunks[0].pageContent.substring(0, 100)}..."\n`);

  console.log(`Last Chunk Preview:`);
  console.log(`  "${chunks[chunks.length - 1].pageContent.substring(0, 100)}..."\n`);

  console.log(`Best For: ${config.useCase}\n`);

  return {
    config: config.name,
    chunkCount: chunks.length,
    avgSize: avgChunkSize,
    firstChunk: chunks[0].pageContent.substring(0, 150),
    lastChunk: chunks[chunks.length - 1].pageContent.substring(0, 150),
  };
}

async function main() {
  console.log("📏 Optimal Chunking Experiment\n");
  console.log("=".repeat(80) + "\n");

  console.log(`Document Statistics:`);
  console.log(`  Total Length: ${longDocument.length} characters`);
  console.log(`  Word Count: ~${longDocument.split(/\s+/).length} words`);
  console.log(`  Lines: ${longDocument.split("\n").length}\n`);

  console.log("=".repeat(80) + "\n");

  const results = [];

  for (const config of configs) {
    const result = await testChunking(config);
    results.push(result);
  }

  console.log("=".repeat(80) + "\n");

  // Comparison summary
  console.log("📊 ANALYSIS SUMMARY\n");
  console.log("─".repeat(80) + "\n");

  console.log("Chunk Count Comparison:");
  results.forEach((r) => {
    console.log(`  ${r.config.padEnd(20)}: ${r.chunkCount} chunks`);
  });
  console.log();

  console.log("Trade-offs Analysis:");
  console.log("─".repeat(80));

  console.log("\n🎯 Small Chunks (200 chars):");
  console.log("  ✅ Precise fact retrieval");
  console.log("  ✅ Better for specific questions");
  console.log("  ❌ More chunks = more processing");
  console.log("  ❌ May lose broader context");

  console.log("\n⚖️  Medium Chunks (500 chars):");
  console.log("  ✅ Good balance of context and specificity");
  console.log("  ✅ Moderate number of chunks");
  console.log("  ✅ Works well for most use cases");
  console.log("  💡 Recommended starting point");

  console.log("\n📦 Large Chunks (1000 chars):");
  console.log("  ✅ Maximum context preservation");
  console.log("  ✅ Fewer chunks = faster processing");
  console.log("  ✅ Lower costs (fewer embeddings)");
  console.log("  ❌ May include irrelevant information");

  console.log("\n" + "=".repeat(80));
  console.log("\n✅ Chunking experiment complete!");
  console.log("💡 Choose chunk size based on your specific use case!");
}

main().catch(console.error);
