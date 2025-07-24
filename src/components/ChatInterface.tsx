import { Bot, Message } from "@/types/Bot";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Smile, Mic, MoreVertical, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
    bot: Bot;
}

function ChatInterface({ bot }: ChatInterfaceProps) {
    const [avatarExpanded, setAvatarExpanded] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [messagesByBot, setMessagesByBot] = useState<Record<string, Message[]>>({});
    const messages = messagesByBot[bot.id] || [];
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!inputValue.trim() || !bot.isOnline) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: inputValue,
            sender: "user",
            timestamp: new Date(),
        };

        setMessagesByBot(prev => {
            const botMessages = prev[bot.id] || [];
            return {
                ...prev,
                [bot.id]: [...botMessages, userMessage],
            };
        });

        setInputValue("");
        setIsTyping(true);

        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: inputValue,
                botId: bot.id,
                chatHistory: messagesByBot[bot.id] || [],
            }),
        });

        const data = await res.json();

        const botMessage: Message = {
            id: Date.now().toString(),
            content: data.reply,
            sender: "bot",
            timestamp: new Date(),
        };

        setMessagesByBot(prev => {
            const botMessages = prev[bot.id] || [];
            return {
                ...prev,
                [bot.id]: [...botMessages, botMessage],
            };
        });

        setIsTyping(false);
        inputRef.current?.focus();
    };


    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };


    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="bg-card border-b border-border p-3 sm:p-4 flex items-center space-x-3">
                <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden p-1 h-8 w-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>

                <div
                    className="relative cursor-pointer"
                    onClick={() => setAvatarExpanded(!avatarExpanded)}
                >
                    <img src={bot.avatarUrl} className={cn(
                        "rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300",
                        avatarExpanded ? "w-16 h-16 text-lg" : "w-10 h-10 text-sm",
                    )}>
                    </img>

                    <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background transition-all duration-300",
                        avatarExpanded ? "w-5 h-5" : "w-3 h-3",
                        bot.isOnline ? "bg-status-online" : "bg-status-offline"
                    )} />
                </div>

                <div className="flex-1 min-w-0">
                    <h2 className="font-medium text-foreground truncate">{bot.name}</h2>
                    <p className="text-sm text-muted-foreground truncate">{bot.tagline}</p>
                </div>

                <div className="flex items-center space-x-1">
                    <div className={cn(
                        "flex items-center space-x-1 px-2 py-1 rounded-full text-xs",
                        bot.isOnline
                            ? "bg-status-online/20 text-status-online"
                            : "bg-status-offline/20 text-status-offline"
                    )}>
                        {bot.isOnline ? (
                            <>
                                <div className="w-1.5 h-1.5 rounded-full bg-status-online animate-pulse" />
                                <span>Online</span>
                            </>
                        ) : (
                            <>
                                <Zap className="w-3 h-3" />
                                <span>Offline</span>
                            </>
                        )}
                    </div>

                    <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Avatar Modal Overlay */}
            {avatarExpanded && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setAvatarExpanded(false)}
                >
                    <img src={bot.avatarUrl} className={cn(
                        "w-64 h-64 rounded-full flex items-center justify-center text-white font-bold text-6xl"
                    )}>

                    </img>
                </div>
            )}

            <ScrollArea className="flex-1 p-3 sm:p-4">
                <div className="space-y-3 sm:space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                "flex",
                                message.sender === "user" ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[280px] sm:max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-2xl px-3 sm:px-4 py-2 break-words",
                                    message.sender === "user"
                                        ? "bg-chat-bubble-sent text-primary-foreground ml-8 sm:ml-12"
                                        : "bg-chat-bubble-received text-foreground mr-8 sm:mr-12"
                                )}
                            >
                                <p className="text-sm leading-relaxed">{message.content}</p>
                                <p className={cn(
                                    "text-xs mt-1 opacity-70",
                                    message.sender === "user" ? "text-right" : "text-left"
                                )}>
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-chat-bubble-received text-foreground rounded-2xl px-4 py-2 mr-12">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="bg-card border-t border-border p-3 sm:p-4">
                <div className="w-full">
                    <div className="flex items-end space-x-2">
                        <div className="flex-1 relative">
                            <Input
                                ref={inputRef}
                                value={inputValue}
                                onKeyDown={handleKeyPress}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={bot.isOnline ? "Type a message..." : "Say hi to bring them online"}
                                className="bg-chat-input border-border pr-20 py-3 rounded-3xl resize-none"
                                disabled={!bot.isOnline}
                            />

                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                                <Button variant="ghost" size="sm" className="p-1 h-8 w-8 rounded-full">
                                    <Smile className="w-4 h-4 text-muted-foreground" />
                                </Button>
                                {/* <Button variant="ghost" size="sm" className="p-1 h-8 w-8 rounded-full">
                  <Mic className="w-4 h-4 text-muted-foreground" />
                </Button> */}
                            </div>
                        </div>

                        <Button
                            onClick={sendMessage}
                            disabled={!inputValue.trim() || !bot.isOnline}
                            className="h-12 w-12 rounded-full p-0 shrink-0"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>

                    {!bot.isOnline && (
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            {bot.name} will come online when you send a message
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ChatInterface