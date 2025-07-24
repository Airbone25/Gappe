"use client"
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { set } from "mongoose";

function Page() {
    const [gender, setGender] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [month, setMonth] = useState("");
    const [day, setDay] = useState("");
    const [year, setYear] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
    const [loading, setLoading] = useState(false);
    const router = useRouter()

    const { data: session } = useSession()

    const formatName = (name: string) =>
        name
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");

    const updateDOB = (m: string, d: string, y: string) => {
        if (m && d && y) {
            const dob = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
            setDateOfBirth(dob);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        if (!session) {
            console.error("No session found");
            return;
        }
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: (session?.user as any).email,
                    username: name,
                    gender,
                    dob: dateOfBirth?.toISOString(),
                }),
            });
            const data = await res.json();
            if (data.success) {
                router.push('/chat');
            } else {
                console.error("Error creating user:", data.error);
            }
        } catch (error) {
            console.error("Error submitting onboarding data:", error);
        }finally{
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Tell us about yourself</h2>
                    <p className="text-muted-foreground">Help us personalize your experience</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-foreground">Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(formatName(e.target.value))}
                            maxLength={30}
                            className="bg-secondary border-border"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-foreground">Gender</Label>
                        <RadioGroup
                            value={gender ?? ""}
                            onValueChange={(val) => setGender(val)}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="male" id="male" />
                                <Label htmlFor="male">Male</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="female" id="female" />
                                <Label htmlFor="female">Female</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-foreground">Date of Birth</Label>
                        <div className="grid grid-cols-3 gap-3">
                            <Select value={month} onValueChange={(val) => {
                                setMonth(val);
                                updateDOB(val, day, year);
                            }}>
                                <SelectTrigger className="bg-secondary border-border">
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <SelectItem key={i} value={(i + 1).toString()}>
                                            {new Date(0, i).toLocaleString("default", { month: "long" })}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={day} onValueChange={(val) => {
                                setDay(val);
                                updateDOB(month, val, year);
                            }}>
                                <SelectTrigger className="bg-secondary border-border">
                                    <SelectValue placeholder="Day" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 31 }, (_, i) => (
                                        <SelectItem key={i} value={(i + 1).toString()}>
                                            {i + 1}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={year} onValueChange={(val) => {
                                setYear(val);
                                updateDOB(month, day, val);
                            }}>
                                <SelectTrigger className="bg-secondary border-border">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 100 }, (_, i) => {
                                        const y = new Date().getFullYear() - i;
                                        return <SelectItem key={y} value={y.toString()}>{y}</SelectItem>;
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        className="w-full"
                        disabled={!name || !gender || !dateOfBirth}
                        size="lg"
                    >
                        Continue to Chat
                    </Button>
                </div>
            </div>
        </div>
    )
}
export default Page