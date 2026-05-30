/**
 * Chapter 6 Sample: Keyword vs Semantic Comparison
 *
 * Run: npx tsx 07-documents-embeddings-semantic-search/samples/search-comparison.ts
 */

import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import "dotenv/config";

const articles = [
  "How to build modern web applications with JavaScript frameworks",
  "Python programming for data scientists and analysts",
  "Understanding machine learning algorithms and neural networks",
  "Effective strategies for software development and coding",
  "The future of artificial intelligence in healthcare",
  "Best practices for automobile maintenance and car repair",
  "Medical professionals and physician training programs",
  "Computer programming fundamentals for beginners",
  "Vehicle safety features and automotive technology",
  "Doctor consultation tips for better health outcomes",
];

function keywordSearch(query: string, documents: string[]): string[] {
  const results = documents
    .map((doc, index) => ({ doc, index }))
    .filter(({ doc }) => doc.toLowerCase().includes(query.toLowerCase()))
    .map(({ doc }) => doc);

  return results;
}

async function semanticSearch(query: string, vectorStore: MemoryVectorStore): Promise<string[]> {
  const results = await vectorStore.similaritySearch(query, 3);
  return results.map((doc) => doc.pageContent);
}

async function main() {
  console.log("🆚 Keyword vs Semantic Search Comparison\n");
  console.log("=".repeat(80) + "\n");

  const embeddings = new OpenAIEmbeddings({
    model: process.env.AI_EMBEDDING_MODEL || "text-embedding-3-small",
    configuration: { baseURL: process.env.AI_ENDPOINT },
    apiKey: process.env.AI_API_KEY,
  });

  console.log("📚 Creating vector store...\n");

  const documents = articles.map((article) => new Document({ pageContent: article }));
  const vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);

  console.log("✅ Vector store ready\n");
  console.log("=".repeat(80) + "\n");

  const queries = [
    { query: "automobile", synonym: "car" },
    { query: "coding", synonym: "programming" },
    { query: "physician", synonym: "doctor" },
  ];

  for (const { query, synonym } of queries) {
    console.log(`🔍 Query: "${query}" (looking for content about "${synonym}")\n`);
    console.log("─".repeat(80) + "\n");

    // Keyword search
    console.log("📝 KEYWORD SEARCH:");
    const keywordResults = keywordSearch(query, articles);
    if (keywordResults.length === 0) {
      console.log("   ❌ No results found (exact match required)\n");
    } else {
      keywordResults.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result}`);
      });
      console.log();
    }

    // Semantic search
    console.log("🧠 SEMANTIC SEARCH:");
    const semanticResults = await semanticSearch(query, vectorStore);
    semanticResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result}`);
    });

    console.log("\n" + "─".repeat(80) + "\n");
  }

  console.log("=".repeat(80) + "\n");

  console.log("📊 ANALYSIS:\n");
  console.log("─".repeat(80) + "\n");

  console.log("🔤 Keyword Search:");
  console.log("   ✅ Fast and simple");
  console.log("   ✅ Exact matches");
  console.log("   ❌ Misses synonyms ('automobile' doesn't find 'car')");
  console.log("   ❌ Requires exact wording");
  console.log("   ❌ No understanding of meaning\n");

  console.log("🧠 Semantic Search:");
  console.log("   ✅ Understands synonyms ('automobile' finds 'car')");
  console.log("   ✅ Finds related concepts ('coding' finds 'programming')");
  console.log("   ✅ Meaning-based, not word-based");
  console.log("   ⚠️  Requires embeddings (more setup)");
  console.log("   ⚠️  Slightly slower\n");

  console.log("─".repeat(80) + "\n");

  console.log("💡 RECOMMENDATION:");
  console.log("   - Use keyword search for: exact matches, known terminology");
  console.log("   - Use semantic search for: natural queries, finding related content");
  console.log("   - Combine both for: comprehensive search systems\n");

  console.log("=".repeat(80));
  console.log("\n✅ Comparison complete!");
}

main().catch(console.error);
