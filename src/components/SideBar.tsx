import React, { useEffect } from 'react'
import { MessageCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Bot } from "@/types/Bot";

interface SideBarProps {
    bots: Bot[];
    onBotSelect: (bot: Bot) => void;
}

function SideBar({ bots,onBotSelect }: SideBarProps) {

    return (
        <div className='h-full bg-background flex flex-col'>

            <div className="shrink-0 bg-background/95 backdrop-blur-sm border-b border-border">
                <div className="px-3 sm:px-4 py-3 sm:py-4">
                    <h1 className="text-lg sm:text-xl font-semibold text-foreground">Gappe</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">Choose a friend to chat with</p>
                </div>
            </div>

            <div className="hidden lg:block">
                {bots.map((bot) => (
                    <div
                        key={bot.id}
                        onClick={() => onBotSelect(bot)}
                        className={cn(
                            "flex items-center p-4 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/50 last:border-b-0"
                        )}
                    >

                        <div className="relative mr-3">
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                            )}>
                                <img src={bot.avatarUrl} alt={bot.name} className="rounded-full w-full h-full object-cover" />
                            </div>

                            <div className={cn(
                                "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                                bot.isOnline ? 
                                "bg-status-online"
                                : "bg-status-offline"
                            )} />
                        </div>

                        {/* Bot Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between">
                                <h3 className="font-medium text-foreground truncate">
                                    {bot.name}
                                </h3>
                                <span className={cn(
                                    "text-xs ml-2",
                                    bot.isOnline ? 
                                    "text-status-online"
                                    : "text-status-offline"
                                )}>
                                    {bot.isOnline ? 
                                    "Online"
                                    : "Offline"}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                                {bot.tagline}
                            </p>
                        </div>


                        <div className="ml-2">
                            {bot.isOnline ? (
                            <MessageCircle className="w-5 h-5 text-primary" />
                             ) : (
                  <Zap className="w-5 h-5 text-muted-foreground" />
                )} 
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SideBar