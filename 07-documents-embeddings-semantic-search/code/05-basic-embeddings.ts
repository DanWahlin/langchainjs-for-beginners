/**
 * Basic Embeddings
 * Run: npx tsx 07-documents-embeddings-semantic-search/code/05-basic-embeddings.ts
 *
 * 🤖 Try asking GitHub Copilot Chat (https://github.com/features/copilot):
 * - "What is the cosineSimilarity function doing mathematically?"
 * - "Can I use different embedding models and how do they compare?"
 */

import { OpenAIEmbeddings } from "@langchain/openai";
import "dotenv/config";

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magA * magB);
}

async function main() {
  console.log("🔢 Basic Embeddings Example\n");

  const embeddings = new OpenAIEmbeddings({
    model: process.env.AI_EMBEDDING_MODEL || "text-embedding-3-small",
    configuration: { baseURL: process.env.AI_ENDPOINT },
    apiKey: process.env.AI_API_KEY,
  });

  // Create embeddings for different texts
  const texts = [
    "LangChain makes building AI apps easier",
    "LangChain simplifies AI application development",
    "I love eating pizza for dinner",
    "The weather is sunny today",
  ];

  console.log("Creating embeddings for texts...\n");

  const allEmbeddings = await embeddings.embedDocuments(texts);

  console.log(`✅ Created ${allEmbeddings.length} embeddings`);
  console.log(`   Each embedding has ${allEmbeddings[0].length} dimensions\n`);

  // Show first embedding details
  console.log("First embedding (first 10 values):");
  console.log(allEmbeddings[0].slice(0, 10));
  console.log("\n" + "=".repeat(80) + "\n");

  // Compare similarities
  console.log("📊 Similarity Comparisons:\n");

  const pairs = [
    [0, 1, "LangChain vs LangChain (similar meaning)"],
    [0, 2, "LangChain vs Pizza (different topics)"],
    [0, 3, "LangChain vs Weather (different topics)"],
    [2, 3, "Pizza vs Weather (both different from LangChain)"],
  ];

  pairs.forEach(([i, j, description]) => {
    const similarity = cosineSimilarity(allEmbeddings[i as number], allEmbeddings[j as number]);
    console.log(`${description}:`);
    console.log(`   Score: ${similarity.toFixed(4)}`);
    console.log(`   Texts: "${texts[i as number]}" vs "${texts[j as number]}"\n`);
  });

  console.log("=".repeat(80));
  console.log("\n💡 Key Insights:");
  console.log("   - Similar meanings → High similarity scores (>0.8)");
  console.log("   - Different topics → Low similarity scores (<0.5)");
  console.log("   - Embeddings capture semantic meaning, not just keywords!");
}

main().catch(console.error);
