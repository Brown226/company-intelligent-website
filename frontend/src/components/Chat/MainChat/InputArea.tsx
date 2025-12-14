import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import FileAttachment from '../Common/FileAttachment';
import ImagePreview from '../Common/ImagePreview';

interface InputAreaProps {
  onSendMessage: (message: string, files: Array<{ name: string; content: string; type: string }>) => void;
  isTyping: boolean;
}

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-end;
`;

const StyledTextarea = styled.textarea<{ $hasContent: boolean }>`
  flex: 1;
  min-height: 60px;
  max-height: 200px;
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  resize: vertical;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
  
  ${props => props.$hasContent && `
    border-color: #28a745;
  `}
`;

const SendButton = styled.button`
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  align-self: flex-end;
  
  &:hover:not(:disabled) {
    background-color: #0056b3;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
    transform: none;
  }
`;

const FileList = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isTyping }) => {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<Array<{ name: string; content: string; type: string }>>([]);
  const [imagePreviews, setImagePreviews] = useState<Array<{ id: string; url: string; name: string }>>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSend = () => {
    if ((message.trim() || files.length > 0) && !isTyping) {
      onSendMessage(message.trim(), files);
      setMessage('');
      setFiles([]);
      setImagePreviews([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isTyping) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileAttach = (newFiles: Array<{ name: string; content: string; type: string }>) => {
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    
    // 为图片文件生成预览
    newFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        setImagePreviews(prev => [...prev, {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          url: `data:${file.type};base64,${file.content}`,
          name: file.name
        }]);
      }
    });
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
  };

  const handleRemoveImagePreview = (id: string) => {
    setImagePreviews(prev => prev.filter(preview => preview.id !== id));
  };

  return (
    <InputContainer>
      {imagePreviews.length > 0 && (
        <ImagePreview
          previews={imagePreviews}
          onRemove={handleRemoveImagePreview}
        />
      )}
      
      {files.length > 0 && (
        <FileList>
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-2 bg-white px-3 py-2 rounded-full text-sm border border-gray-200">
              <span className="truncate max-w-[200px]">{file.name}</span>
              <button
                onClick={() => handleRemoveFile(index)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </FileList>
      )}
      
      <InputWrapper>
        <StyledTextarea
          ref={textareaRef}
          $hasContent={message.trim().length > 0}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="请输入您的问题..."
          disabled={isTyping}
          rows={1}
        />
        <FileAttachment onAttachFile={handleFileAttach} />
        <SendButton onClick={handleSend} disabled={isTyping || (!message.trim() && files.length === 0)}>
          {isTyping ? '发送中...' : '发送'}
        </SendButton>
      </InputWrapper>
    </InputContainer>
  );
};

export default InputArea;