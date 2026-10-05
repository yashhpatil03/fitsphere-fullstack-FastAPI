import api from "./api";

/**
 * POST /ai/chat  { message, history: [{role, content}] }  ->  { reply, model }
 * The browser only talks to FastAPI; Ollama is never exposed to it.
 * Backend limits: message <= 2000 chars, history <= 10 items.
 */
export const askAI = async (message, history = []) => {
  const { data } = await api.post(
    "/ai/chat",
    { message, history },
    { timeout: 200000 } // local Llama can take a while on first load
  );
  return data.reply;
};

export default askAI;
