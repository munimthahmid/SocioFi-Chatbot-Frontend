import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { supabase } from "@/lib/auth"

export async function POST(req: Request) {
  const { messages, userId, role } = await req.json()

  // Get relevant documents based on the last message
  const lastMessage = messages[messages.length - 1]
  const { data: documents } = await supabase
    .from("documents")
    .select("content, embedding")
    .filter("allowed_roles", "cs", `{${role}}`)

  // Create embedding for the query
  const { embedding } = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: lastMessage.content,
  })

  // Find relevant documents using cosine similarity
  const relevantDocs = documents
    ?.map((doc) => ({
      content: doc.content,
      similarity: cosineSimilarity(embedding, doc.embedding),
    }))
    .filter((doc) => doc.similarity > 0.7)
    .map((doc) => doc.content)
    .join("\n")

  const result = streamText({
    model: openai("gpt-4-turbo"),
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant for SocioFi Technology. 
                 Use the following context to answer questions: ${relevantDocs}`,
      },
      ...messages,
    ],
  })

  return result.toDataStreamResponse()
}

function cosineSimilarity(a: number[], b: number[]) {
  const dotProduct = a.reduce((acc, val, i) => acc + val * b[i], 0)
  const magnitudeA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0))
  const magnitudeB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0))
  return dotProduct / (magnitudeA * magnitudeB)
}

