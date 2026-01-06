import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => {
    const stored = localStorage.getItem("chat_session_id");
    return stored || `sess_${Date.now()}`;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("chat_session_id", sessionId);
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      content: input.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:8000/api"
        }/chat/message`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            message: userMessage.content,
          }),
        }
      );

      const data = await response.json();

      if (data.success && data.data.bot_message) {
        const botMessage: Message = {
          id: `msg_${Date.now()}_bot`,
          content: data.data.bot_message.content,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50",
          "bg-primary hover:bg-primary/90 transition-transform hover:scale-110",
          isOpen && "hidden"
        )}
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[360px] h-[500px] bg-background border rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Trợ lý AI</h3>
              <p className="text-xs opacity-80">Hỗ trợ tư vấn 24/7</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Xin chào! Tôi có thể giúp gì cho bạn?</p>
                <p className="text-xs mt-1">
                  Hãy hỏi về sản phẩm, giá cả, hoặc khuyến mãi.
                </p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "max-w-[85%] p-3 rounded-lg text-sm",
                  msg.sender === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {msg.sender === "bot" ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert [&>*]:my-1 [&>ul]:my-2 [&>ol]:my-2 [&>p]:mb-2 [&>ol]:pl-4 [&>ul]:pl-4">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang trả lời...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}

export default ChatWidget;
