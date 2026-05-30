/**
 * Chapter 6 Sample: Document Organizer
 *
 * Run: npx tsx 07-documents-embeddings-semantic-search/samples/doc-organizer.ts
 */

import { Document } from "@langchain/core/documents";
import readline from "readline";
import "dotenv/config";

// Sample documents with rich metadata
const documents: Document[] = [
  new Document({
    pageContent: "Introduction to machine learning algorithms and supervised learning techniques.",
    metadata: {
      category: "AI",
      date: "2024-01-15",
      author: "Dr. Sarah Chen",
      tags: ["ML", "algorithms"],
    },
  }),
  new Document({
    pageContent: "Understanding neural networks and deep learning fundamentals for beginners.",
    metadata: {
      category: "AI",
      date: "2024-01-20",
      author: "Prof. Mike Rodriguez",
      tags: ["deep-learning", "neural-nets"],
    },
  }),
  new Document({
    pageContent: "Building RESTful APIs with Node.js and Express framework best practices.",
    metadata: {
      category: "Programming",
      date: "2024-02-01",
      author: "Jane Developer",
      tags: ["nodejs", "API", "backend"],
    },
  }),
  new Document({
    pageContent: "React hooks: useState, useEffect, and custom hooks explained with examples.",
    metadata: {
      category: "Programming",
      date: "2024-02-10",
      author: "Alex Frontend",
      tags: ["react", "hooks", "frontend"],
    },
  }),
  new Document({
    pageContent: "Database design principles: normalization, indexing, and query optimization.",
    metadata: {
      category: "Database",
      date: "2024-01-25",
      author: "Emma Database",
      tags: ["sql", "design", "optimization"],
    },
  }),
  new Document({
    pageContent: "Introduction to NoSQL databases: MongoDB, Cassandra, and Redis comparison.",
    metadata: {
      category: "Database",
      date: "2024-02-15",
      author: "David NoSQL",
      tags: ["nosql", "mongodb", "redis"],
    },
  }),
  new Document({
    pageContent:
      "Natural language processing techniques for sentiment analysis and text classification.",
    metadata: {
      category: "AI",
      date: "2024-01-30",
      author: "Dr. Sarah Chen",
      tags: ["NLP", "sentiment", "text"],
    },
  }),
  new Document({
    pageContent:
      "TypeScript type features: generics, utility types, and conditional types explained.",
    metadata: {
      category: "Programming",
      date: "2024-02-20",
      author: "Tom TypeScript",
      tags: ["typescript", "types", "extended"],
    },
  }),
  new Document({
    pageContent: "Docker containerization and Kubernetes orchestration for modern applications.",
    metadata: {
      category: "DevOps",
      date: "2024-02-05",
      author: "Lisa DevOps",
      tags: ["docker", "kubernetes", "containers"],
    },
  }),
  new Document({
    pageContent:
      "CI/CD pipelines with GitHub Actions: automated testing and deployment strategies.",
    metadata: {
      category: "DevOps",
      date: "2024-02-12",
      author: "Chris Pipeline",
      tags: ["ci-cd", "github-actions", "automation"],
    },
  }),
  new Document({
    pageContent: "Reinforcement learning basics: Q-learning, policy gradients, and applications.",
    metadata: {
      category: "AI",
      date: "2024-02-18",
      author: "Prof. Mike Rodriguez",
      tags: ["RL", "Q-learning", "algorithms"],
    },
  }),
  new Document({
    pageContent:
      "GraphQL APIs: schema design, resolvers, and optimization techniques for scalability.",
    metadata: {
      category: "Programming",
      date: "2024-02-25",
      author: "Jane Developer",
      tags: ["graphql", "API", "schema"],
    },
  }),
];

function listAllDocuments() {
  console.log("\n📚 All Documents\n");
  console.log("─".repeat(80));

  documents.forEach((doc, index) => {
    console.log(`\n${index + 1}. ${doc.pageContent.substring(0, 70)}...`);
    console.log(`   📁 Category: ${doc.metadata.category}`);
    console.log(`   📅 Date: ${doc.metadata.date}`);
    console.log(`   ✍️  Author: ${doc.metadata.author}`);
    console.log(`   🏷️  Tags: ${doc.metadata.tags.join(", ")}`);
  });

  console.log("\n─".repeat(80));
  console.log(`Total Documents: ${documents.length}\n`);
}

