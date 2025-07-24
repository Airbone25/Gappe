"use client"
import React, { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Sidebar from "@/components/SideBar";
import { Bot } from "@/types/Bot";
import ChatInterface from "@/components/ChatInterface";

function Page() {

    const [personas, setPersonas] = React.useState([])
    const [selectedBot, setSelectedBot] = React.useState<Bot | null>(null)

    const { data: session, status } = useSession()
    const router = useRouter()
    const handleSignOut = () => {
        signOut({ callbackUrl: '/' })
    }
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push('/')
        }
        fetchPersonas()
    }, [status, router])

    async function fetchPersonas() {
        try {
            const response = await fetch('/api/personas');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log(data);
            setPersonas(data.personas);
        } catch (error) {
            console.error('Error fetching personas:', error);
        }
    }

    function handleBotSelect(bot: Bot) {
        setSelectedBot(bot);
    }

    return (
        <div className='h-screen bg-background'>
            <div className='hidden lg:flex h-full'>
                <div className='w-1/3 min-w-[320px] max-w-[480px] border-r border-border'>
                    <Sidebar bots={personas} onBotSelect={handleBotSelect} onLogout={handleSignOut}/>
                </div>

                <div className="flex-1">
                    {selectedBot ? (
                        <ChatInterface
                            bot={selectedBot}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center bg-muted/20">
                            <div className="text-center space-y-4">
                                <div className="text-6xl">💬</div>
                                <h2 className="text-2xl font-semibold text-foreground bg-[url('/logo.png')]">Gappe</h2>
                                <p className="text-muted-foreground max-w-md">
                                    Select a friend from the sidebar to start chatting.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

    )
}

export default Page