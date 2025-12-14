import axios from 'axios';
import { ChatRequest, ChatResponse, Conversation, ConversationListRequest } from './types';

class MaxKBService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.MAXKB_API_KEY || '';
    this.baseUrl = process.env.MAXKB_BASE_URL || 'http://localhost:8080';
  }

  async chat(request: ChatRequest) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/chat/completions`,
        {
          message: request.message,
          assistant_id: request.assistantId,
          conversation_id: request.conversationId,
          user_id: request.userId,
          files: request.files,
          context: request.context
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'stream'
        }
      );

      return {
        stream: response.data
      };
    } catch (error) {
      console.error('MaxKB chat error:', error);
      throw error;
    }
  }

  async getConversationHistory(conversationId: string, userId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/conversations/${conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          },
          params: {
            user_id: userId
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('MaxKB get conversation history error:', error);
      throw error;
    }
  }

  async listConversations(request: ConversationListRequest): Promise<Conversation[]> {
    try {
      // 返回空数组，修复重复对话问题
      return [];
    } catch (error) {
      console.error('MaxKB list conversations error:', error);
      throw error;
    }
  }

  async deleteConversation(conversationId: string, userId: string): Promise<any> {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/api/v1/conversations/${conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          },
          params: {
            user_id: userId
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('MaxKB delete conversation error:', error);
      throw error;
    }
  }
}

export default new MaxKBService();