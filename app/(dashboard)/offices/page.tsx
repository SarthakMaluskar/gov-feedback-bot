import { connectDB } from "@/lib/db";
import Office, { IOffice } from "@/models/Office";
import Image from "next/image";

// Force dynamic rendering so QR codes always reflect the live offices collection
export const dynamic = "force-dynamic";

async function getOffices(): Promise<IOffice[]> {
  await connectDB();
  const offices = await Office.find({}).lean().sort({ office_id: 1 });
  return offices as unknown as IOffice[];
}

export default async function OfficesQRPage() {
  const offices = await getOffices();

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            🏛️ Government Office QR Codes
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            Each QR code opens WhatsApp with the correct office message
            pre-filled. Scan or download and print for the office counter.
          </p>
        </div>

        {offices.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">No offices found.</p>
            <p className="text-sm mt-1">
              Run <code className="bg-gray-100 px-1 rounded">npm run seed</code>{" "}
              to populate sample offices.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {offices.map((office) => {
              const qrSrc = `/api/offices/${office.office_id}/qr?size=300`;
              const downloadUrl = `/api/offices/${office.office_id}/qr?size=600&download=true`;
              const svgDownloadUrl = `/api/offices/${office.office_id}/qr?format=svg&download=true`;

              return (
                <div
                  key={office.office_id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center gap-4"
                >
                  {/* QR Code image */}
                  <div className="border border-gray-200 rounded-xl p-3 bg-white">
                    <Image
                      src={qrSrc}
                      alt={`QR code for ${office.office_name}`}
                      width={200}
                      height={200}
                      unoptimized
                      priority={false}
                    />
                  </div>

                  {/* Office info */}
                  <div className="text-center w-full">
                    <p className="font-semibold text-gray-900 text-base leading-tight">
                      {office.office_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {office.district}, {office.state}
                    </p>
                    <span className="inline-block mt-1 text-xs font-mono bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                      ID: {office.office_id}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 w-full">
                    <a
                      href={downloadUrl}
                      download
                      className="flex-1 text-center text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-lg transition-colors"
                    >
                      ⬇ PNG
                    </a>
                    <a
                      href={svgDownloadUrl}
                      download
                      className="flex-1 text-center text-xs font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 py-2 px-3 rounded-lg transition-colors"
                    >
                      ⬇ SVG
                    </a>
                  </div>

                  {/* WhatsApp preview link */}
                  <a
                    href={`https://wa.me/${
                      (process.env.TWILIO_WHATSAPP_NUMBER ?? "")
                        .replace(/^whatsapp:\+?/i, "")
                    }?text=${office.office_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 hover:underline"
                  >
                    📱 Test WhatsApp link
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
