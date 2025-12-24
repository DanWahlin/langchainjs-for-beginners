import {
  createAgent,
  createMiddleware,
  summarizationMiddleware,
  HumanMessage,
  tool,
} from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import * as z from "zod";
import "dotenv/config";

/**
 * Example 4: Built-in Middleware - summarizationMiddleware
 *
 * This example demonstrates LangChain's built-in summarizationMiddleware,
 * which automatically summarizes long conversations to:
 * - Stay within model context limits
 * - Reduce token usage and costs
 * - Maintain conversation coherence
 *
 * Configuration options:
 * - trigger: { tokens: N, messages: M } - Summarize when either limit is exceeded
 * - keep: { messages: N } - Number of recent messages to preserve after summarization
 * - Can also use { fraction: 0.8 } for proportional triggers
 *
 * We use a quantum mechanics research assistant that provides detailed
 * explanations - perfect for showing how summarization condenses verbose
 * content while preserving key context.
 *
 * Run: npx tsx 05-agents/code/04-builtin-middleware.ts
 *
 * 🤖 Try asking GitHub Copilot Chat (https://github.com/features/copilot):
 * - "How does summarizationMiddleware decide when to summarize?"
 * - "What's the difference between trigger and keep options?"
 */

// Quantum mechanics knowledge base with detailed explanations
const quantumKnowledge: Record<string, string> = {
  superposition: `Superposition is one of the most fundamental principles in quantum mechanics. It states that a quantum system can exist in multiple states simultaneously until it is measured or observed.

The classic example is Schrödinger's cat thought experiment: a cat in a sealed box with a radioactive atom is considered both alive AND dead until the box is opened. In mathematical terms, the quantum state is described as a linear combination of basis states, written as |ψ⟩ = α|0⟩ + β|1⟩, where α and β are complex probability amplitudes.

This principle has profound implications for quantum computing, where qubits can represent both 0 and 1 simultaneously, enabling parallel computation that classical computers cannot achieve.`,

  entanglement: `Quantum entanglement is a phenomenon where two or more particles become correlated in such a way that the quantum state of each particle cannot be described independently. When particles are entangled, measuring one particle instantly affects the other, regardless of the distance between them.

Einstein famously called this "spooky action at a distance" because it seemed to violate the principle that nothing can travel faster than light. However, entanglement doesn't actually transmit information faster than light - it's a correlation, not communication.

Entanglement is crucial for quantum cryptography (ensuring secure communication), quantum teleportation (transferring quantum states), and quantum computing (enabling certain algorithms to work). Bell's theorem and subsequent experiments have confirmed that entanglement is a real phenomenon that cannot be explained by classical physics.`,

  wave_particle: `Wave-particle duality is the concept that all matter and energy exhibits both wave-like and particle-like properties. This was one of the first major discoveries that distinguished quantum mechanics from classical physics.

Light, for example, behaves as a wave in phenomena like interference and diffraction, but behaves as particles (photons) in the photoelectric effect. Similarly, electrons - traditionally thought of as particles - can create interference patterns when passed through a double slit, demonstrating wave behavior.

The de Broglie hypothesis extended this to all matter, proposing that any particle has an associated wavelength given by λ = h/p, where h is Planck's constant and p is momentum. This wave-particle duality is not a contradiction but rather reflects the limitations of classical concepts when applied to quantum systems.`,

  uncertainty: `Heisenberg's Uncertainty Principle is a fundamental limit on the precision with which certain pairs of physical properties can be simultaneously known. The most famous formulation involves position and momentum: the more precisely you know a particle's position, the less precisely you can know its momentum, and vice versa.

Mathematically, this is expressed as ΔxΔp ≥ ℏ/2, where Δx is the uncertainty in position, Δp is the uncertainty in momentum, and ℏ is the reduced Planck constant. This isn't a limitation of our measuring instruments - it's a fundamental property of nature.

The uncertainty principle has profound philosophical implications, suggesting that at the quantum level, the universe is inherently probabilistic rather than deterministic. It also explains why electrons don't spiral into atomic nuclei and is essential for understanding quantum tunneling.`,

  tunneling: `Quantum tunneling is the phenomenon where a particle can pass through a potential energy barrier that it classically shouldn't be able to overcome. In classical physics, if a ball doesn't have enough energy to roll over a hill, it simply bounces back. In quantum mechanics, there's a probability the particle will "tunnel" through.

This happens because quantum particles are described by wave functions that don't abruptly stop at barriers but decay exponentially through them. If the barrier is thin enough, there's a non-zero probability of finding the particle on the other side.

Quantum tunneling has numerous real-world applications: it's essential for nuclear fusion in stars, it enables scanning tunneling microscopes to image individual atoms, and it's the basis for tunnel diodes in electronics. It's also a challenge in semiconductor design, as electrons can tunnel through thin insulating layers.`,

  measurement: `The measurement problem is one of the deepest unsolved questions in quantum mechanics. It concerns what happens when a quantum system transitions from existing in superposition to having a definite measured value - a process called "wave function collapse."

Before measurement, a quantum system is described by a wave function representing all possible states. Upon measurement, we always find the system in one definite state. But quantum mechanics doesn't explain HOW or WHY this collapse occurs - it only gives us probabilities for different outcomes.

Various interpretations attempt to address this: the Copenhagen interpretation says collapse is fundamental and caused by observation; Many-Worlds interpretation says all outcomes occur in branching universes; pilot wave theory adds hidden variables. Each interpretation has supporters and critics, and experiments haven't definitively favored one over others.`,

  applications: `Quantum mechanics has revolutionized technology in countless ways. Semiconductors and transistors - the foundation of all modern electronics - rely on quantum band theory. Lasers work through stimulated emission, a quantum process. MRI machines use quantum spin properties of atomic nuclei.

Looking forward, quantum technologies promise even greater transformations. Quantum computers could solve problems intractable for classical computers, like simulating molecular interactions for drug discovery or breaking current encryption. Quantum sensors could detect gravitational waves or map brain activity with unprecedented precision.

Quantum cryptography offers theoretically unbreakable encryption based on the laws of physics rather than mathematical complexity. And quantum networks could one day connect quantum computers and sensors into a quantum internet, enabling new forms of secure communication and distributed computing.`,
};

