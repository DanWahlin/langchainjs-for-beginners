/**
 * Chapter 6 Sample: Multilingual Search
 *
 * Run: npx tsx 07-documents-embeddings-semantic-search/samples/multilingual-search.ts
 */

import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import "dotenv/config";

const sentences = [
  { text: "Hello, how are you?", lang: "en" },
  { text: "Bonjour, comment allez-vous?", lang: "fr" },
  { text: "Hola, ¿cómo estás?", lang: "es" },
  { text: "I love artificial intelligence", lang: "en" },
  { text: "J'adore l'intelligence artificielle", lang: "fr" },
  { text: "Me encanta la inteligencia artificial", lang: "es" },
  { text: "Good morning, have a great day", lang: "en" },
  { text: "Bon matin, passez une bonne journée", lang: "fr" },
  { text: "Buenos días, que tengas un gran día", lang: "es" },
];

async function main() {
  console.log("🌍 Multi-lingual Semantic Search\n");
  console.log("=".repeat(80) + "\n");

  const embeddings = new OpenAIEmbeddings({
    model: process.env.AI_EMBEDDING_MODEL || "text-embedding-3-small",
    configuration: { baseURL: process.env.AI_ENDPOINT },
    apiKey: process.env.AI_API_KEY,
  });

  console.log("🔤 Creating multilingual vector store...\n");

  const documents = sentences.map(
    (sentence) =>
      new Document({
        pageContent: sentence.text,
        metadata: { language: sentence.lang },
      })
  );

  const vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);

  console.log("✅ Vector store ready with 9 sentences in 3 languages\n");
  console.log("=".repeat(80) + "\n");

  // Test queries in different languages
  const queries = [
    { query: "greetings and how are you", desc: "English greeting query" },
    { query: "artificial intelligence", desc: "English AI query" },
    { query: "good morning", desc: "English morning query" },
  ];

  for (const { query, desc } of queries) {
    console.log(`🔍 Query: "${query}" (${desc})\n`);
    console.log("─".repeat(80));

    const results = await vectorStore.similaritySearchWithScore(query, 3);

    results.forEach(([doc, score], index) => {
      console.log(`\n${index + 1}. ${doc.pageContent}`);
      console.log(`   Language: ${doc.metadata.language.toUpperCase()}`);
      console.log(`   Similarity: ${(score * 100).toFixed(1)}%`);
    });

    console.log("\n" + "─".repeat(80) + "\n");
  }

  console.log("=".repeat(80) + "\n");

  console.log("💡 KEY INSIGHTS:\n");
  console.log("─".repeat(80) + "\n");

  console.log("✨ Cross-Lingual Matching Works Because:");
  console.log("   1. Modern embeddings are trained on multilingual data");
  console.log("   2. Similar meanings map to similar vector space locations");
  console.log("   3. Language is abstracted away into semantic meaning\n");

  console.log("🎯 Practical Applications:");
  console.log("   - Build search that works across languages");
  console.log("   - Find similar content regardless of language");
  console.log("   - Create truly international applications\n");

  console.log("⚠️  Important Note:");
  console.log("   - Quality varies by language (English typically best)");
  console.log("   - Some models specialize in specific languages");
  console.log("   - Test with your target languages\n");

  console.log("=".repeat(80));
  console.log("\n✅ Multilingual search demonstration complete!");
}

main().catch(console.error);
