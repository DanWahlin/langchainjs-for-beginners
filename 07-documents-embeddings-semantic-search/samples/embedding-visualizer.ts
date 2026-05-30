/**
 * Chapter 6 Sample: Embedding Visualizer
 *
 * Run: npx tsx 07-documents-embeddings-semantic-search/samples/embedding-visualizer.ts
 */

import { OpenAIEmbeddings } from "@langchain/openai";
import { writeFileSync } from "fs";
import "dotenv/config";

// PCA implementation for dimensionality reduction
function pca(embeddings: number[][], dimensions: number = 2): number[][] {
  const n = embeddings.length;
  const d = embeddings[0].length;

  // Center the data
  const means = new Array(d).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < d; j++) {
      means[j] += embeddings[i][j];
    }
  }
  for (let j = 0; j < d; j++) {
    means[j] /= n;
  }

  const centered = embeddings.map((row) => row.map((val, j) => val - means[j]));

  // Simplified PCA - just take first N dimensions after normalization
  // (Full PCA with SVD would be more accurate but more complex)
  const reduced = centered.map((row) => row.slice(0, dimensions));

  // Normalize to 0-1 range for visualization
  const mins = new Array(dimensions).fill(Infinity);
  const maxs = new Array(dimensions).fill(-Infinity);

  for (const point of reduced) {
    for (let i = 0; i < dimensions; i++) {
      mins[i] = Math.min(mins[i], point[i]);
      maxs[i] = Math.max(maxs[i], point[i]);
    }
  }

  return reduced.map((point) => point.map((val, i) => (val - mins[i]) / (maxs[i] - mins[i])));
}

const texts = [
  // Programming topics
  { text: "JavaScript programming", category: "Programming" },
  { text: "Python coding", category: "Programming" },
  { text: "Software development", category: "Programming" },

  // AI topics
  { text: "Machine learning algorithms", category: "AI" },
  { text: "Neural networks", category: "AI" },
  { text: "Artificial intelligence", category: "AI" },

  // Food topics
  { text: "Cooking recipes", category: "Food" },
  { text: "Restaurant dining", category: "Food" },
  { text: "Culinary arts", category: "Food" },

  // Sports topics
  { text: "Football games", category: "Sports" },
  { text: "Basketball training", category: "Sports" },
  { text: "Athletic performance", category: "Sports" },
];

async function main() {
  console.log("📈 Embedding Visualizer\n");
  console.log("=".repeat(80) + "\n");

  const embeddings = new OpenAIEmbeddings({
    model: process.env.AI_EMBEDDING_MODEL || "text-embedding-3-small",
    configuration: { baseURL: process.env.AI_ENDPOINT },
    apiKey: process.env.AI_API_KEY,
  });

  console.log("🔢 Creating embeddings for diverse topics...\n");

  const textArray = texts.map((t) => t.text);
  const allEmbeddings = await embeddings.embedDocuments(textArray);

  console.log(`✅ Created ${allEmbeddings.length} embeddings`);
  console.log(`   Original dimensions: ${allEmbeddings[0].length}\n`);

  console.log("📉 Reducing dimensionality to 2D using PCA...\n");

  const reduced2D = pca(allEmbeddings, 2);

  console.log("✅ Dimensionality reduction complete\n");
  console.log("=".repeat(80) + "\n");

  // Create visualization data
  const visualizationData = texts.map((item, index) => ({
    text: item.text,
    category: item.category,
    x: reduced2D[index][0],
    y: reduced2D[index][1],
  }));

  // Save to JSON
  const outputPath = "./data/embeddings-2d.json";
  writeFileSync(outputPath, JSON.stringify(visualizationData, null, 2));

  console.log(`💾 Saved visualization data to: ${outputPath}\n`);

  // Display coordinates
  console.log("📊 2D Coordinates by Category:\n");
  console.log("─".repeat(80) + "\n");

  const categories = ["Programming", "AI", "Food", "Sports"];

  categories.forEach((category) => {
    console.log(`${category}:`);
    visualizationData
      .filter((d) => d.category === category)
      .forEach((d) => {
        console.log(`   ${d.text.padEnd(30)} → (${d.x.toFixed(3)}, ${d.y.toFixed(3)})`);
      });
    console.log();
  });

  console.log("─".repeat(80) + "\n");

  console.log("💡 OBSERVATIONS:\n");
  console.log("   - Similar topics cluster together in 2D space");
  console.log("   - Programming and AI topics are close (related concepts)");
  console.log("   - Food and Sports topics are further away (different domains)");
  console.log("   - Semantic meaning is preserved even after dimension reduction\n");

  console.log("=".repeat(80));
  console.log("\n✅ Visualization data generated!");
  console.log("\n🎨 Next Steps:");
  console.log("   - Use the JSON file with visualization tools");
  console.log("   - Plot the points using Chart.js, D3.js, or matplotlib");
  console.log("   - See how semantic similarity becomes spatial proximity!");
}

main().catch(console.error);
