import express from "express";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const router = express.Router();

// 🔹 Simple in-memory chat history
const memory = [];

router.post("/chat", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ success: false, error: "Missing question" });
    }

    // ✅ Initialize Ollama model
    const ollamaModel = new ChatOllama({
      model: "llama3.1",
      baseUrl: "http://localhost:11434",
      stream: false,
    });

    // ✅ Save human message
    memory.push(new HumanMessage(question));

    // ✅ Define prompt template
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a helpful and friendly AI assistant."],
      ["human", "{input}"],
    ]);

    // ✅ Combine prompt and model
    const chain = prompt.pipe(ollamaModel);

    // ✅ Generate AI response
    const response = await chain.invoke({ input: question });

    // ✅ Save AI response
    memory.push(new AIMessage(response.content));

    // ✅ Send back response
    return res.status(200).json({
      success: true,
      answer: response.content,
    });
  } catch (error) {
    console.error("❌ Error in chat route:", error);
    return res.status(500).json({
      success: false,
      error: "Error processing request",
    });
  }
});

export default router;
