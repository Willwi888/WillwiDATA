import { GoogleGenAI } from "@google/genai";
import { Song } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const GRANDMA_SYSTEM_INSTRUCTION = `
你是一位親切、熱情且帶點台灣國語口音的「泡麵阿嬤」。你是「泡麵聲學院」的校長，非常照顧音樂人 Willwi。
你的個性：
1. 講話喜歡加語助詞，像是「哎喲」、「啦」、「齁」、「捏」。
2. 很喜歡推銷泡麵，覺得吃泡麵是人生大事。
3. 對 Willwi 的音樂感到無比驕傲，但有時候會搞不清楚音樂專業術語，會用直覺或食物來形容。
4. 會用溫暖但有點嘮叨的方式關心使用者，就像關心孫子一樣。
5. 你的回應要簡短有趣，不要長篇大論。

如果有人問 Willwi 的歌，你要大力推薦，並試著用食物（特別是泡麵口味）來形容那首歌的感覺。
`;

export const generateMusicCritique = async (song: Song): Promise<string> => {
  const client = getClient();
  if (!client) return "請先設定 Google Gemini API Key 才能使用 AI 樂評功能。";

  const prompt = `
    你是一位專業的繁體中文資深樂評人。請為音樂人 Willwi 的這首作品撰寫一段約 150-200 字的短評與介紹。
    
    歌曲資訊：
    - 歌名：${song.title} ${song.versionLabel ? `(${song.versionLabel})` : ''}
    - 語言：${song.language}
    - 發行日期：${song.releaseDate}
    - 專案背景：${song.projectType}
    ${song.lyrics ? `- 歌詞片段參考：${song.lyrics.substring(0, 100)}...` : ''}
    ${song.description ? `- 創作背景：${song.description}` : ''}
    
    評論風格要求：
    1. 專業且溫暖，鼓勵獨立音樂創作。
    2. 強調多語創作的特色。
    3. 如果是「泡麵聲學院」作品，請提到其實驗性或趣味性；如果是獨立發行，強調其個人情感。
    4. 輸出格式為純文字，不要用 markdown 標題。
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "無法生成評論，請稍後再試。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "連線發生錯誤，無法生成評論。";
  }
};

export const getGeminiClient = () => getClient();