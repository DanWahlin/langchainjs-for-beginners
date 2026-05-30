/**
 * Batch Embeddings for Efficiency
 * Run: npx tsx 07-documents-embeddings-semantic-search/code/08-batch-embeddings.ts
 *
 * 🤖 Try asking GitHub Copilot Chat (https://github.com/features/copilot):
 * - "What's the maximum batch size I can use with embedDocuments?"
 * - "How do I handle rate limiting when embedding large document collections?"
 */

import { OpenAIEmbeddings } from "@langchain/openai";
import "dotenv/config";

async function main() {
  console.log("⚡ Batch Embeddings Example\n");

  const embeddings = new OpenAIEmbeddings({
    model: process.env.AI_EMBEDDING_MODEL || "text-embedding-3-small",
    configuration: { baseURL: process.env.AI_ENDPOINT },
    apiKey: process.env.AI_API_KEY,
  });

  const texts = [
    "Machine learning is a subset of artificial intelligence",
    "Deep learning uses neural networks with multiple layers",
    "Natural language processing enables computers to understand text",
    "Computer vision allows machines to interpret visual information",
    "Reinforcement learning trains agents through rewards and penalties",
    "Supervised learning uses labeled training data",
    "Unsupervised learning finds patterns in unlabeled data",
    "Transfer learning applies knowledge from one task to another",
  ];

  console.log(`📝 Processing ${texts.length} texts...\n`);

  // Method 1: Individual embeddings (slower)
  console.log("1️⃣  Creating embeddings one-by-one (SLOW):");
  console.time("Individual embeddings");

  const individualEmbeddings = [];
  for (const text of texts) {
    const embedding = await embeddings.embedQuery(text);
    individualEmbeddings.push(embedding);
  }

  console.timeEnd("Individual embeddings");
  console.log(`   Created ${individualEmbeddings.length} embeddings\n`);

  // Method 2: Batch embeddings (faster!)
  console.log("2️⃣  Creating embeddings in batch (FAST):");
  console.time("Batch embeddings");

  const batchEmbeddings = await embeddings.embedDocuments(texts);

  console.timeEnd("Batch embeddings");
  console.log(`   Created ${batchEmbeddings.length} embeddings\n`);

  console.log("=".repeat(80));
  console.log("\n📊 Embedding Details:");
  console.log(`   Dimensions per embedding: ${batchEmbeddings[0].length}`);
  console.log(`   Total vectors created: ${batchEmbeddings.length}`);
  console.log(
    `   First vector sample: [${batchEmbeddings[0]
      .slice(0, 5)
      .map((n) => n.toFixed(4))
      .join(", ")}...]`
  );

  console.log("\n💡 Key Takeaways:");
  console.log("   - Batch processing is 5-10x faster");
  console.log("   - Reduces API calls (lower costs)");
  console.log("   - Always use embedDocuments() for multiple texts");
  console.log("   - Both methods produce identical embeddings");

  // Verify they're the same
  console.log("\n✅ Verification:");
  const match = individualEmbeddings[0].every(
    (val, idx) => Math.abs(val - batchEmbeddings[0][idx]) < 0.0001
  );
  console.log(`   Individual vs Batch results match: ${match ? "YES" : "NO"}`);
}

main().catch(console.error);