function filterByCategory(category: string) {
  const filtered = documents.filter(
    (doc) => doc.metadata.category.toLowerCase() === category.toLowerCase()
  );

  console.log(`\n📁 Documents in category: ${category}\n`);
  console.log("─".repeat(80));

  if (filtered.length === 0) {
    console.log("No documents found in this category.\n");
    return;
  }

  filtered.forEach((doc, index) => {
    console.log(`\n${index + 1}. ${doc.pageContent.substring(0, 70)}...`);
    console.log(`   📅 Date: ${doc.metadata.date}`);
    console.log(`   ✍️  Author: ${doc.metadata.author}`);
  });

  console.log("\n─".repeat(80));
  console.log(`Found ${filtered.length} documents\n`);
}

function filterByDateRange(startDate: string, endDate: string) {
  const filtered = documents.filter((doc) => {
    const docDate = doc.metadata.date;
    return docDate >= startDate && docDate <= endDate;
  });

  console.log(`\n📅 Documents from ${startDate} to ${endDate}\n`);
  console.log("─".repeat(80));

  if (filtered.length === 0) {
    console.log("No documents found in this date range.\n");
    return;
  }

  filtered.forEach((doc, index) => {
    console.log(`\n${index + 1}. ${doc.pageContent.substring(0, 70)}...`);
    console.log(`   📁 Category: ${doc.metadata.category}`);
    console.log(`   📅 Date: ${doc.metadata.date}`);
    console.log(`   ✍️  Author: ${doc.metadata.author}`);
  });

  console.log("\n─".repeat(80));
  console.log(`Found ${filtered.length} documents\n`);
}

function searchByTag(tag: string) {
  const filtered = documents.filter((doc) =>
    doc.metadata.tags.some((t: string) => t.toLowerCase().includes(tag.toLowerCase()))
  );

  console.log(`\n🏷️  Documents with tag: ${tag}\n`);
  console.log("─".repeat(80));

  if (filtered.length === 0) {
    console.log("No documents found with this tag.\n");
    return;
  }

  filtered.forEach((doc, index) => {
    console.log(`\n${index + 1}. ${doc.pageContent.substring(0, 70)}...`);
    console.log(`   📁 Category: ${doc.metadata.category}`);
    console.log(`   🏷️  Tags: ${doc.metadata.tags.join(", ")}`);
  });

  console.log("\n─".repeat(80));
  console.log(`Found ${filtered.length} documents\n`);
}

function sortDocuments(field: "date" | "category" | "author") {
  const sorted = [...documents].sort((a, b) => {
    const aValue = a.metadata[field];
    const bValue = b.metadata[field];
    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
  });

  console.log(`\n📊 Documents sorted by: ${field}\n`);
  console.log("─".repeat(80));

  sorted.forEach((doc, index) => {
    console.log(`\n${index + 1}. ${doc.pageContent.substring(0, 60)}...`);
    console.log(
      `   ${field === "date" ? "📅" : field === "category" ? "📁" : "✍️"}  ${field}: ${doc.metadata[field]}`
    );
  });

  console.log("\n─".repeat(80) + "\n");
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function interactiveMenu() {
  while (true) {
    console.log("\n📂 Document Organization System");
    console.log("─".repeat(40));
    console.log("1. List all documents");
    console.log("2. Filter by category");
    console.log("3. Filter by date range");
    console.log("4. Search by tag");
    console.log("5. Sort by field");
    console.log("6. Exit");
    console.log("─".repeat(40));

    const choice = await question("\nSelect option (1-6): ");

    switch (choice) {
      case "1":
        listAllDocuments();
        break;

      case "2":
        console.log("\nAvailable categories: AI, Programming, Database, DevOps");
        const category = await question("Enter category: ");
        filterByCategory(category);
        break;

      case "3":
        const startDate = await question("Enter start date (YYYY-MM-DD): ");
        const endDate = await question("Enter end date (YYYY-MM-DD): ");
        filterByDateRange(startDate, endDate);
        break;

      case "4":
        const tag = await question("Enter tag to search: ");
        searchByTag(tag);
        break;

      case "5":
        console.log("\nSort by: date, category, or author");
        const field = (await question("Enter field: ")) as "date" | "category" | "author";
        if (["date", "category", "author"].includes(field)) {
          sortDocuments(field);
        } else {
          console.log("❌ Invalid field");
        }
        break;

      case "6":
        console.log("\n👋 Goodbye!");
        rl.close();
        return;

      default:
        console.log("❌ Invalid choice");
    }
  }
}

async function main() {
  console.log("🗂️  Document Organization System\n");
  console.log("=".repeat(80) + "\n");

  // Check if running in CI mode
  if (process.env.CI === "true") {
    console.log("Running in CI mode - demonstrating features\n");

    listAllDocuments();
    filterByCategory("AI");
    filterByDateRange("2024-02-01", "2024-02-28");
    searchByTag("api");
    sortDocuments("date");

    console.log("✅ Document organization system working correctly!");
    rl.close();
    return;
  }

  // Interactive mode
  await interactiveMenu();
}

main().catch(console.error);
