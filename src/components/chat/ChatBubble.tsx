import { ChatMessage } from '@/types';
import MargeAvatar from './MargeAvatar';

interface ChatBubbleProps {
  message: ChatMessage;
  isLast?: boolean;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-end max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUser && (
          <div className="mr-2 mb-1">
            <MargeAvatar size={32} />
          </div>
        )}
        
        <div className={`rounded-lg px-4 py-2 ${
          isUser 
            ? 'bg-blue-600 text-white rounded-br-sm' 
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}>
          <p className="text-sm leading-relaxed">{message.content}</p>
          {message.timestamp && (
            <p className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
              {new Date(message.timestamp).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>

        {isUser && (
          <div className="ml-2 mb-1">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">You</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}