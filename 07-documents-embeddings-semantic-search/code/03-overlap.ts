/**
 * Comparing Chunk Overlap
 * Run: npx tsx 07-documents-embeddings-semantic-search/code/03-overlap.ts
 *
 * 🤖 Try asking GitHub Copilot Chat (https://github.com/features/copilot):
 * - "What percentage overlap is recommended for different chunk sizes?"
 * - "Can too much overlap cause duplicate information in search results?"
 */

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

async function main() {
  console.log("🔄 Chunk Overlap Comparison\n");

  const text = `
The mitochondria is often called the powerhouse of the cell. This organelle
is responsible for producing ATP, the energy currency that powers cellular
processes. Mitochondria have their own DNA, separate from the cell's nuclear
DNA, which supports the theory that they were once independent organisms.
Through a process called cellular respiration, mitochondria convert nutrients
into usable energy. This process involves several complex steps including
glycolysis, the Krebs cycle, and the electron transport chain.
`.trim();

  console.log("Original text:");
  console.log("─".repeat(80));
  console.log(text);
  console.log("\n" + "=".repeat(80));

  // Splitter with NO overlap
  console.log("\n1️⃣  Splitting with NO overlap:\n");

  const noOverlap = new RecursiveCharacterTextSplitter({
    chunkSize: 150,
    chunkOverlap: 0,
  });

  const chunks1 = await noOverlap.createDocuments([text]);

  chunks1.forEach((doc, i) => {
    console.log(`Chunk ${i + 1}: "${doc.pageContent}"`);
    console.log();
  });

  console.log("⚠️  Notice: Context may be lost between chunks!\n");

  // Splitter WITH overlap
  console.log("=".repeat(80));
  console.log("\n2️⃣  Splitting WITH overlap (30 characters):\n");

  const withOverlap = new RecursiveCharacterTextSplitter({
    chunkSize: 150,
    chunkOverlap: 30,
  });

  const chunks2 = await withOverlap.createDocuments([text]);

  chunks2.forEach((doc, i) => {
    console.log(`Chunk ${i + 1}: "${doc.pageContent}"`);

    // Highlight overlap if not the first chunk
    if (i > 0) {
      const overlap = doc.pageContent.substring(0, 30);
      console.log(`   ↪️  Overlaps with: "${overlap}..."`);
    }
    console.log();
  });

  console.log("✅ Notice: Overlapping text preserves context!\n");

  console.log("=".repeat(80));
  console.log("\n📊 Comparison:");
  console.log(`   Without overlap: ${chunks1.length} chunks`);
  console.log(`   With overlap: ${chunks2.length} chunks`);
  console.log("\n💡 Recommendation: Use 10-20% overlap for most use cases");
}

main().catch(console.error);
