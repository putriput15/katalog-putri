import KartuProduk from "@/components/KartuProduk";
import { connection } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toko } from "@/lib/toko";

export default async function HalamanKatalog() {
  await connection();

  let daftarProduk = [];
  let pesanError = "";

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    daftarProduk = data ?? [];
  } catch (error) {
    console.error("Gagal mengambil daftar produk:", error);
    pesanError =
      "Produk gagal dimuat. Periksa konfigurasi Supabase dan koneksi database.";
  }

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <h2 id="judul-produk" className="text-xl font-bold">
          Produk kami
        </h2>
        {pesanError ? (
          <p role="alert" className="text-sm text-bahaya">
            {pesanError}
          </p>
        ) : daftarProduk.length === 0 ? (
          <p className="text-sm text-teks-lembut">Belum ada produk</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