// Research assistant tool that provides detailed quantum mechanics explanations
const quantumResearchTool = tool(
  async (input) => {
    const topic = input.topic.toLowerCase();

    // Find matching topic
    const matchedKey = Object.keys(quantumKnowledge).find(
      (key) => topic.includes(key) || key.includes(topic.split(" ")[0])
    );

    if (matchedKey) {
      return quantumKnowledge[matchedKey];
    }

    // Default response for unmatched topics
    return `Quantum mechanics is the branch of physics that describes the behavior of matter and energy at the atomic and subatomic scales. Key concepts include superposition, entanglement, wave-particle duality, and the uncertainty principle. Each of these fundamentally challenges our classical intuitions about how the universe works, revealing a probabilistic rather than deterministic reality at the smallest scales.`;
  },
  {
    name: "quantumResearch",
    description:
      "Get detailed explanations about quantum mechanics concepts including superposition, entanglement, wave-particle duality, uncertainty principle, quantum tunneling, measurement problem, and applications.",
    schema: z.object({
      topic: z
        .string()
        .describe("The quantum mechanics topic to research (e.g., 'superposition', 'entanglement')"),
    }),
  }
);

async function main() {
  console.log("📚 Built-in Middleware: summarizationMiddleware Demo\n");
  console.log("=".repeat(80));
  console.log("This example shows how summarizationMiddleware manages long,");
  console.log("text-heavy conversations by condensing older messages.\n");
  console.log("Scenario: A quantum mechanics research assistant providing");
  console.log("detailed explanations that would quickly fill context windows.\n");

  const model = new ChatOpenAI({
    model: process.env.AI_MODEL,
    configuration: { baseURL: process.env.AI_ENDPOINT },
    apiKey: process.env.AI_API_KEY,
  });

  // Track conversation state across turns
  let currentMessageCount = 0;
  let currentTokenEstimate = 0;
  let currentSummaryContent: string | null = null;
  let previousSummaryContent: string | null = null;

  // Custom logging middleware to track conversation state
  const conversationLogger = createMiddleware({
    name: "ConversationLogger",
    wrapModelCall: (request, handler) => {
      const messageCount = request.messages.length;

      // Rough token estimate (4 chars per token average)
      const estimatedTokens = request.messages.reduce((sum, msg) => {
        const content = typeof msg.content === "string" ? msg.content : "";
        return sum + Math.ceil(content.length / 4);
      }, 0);

      // Check the first message for summary content
      // When summarization occurs, the first message contains the condensed history
      const firstMsg = request.messages[0];
      if (firstMsg && typeof firstMsg.content === "string") {
        const content = firstMsg.content;
        // Detect if this looks like a summary (contains summary-like phrases or is a list of topics)
        const looksLikeSummary =
          content.includes("summary") ||
          content.includes("conversation to date") ||
          content.includes("discussed") ||
          content.includes("covered") ||
          (content.includes("?") && content.split("?").length > 2); // Multiple questions listed

        if (looksLikeSummary && content !== previousSummaryContent) {
          currentSummaryContent = content;
        } else if (!looksLikeSummary) {
          currentSummaryContent = null;
        } else {
          // Same summary as before, don't show again
          currentSummaryContent = null;
        }
      }

      currentMessageCount = messageCount;
      currentTokenEstimate = estimatedTokens;

      return handler(request);
    },
  });

  // Helper to log question start
  const logQuestionStart = (questionNum: number, totalQuestions: number) => {
    console.log(`\n📝 Question ${questionNum}/${totalQuestions}`);
  };

  // Helper to display the summary box
  const displaySummaryBox = (summary: string) => {
    console.log(`  [State] 🔄 Summarization occurred! Here's the condensed context:`);
    console.log(`  ┌${"─".repeat(70)}┐`);
    // Show first 500 chars of summary, formatted nicely
    const truncatedSummary =
      summary.length > 500 ? summary.substring(0, 500) + "..." : summary;
    // Indent and wrap the summary
    const lines = truncatedSummary.split("\n").slice(0, 8); // Max 8 lines
    lines.forEach((line) => {
      const trimmedLine = line.substring(0, 68);
      console.log(`  │ ${trimmedLine.padEnd(68)} │`);
    });
    if (truncatedSummary.split("\n").length > 8) {
      console.log(`  │ ${"... [truncated]".padEnd(68)} │`);
    }
    console.log(`  └${"─".repeat(70)}┘`);
  };

  // Helper to log state after agent completes
  const logConversationState = () => {
    console.log(`  [State] 📊 Messages: ${currentMessageCount} | Tokens: ~${currentTokenEstimate}`);

    if (currentSummaryContent) {
      displaySummaryBox(currentSummaryContent);
      // Track this summary so we don't show it again if unchanged
      previousSummaryContent = currentSummaryContent;
    }
  };

  // Create agent with built-in summarization and custom logging
  const agent = createAgent({
    model,
    tools: [quantumResearchTool],
    middleware: [
      summarizationMiddleware({
        model,
        trigger: [{ tokens: 1000 }, { messages: 8 }], // OR logic: summarize when either limit exceeded
        keep: { messages: 6 }, // Keep enough messages to preserve tool call chains
      }),
      conversationLogger,
    ],
  });

  // Multi-turn research conversation about quantum mechanics
  const researchQuestions = [
    "What is quantum superposition?",
    "How does quantum entanglement work?",
    "Explain wave-particle duality",
    "What is Heisenberg's uncertainty principle?",
    "Tell me about quantum tunneling",
    "What is the measurement problem in quantum mechanics?",
    "What are the practical applications of quantum mechanics?",
  ];

  console.log("🔬 Starting quantum mechanics research session...\n");
  console.log("─".repeat(80));

  const messages: HumanMessage[] = [];

  for (let i = 0; i < researchQuestions.length; i++) {
    const question = researchQuestions[i];

    // Reset turn tracking and show question
    logQuestionStart(i + 1, researchQuestions.length);
    console.log(`👤 Researcher: ${question}\n`);

    messages.push(new HumanMessage(question));

    const response = await agent.invoke({
      messages: [...messages],
    });

    // Show conversation state after agent completes
    logConversationState();

    const lastMessage = response.messages[response.messages.length - 1];

    // Truncate display for readability (full response still in conversation)
    const content = String(lastMessage.content);
    const displayContent =
      content.length > 300
        ? content.substring(0, 300) + "... [truncated for display]"
        : content;

    console.log(`\n🤖 Assistant: ${displayContent}`);
    console.log("\n" + "─".repeat(80));

    // Small delay between questions
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("\n" + "=".repeat(80));
  console.log("\n💡 Key Observations:\n");
  console.log("   📚 Each response contains detailed explanations (~200-400 words)");
  console.log("   📈 Without summarization, context would grow to thousands of tokens");
  console.log("   🔄 summarizationMiddleware condenses older exchanges");
  console.log("   ✅ Key context preserved: topics discussed, key concepts learned");
  console.log("   💰 Reduces token usage while maintaining conversation coherence\n");

  console.log("✅ When to use summarizationMiddleware:");
  console.log("   • Research assistants with detailed explanations");
  console.log("   • Customer support with extended troubleshooting");
  console.log("   • Educational tutors with verbose content");
  console.log("   • Any agent where responses are text-heavy");
}

main().catch(console.error);
