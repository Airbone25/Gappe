import PERSONAS from "./personas";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/model/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(){
    try{
        await connectDB();
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }
        const user = await User.findOne({ email: session?.user?.email });
        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        const allpersonas = PERSONAS.map(persona => ({
            id: persona.id,
            name: persona.name,
            tagline: persona.tagline,
            avatarUrl: persona.avatarUrl,
            isOnline: persona.isOnline,
            personalityProfile: persona.personalityProfile,
        }))
        let personas = allpersonas;
        if(user.gender === "male"){
            personas = allpersonas.filter(persona => persona.id != 7)
        }else{
            personas = allpersonas.filter(persona => persona.id != 1)
        }

        return NextResponse.json({ success: true, personas });
    }catch(e){
        console.error("Error fetching personas:", e);
        return NextResponse.json({ success: false, error: "Failed to fetch personas" }, { status: 500 });
    }
}