import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AIHubService {
  private readonly AIHubUrl = process.env.AI_HUB_URL;
  private readonly headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer sk-1234',
  };

  async embeddings(content: string): Promise<string> {
    const response = await axios.post<{
      choices: { message: { content: string } }[];
    }>(
      this.AIHubUrl,
      {
        model: 'gemini/gemini-2.0-pro-exp-02-05',
        messages: [
          { role: 'system', content: 'Vectorize this content.' },
          { role: 'user', content: content },
        ],
      },
      { headers: this.headers },
    );
    return response.data.choices[0].message.content; // Giả định trả về vector dạng string
  }

  async generateAnswer(query: string, documents: any[]): Promise<string> {
    const response = await axios.post<{
      choices: { message: { content: string } }[];
    }>(
      this.AIHubUrl,
      {
        model: 'gemini/gemini-2.0-pro-exp-02-05',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: `${query}\nDocuments: ${JSON.stringify(documents)}` },
        ],
      },
      { headers: this.headers },
    );
    return response.data.choices[0].message.content;
  }
}
