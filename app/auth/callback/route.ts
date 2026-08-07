import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;

  if (!tokenHash || !type) {
    return NextResponse.redirect(
      new URL("/login?error=missing_token", request.url)
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error || !data.user) {
    console.error("Auth verification error:", error);

    return NextResponse.redirect(
      new URL("/login?error=auth_failed", request.url)
    );
  }

  const userId = data.user.id;

  const { error: signInError } = await supabase.rpc(
    "mark_first_sign_in"
  );

  if (signInError) {
    console.error("First sign-in tracking error:", signInError);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("Profile lookup error:", profileError);

    return NextResponse.redirect(
      new URL("/login?error=profile_lookup_failed", request.url)
    );
  }

  if (!profile?.onboarding_completed_at) {
    return NextResponse.redirect(
      new URL("/onboarding", request.url)
    );
  }

  return NextResponse.redirect(
    new URL("/dashboard", request.url)
  );
}