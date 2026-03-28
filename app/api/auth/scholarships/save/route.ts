import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, provider, amount, deadline, link } = await request.json();

  const { data, error } = await supabase
    .from("scholarships")
    .insert([
      {
        user_id: user.id,
        title,
        provider,
        amount_estimated: amount,
        deadline,
        link,
      },
    ])
    .select();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: "Saved successfully", data });
}
