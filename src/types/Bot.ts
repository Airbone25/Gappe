type Bot = {
    id: string;
    name: string;
    tagline: string;
    avatarUrl: string;
    isOnline: boolean;
    personalityProfile: string;
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export type { Bot, Message };