import { Request, Response } from 'express';
import maxkbService from '../api_integrations/maxkb';
import difyService from '../api_integrations/dify';
import ragflowService from '../api_integrations/ragflow';
import sqlbotService from '../api_integrations/sqlbot';
import conversationService from '../services/conversationService';

interface ChatRequest {
  message: string;
  assistantId: string;
  conversationId?: string;
  files?: Array<{ name: string; content: string; type: string }>;
  context?: any;
}

class ChatController {
  async handleChatRequest(req: Request, res: Response) {
    try {
      const { message, assistantId, conversationId, files = [], context = {} } = req.body as ChatRequest;
      const userId = (req as any).user?.id || 'anonymous';

      // 根据assistantId选择对应的AI服务
      let response;
      let conversation;
      
      if (conversationId) {
        conversation = await conversationService.getConversation(conversationId);
      }

      // 这里根据不同的assistantId选择不同的服务，实际项目中可能需要从数据库获取assistant配置
      const assistantType = assistantId.split(':')[0];

      switch (assistantType) {
        case 'maxkb':
          // 使用 MaxKB 服务处理请求
          response = await maxkbService.chat({
            message,
            assistantId,
            conversationId,
            userId,
            files,
            context
          });
          break;
        case 'dify':
          // 使用 Dify 服务处理请求
          response = await difyService.chat({
            message,
            assistantId,
            conversationId,
            userId,
            files,
            context
          });
          break;
        case 'ragflow':
          // 使用 RagFlow 服务处理请求
          response = await ragflowService.chat({
            message,
            assistantId,
            conversationId,
            userId,
            files,
            context
          });
          break;
        case 'sqlbot':
          // 使用 SQLBot 服务处理请求
          response = await sqlbotService.chat({
            message,
            assistantId,
            conversationId,
            userId,
            files,
            context
          });
          break;
        default:
          return res.status(400).json({ error: '不支持的助手类型' });
      }

      // 如果是流式响应
      if (response.stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // 处理 MaxKB 的 SSE 流
        if (assistantType === 'maxkb') {
          let buffer = '';
          
          response.stream.on('data', (chunk: Buffer) => {
            try {
              buffer += chunk.toString('utf-8');
              
              // SSE 格式通常以 \n\n 分隔消息
              const messages = buffer.split('\n\n');
              buffer = messages.pop() || '';
              
              for (const message of messages) {
                if (!message.trim()) continue;
                
                // 解析 SSE 消息
                const lines = message.split('\n');
                let data = '';
                
                for (const line of lines) {
                  const trimmedLine = line.trim();
                  if (trimmedLine.startsWith('data:')) {
                    data += trimmedLine.slice(5).trim();
                  }
                }
                
                if (data) {
                  try {
                    const jsonData = JSON.parse(data);
                    if (jsonData.answer) {
                      res.write(`data: ${JSON.stringify({ text: jsonData.answer })}\n\n`);
                    }
                    if (jsonData.done) {
                      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
                      res.end();
                      return;
                    }
                  } catch (parseError) {
                    // 如果不是有效的 JSON，可能是直接的文本流
                    res.write(`data: ${JSON.stringify({ text: data })}\n\n`);
                  }
                }
              }
            } catch (error) {
              console.error('处理 MaxKB 流时出错:', error);
              res.write(`data: ${JSON.stringify({ error: '处理流时出错' })}\n\n`);
              res.end();
            }
          });
        } else {
          // 其他服务的流处理逻辑
          response.stream.on('data', (chunk: Buffer) => {
            res.write(`data: ${chunk.toString('utf-8')}\n\n`);
          });
        }

        response.stream.on('end', () => {
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          res.end();
        });

        response.stream.on('error', (error: Error) => {
          console.error('流式响应错误:', error);
          res.status(500).json({ error: '流式响应错误' });
        });
      } else {
        // 非流式响应
        res.json(response);
      }
    } catch (error) {
      console.error('聊天请求处理错误:', error);
      res.status(500).json({ error: '聊天请求处理错误' });
    }
  }

  async getConversationHistory(req: Request, res: Response) {
    try {
      const { conversationId, assistantId } = req.params;
      const userId = (req as any).user?.id || 'anonymous';

      // 根据assistantId选择对应的AI服务
      const assistantType = assistantId.split(':')[0];
      let history;

      switch (assistantType) {
        case 'maxkb':
          history = await maxkbService.getConversationHistory(conversationId, userId);
          break;
        case 'dify':
          history = await difyService.getConversationHistory(conversationId, userId);
          break;
        case 'ragflow':
          history = await ragflowService.getConversationHistory(conversationId, userId);
          break;
        case 'sqlbot':
          history = await sqlbotService.getConversationHistory(conversationId, userId);
          break;
        default:
          return res.status(400).json({ error: '不支持的助手类型' });
      }

      res.json(history);
    } catch (error) {
      console.error('获取会话历史错误:', error);
      res.status(500).json({ error: '获取会话历史错误' });
    }
  }

  async listConversations(req: Request, res: Response) {
    try {
      const { assistantId } = req.params;
      const userId = (req as any).user?.id || 'anonymous';

      // 根据assistantId选择对应的AI服务
      const assistantType = assistantId.split(':')[0];
      let conversations;

      switch (assistantType) {
        case 'maxkb':
          conversations = await maxkbService.listConversations(userId, assistantId);
          break;
        case 'dify':
          conversations = await difyService.listConversations(userId, assistantId);
          break;
        case 'ragflow':
          conversations = await ragflowService.listConversations(userId, assistantId);
          break;
        case 'sqlbot':
          conversations = await sqlbotService.listConversations(userId, assistantId);
          break;
        default:
          return res.status(400).json({ error: '不支持的助手类型' });
      }

      res.json(conversations);
    } catch (error) {
      console.error('列出会话错误:', error);
      res.status(500).json({ error: '列出会话错误' });
    }
  }

  async deleteConversation(req: Request, res: Response) {
    try {
      const { conversationId, assistantId } = req.params;
      const userId = (req as any).user?.id || 'anonymous';

      // 根据assistantId选择对应的AI服务
      const assistantType = assistantId.split(':')[0];
      let result;

      switch (assistantType) {
        case 'maxkb':
          result = await maxkbService.deleteConversation(conversationId, userId);
          break;
        case 'dify':
          result = await difyService.deleteConversation(conversationId, userId);
          break;
        case 'ragflow':
          result = await ragflowService.deleteConversation(conversationId, userId);
          break;
        case 'sqlbot':
          result = await sqlbotService.deleteConversation(conversationId, userId);
          break;
        default:
          return res.status(400).json({ error: '不支持的助手类型' });
      }

      res.json(result);
    } catch (error) {
      console.error('删除会话错误:', error);
      res.status(500).json({ error: '删除会话错误' });
    }
  }
}

export default new ChatController();