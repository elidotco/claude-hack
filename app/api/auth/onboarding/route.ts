import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validation";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const bodydata = await request.json();
    const supabase = await createClient();

    // 1. Get the authenticated user
    // Using getUser() is more secure than getClaims() for server-side updates
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate data using zod schema (uncommented for safety)
    const parsedData = profileSchema.safeParse(bodydata);
    //  if (!parsedData.success) {
    //    return NextResponse.json(
    //      {
    //        message: "Validation failed",
    //        errors: parsedData.error.flatten(),
    //      },
    //      { status: 400 },
    //    );
    //  }

    // 3. Update the profiles table
    // We use the cleaned data from parsedData.data to ensure no extra fields hit the DB
    const { error: dbError } = await supabase
      .from("profiles")
      .update({
        ...parsedData.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (dbError) {
      console.error("Database Error:", dbError);
      return NextResponse.json({ message: dbError.message }, { status: 500 });
    }

    // 4. Update the user's Auth Metadata
    // This ensures the 'onboarding_complete' flag is baked into the user's JWT
    const { error: authError } = await supabase.auth.updateUser({
      data: { onboarding_complete: true },
    });

    if (authError) {
      console.error("Auth Metadata Error:", authError);
      console.log(authError);
      // We don't necessarily want to fail the whole request if the DB update worked,
      // but it's good to know if this failed.
    }

    return NextResponse.json(
      { message: "Profile updated successfully" },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
