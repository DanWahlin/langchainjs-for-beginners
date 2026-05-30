/**
 * Text Splitting
 * Run: npx tsx 07-documents-embeddings-semantic-search/code/02-splitting.ts
 *
 * 🤖 Try asking GitHub Copilot Chat (https://github.com/features/copilot):
 * - "How do I determine the optimal chunk size for my documents?"
 * - "Can I split on specific delimiters like headings or paragraphs?"
 */

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

async function main() {
  console.log("✂️  Text Splitting Example\n");

  const longText = `
Artificial Intelligence and Machine Learning

Artificial Intelligence (AI) is transforming how we interact with technology.
From virtual assistants to recommendation systems, AI is becoming an integral
part of our daily lives.

Machine Learning Basics

Machine learning is a subset of AI that enables systems to learn and improve
from experience without being explicitly programmed. It focuses on developing
computer programs that can access data and use it to learn for themselves.

The process of learning begins with observations or data, such as examples,
direct experience, or instruction, in order to look for patterns in data and
make better decisions in the future.

Types of Machine Learning

1. Supervised Learning: The algorithm learns from labeled training data
2. Unsupervised Learning: The algorithm finds patterns in unlabeled data
3. Reinforcement Learning: The algorithm learns through trial and error

Deep Learning

Deep learning is a subset of machine learning that uses neural networks with
multiple layers. These networks can learn increasingly complex patterns as
data passes through each layer.

Applications include image recognition, natural language processing, speech
recognition, and autonomous vehicles. The field continues to evolve rapidly
with new architectures and techniques emerging regularly.
`.trim();

  console.log("Original text length:", longText.length, "characters\n");

  // Create splitter with specific configuration
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 300,
    chunkOverlap: 50,
  });

  const docs = await splitter.createDocuments([longText]);

  console.log(`✂️  Split into ${docs.length} chunks\n`);
  console.log("=".repeat(80));

  // Display each chunk
  docs.forEach((doc, i) => {
    console.log(`\n📄 Chunk ${i + 1}/${docs.length}`);
    console.log("─".repeat(80));
    console.log(doc.pageContent);
    console.log(`\n📏 Length: ${doc.pageContent.length} characters`);
  });

  console.log("\n" + "=".repeat(80));
  console.log("\n💡 Key Observations:");
  console.log(`   - Original: ${longText.length} characters`);
  console.log(`   - Chunks: ${docs.length}`);
  console.log(`   - Average chunk size: ${Math.round(longText.length / docs.length)} characters`);
  console.log(`   - Overlap: 50 characters ensures context is preserved`);
}

main().catch(console.error);
