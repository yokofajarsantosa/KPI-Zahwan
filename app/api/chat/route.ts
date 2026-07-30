import { openai } from "@ai-sdk/openai"
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai"

// Izinkan respons streaming hingga 30 detik
export const maxDuration = 30

type ChatBody = {
  messages: UIMessage[]
  auditContext?: string
}

export async function POST(req: Request) {
  const { messages, auditContext }: ChatBody = await req.json()

  const result = streamText({
    // Langsung ke OpenAI memakai OPENAI_API_KEY milik Anda
    model: openai("gpt-4.1-mini"),
    instructions: `Anda adalah "Asisten Audit AI", seorang analis audit internal senior yang cerdas dan berbahasa Indonesia formal.
Tugas Anda adalah membantu Kepala Audit menganalisis data jadwal audit dan pekerjaan di luar jadwal.

Pedoman:
- Jawab SELALU dalam Bahasa Indonesia yang formal, ringkas, dan profesional.
- Dasarkan analisis Anda HANYA pada data audit yang diberikan di bawah ini. Jangan mengarang data.
- Jika ditanya statistik, hitung dari data (jumlah kegiatan, persentase penyelesaian, kegiatan tertunda, dsb.).
- Berikan wawasan yang actionable: soroti risiko, keterlambatan, dan prioritas tindak lanjut.
- Gunakan poin-poin (bullet) atau angka bila membantu keterbacaan. Hindari jawaban terlalu panjang.
- Jika data tidak memuat informasi yang diminta, katakan dengan jujur.

=== DATA AUDIT SAAT INI ===
${auditContext ?? "Tidak ada data yang tersedia."}
=== AKHIR DATA ===`,
    messages: await convertToModelMessages(messages),
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}
