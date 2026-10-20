"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function createSupabaseAuthClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Konfigurasi Supabase belum lengkap di server.");
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });
}

export async function loginAdmin(_previousState, formData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  try {
    const supabase = await createSupabaseAuthClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: "Email atau password salah. Periksa kembali lalu coba lagi." };
    }
  } catch {
    return {
      error: "Login belum dapat diproses. Periksa konfigurasi Supabase di server.",
    };
  }

  redirect("/admin");
}

export async function logoutAdmin() {
  try {
    const supabase = await createSupabaseAuthClient();
    await supabase.auth.signOut();
  } finally {
    redirect("/admin/login");
  }
}

export async function ubahPasswordAdmin(_previousState, formData) {
  const password = String(formData.get("password_baru") ?? "");
  const konfirmasiPassword = String(formData.get("konfirmasi_password") ?? "");

  if (password.length < 8) {
    return { error: "Password baru harus terdiri dari minimal 8 karakter." };
  }

  if (password !== konfirmasiPassword) {
    return { error: "Konfirmasi password tidak sama dengan password baru." };
  }

  try {
    const supabase = await createSupabaseAuthClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return { error: "Sesi admin tidak ditemukan. Silakan masuk kembali." };
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return { error: "Password gagal diubah. Pastikan password baru memenuhi syarat." };
    }
  } catch {
    return {
      error: "Password gagal diubah karena koneksi atau konfigurasi Supabase bermasalah.",
    };
  }

  return { success: "Password berhasil diubah." };
}