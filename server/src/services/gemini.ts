import { GoogleGenAI } from "@google/genai";

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

const model = 'gemini-2.5-flash'

export async function transcribeAudio(audio: string, mimeType: string) {
  const response = await gemini.models.generateContent({
    model,
    contents: [
      {
        text: 'Transcreva o áudio para portugês do Brasil. Seja preciso e natural na transcrição. Mantenha a pontuação adequada. Divida o texto em parágrafos quando for apropriado.'
      },
      {
        inlineData: {
          mimeType,
          data: audio
        }
      }
    ]
  })

  if (!response.text) throw new Error("could not convert audio")

  return response.text
}

export async function generateEmbeddings(text: string) {
  const response = await gemini.models.embedContent({
    model: 'text-embedding-004',
    contents: [{ text }],
    config: {
      taskType: 'RETRIEVAL_DOCUMENT'
    }
  })

  if (!response.embeddings?.[0].values) {
    throw new Error('could not generate embeddings')
  }

  return response.embeddings?.[0].values
}

export async function generateAnswer(question: string, transcriptions: string[]) {
  const context = transcriptions.join('\n\n')

  const prompt = `
    Com base no texto fornecido abaixo como conteto, responda a pergunta de forma clara e precisa em portugês do Brasil.

    Contexto:
    ${context}

    Pergunta:
    ${question}

    Instruções:
    - Utilize apenas informações contidas no contexto enviado;
    - Se a resposta não foi encontrada no contexto responda que não possui informações suficientes para responder;
    - Seja objetivo;
    - Mantenha o tom educativo e profissional;
    - Cite trechos relevantes do contexto se apropriado;
    - Se for citar o contexto, utlilize o termo "conteúdo da aula".
  `.trim()

  const response  = await gemini.models.generateContent({
    model,
    contents: [
      {
        text: prompt
      }
    ]
  })

  if (!response.text) throw new Error('failed to generate response')

  return response.text
}
