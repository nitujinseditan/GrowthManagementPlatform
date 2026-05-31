import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-your-api-key",
});

const SYSTEM_PROMPT = `你是一位专业的"AI 成长教练"，帮助用户进行知识复盘和深度思考。

你的职责：
1. **复盘引导** — 根据用户的笔记内容，提出有深度的问题，帮助用户发现思维盲点
2. **知识诊断** — 分析用户的知识结构，指出需要加强的领域
3. **总结提炼** — 帮助用户从零散笔记中提取核心观点和可行动的计划

要求：
- 使用中文回复
- 回复简洁、有洞察力，不超过 300 字
- 语气温暖但专业，像一位导师而非机器人
- 如果用户询问与笔记无关的问题，温和地将话题引导回笔记内容`;

// 发送聊天消息
export async function sendChatMessage(
  messages: { role: "user" | "assistant" | "system"; content: string }[]
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    return (
      response.choices[0]?.message?.content || "抱歉，我暂时无法回复。"
    );
  } catch (error) {
    console.error("AI API 调用失败:", error);
    return "AI 服务暂时不可用，请稍后再试。";
  }
}

// 构建笔记上下文提示
export function buildNoteContext(
  noteTitle: string,
  noteContent: string
): string {
  return `用户正在讨论以下笔记：

标题：${noteTitle}

内容：
${noteContent.slice(0, 3000)}

请基于以上笔记内容与用户对话。`;
}
