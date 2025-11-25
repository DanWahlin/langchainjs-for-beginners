/**
 * Chapter 5 Assignment Solution: Multi-Step Planning Agent
 *
 * Run: npx tsx 05-agents/solution/planning-agent.ts
 */

import { ChatOpenAI } from "@langchain/openai";
import { createAgent, HumanMessage, AIMessage, tool } from "langchain";
import * as z from "zod";
import { evaluate } from "mathjs";
import "dotenv/config";

// Tool 1: Search
const searchTool = tool(
  async (input) => {
    const searchResults: Record<string, string> = {
      "population of tokyo": "Tokyo has a population of approximately 14 million",
      "population of new york": "New York City has a population of approximately 8.3 million",
      "distance london to paris": "The distance is approximately 343 kilometers",
      "capital of france": "Paris",
      "capital of japan": "Tokyo",
    };

    const queryLower = input.query.toLowerCase();
    for (const [key, value] of Object.entries(searchResults)) {
      if (queryLower.includes(key) || key.includes(queryLower)) {
        return value;
      }
    }
    return `No results found for "${input.query}"`;
  },
  {
    name: "search",
    description:
      "Find factual information including populations, distances, capitals, and general knowledge. Use this first when you need facts.",
    schema: z.object({
      query: z.string().describe("Search query"),
    }),
  }
);

// Tool 2: Calculator - uses mathjs for safe expression evaluation
const calculatorTool = tool(
  async (input) => {
    try {
      const result = evaluate(input.expression);
      return String(result);
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : "Calculation failed"}`;
    }
  },
  {
    name: "calculator",
    description:
      "Perform mathematical calculations including arithmetic, percentages, and expressions. Use when you need to compute numbers.",
    schema: z.object({
      expression: z.string().describe("Math expression, e.g., '343 * 0.621371'"),
    }),
  }
);

// Tool 3: Unit Converter
const unitConverter = tool(
  async (input) => {
    const conversions: Record<string, Record<string, { rate: number; unit: string }>> = {
      km: {
        miles: { rate: 0.621371, unit: "miles" },
        meters: { rate: 1000, unit: "meters" },
      },
      miles: {
        km: { rate: 1.60934, unit: "kilometers" },
        meters: { rate: 1609.34, unit: "meters" },
      },
      usd: {
        eur: { rate: 0.92, unit: "EUR" },
        gbp: { rate: 0.79, unit: "GBP" },
      },
      eur: {
        usd: { rate: 1.09, unit: "USD" },
        gbp: { rate: 0.86, unit: "GBP" },
      },
    };

    const fromUnit = input.from.toLowerCase();
    const toUnit = input.to.toLowerCase();

    if (!conversions[fromUnit] || !conversions[fromUnit][toUnit]) {
      return `Error: Cannot convert from ${input.from} to ${input.to}. Available conversions: km↔miles, USD↔EUR`;
    }

    const conversion = conversions[fromUnit][toUnit];
    const result = input.value * conversion.rate;

    return `${input.value} ${input.from} equals ${result.toFixed(2)} ${conversion.unit}`;
  },
  {
    name: "unitConverter",
    description:
      "Convert between units: kilometers to miles (and vice versa), USD to EUR (and vice versa). Use when you need to convert measurements or currencies.",
    schema: z.object({
      value: z.number().describe("The numeric value to convert"),
      from: z.string().describe("Source unit, e.g., 'km', 'miles', 'USD'"),
      to: z.string().describe("Target unit, e.g., 'km', 'miles', 'EUR'"),
    }),
  }
);

// Tool 4: Comparison
const comparisonTool = tool(
  async (input) => {
    const v1 = input.value1;
    const v2 = input.value2;

    switch (input.operation) {
      case "less":
        return v1 < v2 ? `${v1} is less than ${v2}` : `${v1} is not less than ${v2}`;
      case "greater":
        return v1 > v2 ? `${v1} is greater than ${v2}` : `${v1} is not greater than ${v2}`;
      case "equal":
        return v1 === v2 ? `${v1} equals ${v2}` : `${v1} does not equal ${v2}`;
      case "difference":
        return `The difference between ${v1} and ${v2} is ${Math.abs(v1 - v2)}`;
      default:
        return `Unknown operation: ${input.operation}`;
    }
  },
  {
    name: "comparisonTool",
    description:
      "Compare two numeric values to determine if one is less than, greater than, equal to another, or calculate the difference. Use when you need to compare numbers or find differences.",
    schema: z.object({
      value1: z.number().describe("First value to compare"),
      value2: z.number().describe("Second value to compare"),
      operation: z
        .enum(["less", "greater", "equal", "difference"])
        .describe("Comparison operation to perform"),
    }),
  }
);

async function main() {
  console.log("🎯 Multi-Step Planning Agent using createAgent()\n");
  console.log("=".repeat(80) + "\n");

  // Create the model
  const model = new ChatOpenAI({
    model: process.env.AI_MODEL,
    configuration: { baseURL: process.env.AI_ENDPOINT },
    apiKey: process.env.AI_API_KEY,
  });

  // Create agent using createAgent() - handles multi-tool selection automatically
  const agent = createAgent({
    model,
    tools: [searchTool, calculatorTool, unitConverter, comparisonTool],
    systemPrompt:
      "You are a helpful assistant that completes tasks using the available tools. " +
      "Do NOT ask clarifying questions - make reasonable assumptions and proceed with the task. " +
      "For population data, always use city proper figures. Execute the task immediately.",
  });

  // Test queries requiring multiple steps
  const queries = [
    "What's the distance from London to Paris in miles, and is that more or less than 500 miles?",
    "Find the city population of New York and Tokyo, calculate the difference, and tell me the result",
  ];

  for (const query of queries) {
    console.log(`\n🤔 Query: "${query}"\n`);

    // Invoke the agent - it handles multi-step reasoning internally
    const response = await agent.invoke({ messages: [new HumanMessage(query)] });

    // Get the final answer
    const lastMessage = response.messages[response.messages.length - 1];
    console.log(`\n✅ Agent: ${lastMessage.content}\n`);

    // Analyze which tools were used
    const toolCalls = response.messages
      .filter((msg) => msg instanceof AIMessage && msg.tool_calls && msg.tool_calls.length > 0)
      .flatMap((msg) => (msg as AIMessage).tool_calls!.map((tc) => tc.name));

    if (toolCalls.length > 0) {
      console.log("─".repeat(80));
      console.log("📊 Agent Summary:");
      console.log(`   • Tools used: ${[...new Set(toolCalls)].join(", ")}`);
      console.log(`   • Total tool calls: ${toolCalls.length}`);
      console.log(`   • Query solved successfully!`);
    }

    console.log("\n" + "=".repeat(80) + "\n");
  }

  console.log("💡 Key Concepts:");
  console.log("   • createAgent() handles multi-step reasoning automatically");
  console.log("   • Agent chains multiple tools together");
  console.log("   • Each tool call builds on previous results");
  console.log("   • Clear descriptions help agent pick right tool");
  console.log("   • Complex queries are broken down into manageable steps");
}

main().catch(console.error);
