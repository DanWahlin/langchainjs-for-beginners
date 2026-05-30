/**
 * Chapter 6 Assignment Solution: Challenge 1
 * Similarity Explorer
 *
 * Run: npx tsx 07-documents-embeddings-semantic-search/solution/similarity-explorer.ts
 */

import { OpenAIEmbeddings } from "@langchain/openai";
import "dotenv/config";

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magA * magB);
}

const sentences = [
  "I love programming in JavaScript",
  "JavaScript is my favorite language",
  "Python is great for data science",
  "Machine learning uses Python often",
  "I enjoy coding web applications",
  "Dogs are loyal pets",
  "Cats are independent animals",
  "Pets bring joy to families",
  "The weather is sunny today",
  "It's raining outside",
];

async function main() {
  console.log("🔬 Similarity Explorer\n");
  console.log("=".repeat(80) + "\n");

  const embeddings = new OpenAIEmbeddings({
    model: process.env.AI_EMBEDDING_MODEL || "text-embedding-3-small",
    configuration: { baseURL: process.env.AI_ENDPOINT },
    apiKey: process.env.AI_API_KEY,
  });

  console.log("📝 Creating embeddings for 10 sentences...\n");

  const allEmbeddings = await embeddings.embedDocuments(sentences);

  console.log(`✅ Created ${allEmbeddings.length} embeddings`);
  console.log(`   Dimensions: ${allEmbeddings[0].length}\n`);

  console.log("=".repeat(80) + "\n");

  // Calculate all pairs
  const similarities: Array<{
    pair: string;
    score: number;
    i: number;
    j: number;
  }> = [];

  for (let i = 0; i < sentences.length; i++) {
    for (let j = i + 1; j < sentences.length; j++) {
      const score = cosineSimilarity(allEmbeddings[i], allEmbeddings[j]);
      similarities.push({
        pair: `"${sentences[i]}" <-> "${sentences[j]}"`,
        score,
        i,
        j,
      });
    }
  }

  // Sort by score
  similarities.sort((a, b) => b.score - a.score);

  // Most similar pair
  console.log("🏆 MOST SIMILAR PAIR:\n");
  console.log("─".repeat(80));
  const mostSimilar = similarities[0];
  console.log(`Score: ${mostSimilar.score.toFixed(4)}`);
  console.log(`\n"${sentences[mostSimilar.i]}"`);
  console.log(`"${sentences[mostSimilar.j]}"\n`);

  // Least similar pair
  console.log("─".repeat(80) + "\n");
  console.log("❄️  LEAST SIMILAR PAIR:\n");
  console.log("─".repeat(80));
  const leastSimilar = similarities[similarities.length - 1];
  console.log(`Score: ${leastSimilar.score.toFixed(4)}`);
  console.log(`\n"${sentences[leastSimilar.i]}"`);
  console.log(`"${sentences[leastSimilar.j]}"\n`);

  // High similarity pairs (> 0.8)
  console.log("─".repeat(80) + "\n");
  console.log("⭐ HIGH SIMILARITY PAIRS (Score > 0.8):\n");
  console.log("─".repeat(80));

  const highSimilarity = similarities.filter((s) => s.score > 0.8);

  if (highSimilarity.length === 0) {
    console.log("No pairs with similarity > 0.8\n");
  } else {
    highSimilarity.forEach((sim) => {
      console.log(`\nScore: ${sim.score.toFixed(4)}`);
      console.log(`"${sentences[sim.i]}"`);
      console.log(`"${sentences[sim.j]}"`);
    });
    console.log();
  }

  // Topic clustering
  console.log("─".repeat(80) + "\n");
  console.log("📊 TOPIC CLUSTERING:\n");
  console.log("─".repeat(80) + "\n");

  // Programming cluster (0, 1, 2, 3, 4)
  console.log("💻 Programming/Tech Topic:");
  [0, 1, 2, 3, 4].forEach((i) => console.log(`   ${i + 1}. ${sentences[i]}`));

  console.log("\n🐾 Pets Topic:");
  [5, 6, 7].forEach((i) => console.log(`   ${i + 1}. ${sentences[i]}`));

  console.log("\n☀️  Weather Topic:");
  [8, 9].forEach((i) => console.log(`   ${i + 1}. ${sentences[i]}`));

  console.log("\n" + "=".repeat(80));
  console.log("\n✅ Analysis complete!");
  console.log("\n💡 Key Observations:");
  console.log("   - Sentences about the same topic cluster together");
  console.log("   - JavaScript/programming sentences are most similar to each other");
  console.log("   - Unrelated topics (e.g., programming vs weather) have low similarity");
  console.log("   - Embeddings capture semantic meaning, not just keyword matching!");
}

main().catch(console.error);
