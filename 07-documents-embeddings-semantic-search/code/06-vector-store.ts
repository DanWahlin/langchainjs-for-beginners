/**
 * Vector Store and Semantic Search
 * Run: npx tsx 07-documents-embeddings-semantic-search/code/06-vector-store.ts
 *
 * 🤖 Try asking GitHub Copilot Chat (https://github.com/features/copilot):
 * - "What's the difference between MemoryVectorStore and persistent stores like Pinecone?"
 * - "Can I save and load a MemoryVectorStore to avoid recomputing embeddings?"
 */

import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import "dotenv/config";

async function main() {
  console.log("🗄️  Vector Store and Semantic Search\n");

  const embeddings = new OpenAIEmbeddings({
    model: process.env.AI_EMBEDDING_MODEL || "text-embedding-3-small",
    configuration: { baseURL: process.env.AI_ENDPOINT },
    apiKey: process.env.AI_API_KEY,
  });

  // Create documents about different topics
  const docs = [
    new Document({
      pageContent:
        "Python is a popular programming language for data science and machine learning.",
      metadata: { category: "programming", language: "python" },
    }),
    new Document({
      pageContent:
        "JavaScript is widely used for web development and building interactive websites.",
      metadata: { category: "programming", language: "javascript" },
    }),
    new Document({
      pageContent: "Machine learning algorithms can identify patterns in large datasets.",
      metadata: { category: "AI", topic: "machine-learning" },
    }),
    new Document({
      pageContent: "Neural networks are inspired by the human brain and used in deep learning.",
      metadata: { category: "AI", topic: "deep-learning" },
    }),
    new Document({
      pageContent: "Cats are independent pets that enjoy napping and hunting mice.",
      metadata: { category: "animals", type: "mammals" },
    }),
    new Document({
      pageContent: "Dogs are loyal companions that love playing fetch and going for walks.",
      metadata: { category: "animals", type: "mammals" },
    }),
  ];

  console.log(`📚 Creating vector store with ${docs.length} documents...\n`);

  // Create vector store
  const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

  console.log("✅ Vector store created!\n");
  console.log("=".repeat(80) + "\n");

  // Perform semantic searches
  const searches = [
    { query: "programming languages for AI", k: 2 },
    { query: "pets that need exercise", k: 2 },
    { query: "building websites", k: 2 },
    { query: "understanding data patterns", k: 2 },
  ];

  for (const { query, k } of searches) {
    console.log(`🔍 Search: "${query}" (top ${k} results)\n`);

    const results = await vectorStore.similaritySearch(query, k);

    results.forEach((doc, i) => {
      console.log(`   ${i + 1}. ${doc.pageContent}`);
      console.log(`      Category: ${doc.metadata.category}\n`);
    });

    console.log("─".repeat(80) + "\n");
  }

  // Search with similarity scores
  console.log("=".repeat(80));
  console.log("\n📊 Search with Similarity Scores:\n");

  const query = "animals that make good house pets";
  const resultsWithScores = await vectorStore.similaritySearchWithScore(query, 4);

  console.log(`Query: "${query}"\n`);

  resultsWithScores.forEach(([doc, score]) => {
    console.log(`Score: ${score.toFixed(4)} - ${doc.pageContent}`);
  });

  console.log("\n" + "=".repeat(80));
  console.log("\n💡 Notice:");
  console.log("   - Results are ranked by semantic similarity");
  console.log("   - Exact keywords aren't required!");
  console.log("   - AI understands context and meaning");
}

main().catch(console.error);
