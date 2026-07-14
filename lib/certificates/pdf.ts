import QRCode from "qrcode";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function buildVerificationQrDataUrl(verifyUrl: string): Promise<string> {
  return QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 256,
    color: { dark: "#1a1a1a", light: "#ffffff" },
  });
}

export async function buildVerificationQrPng(verifyUrl: string): Promise<Buffer> {
  return QRCode.toBuffer(verifyUrl, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 256,
    color: { dark: "#1a1a1a", light: "#ffffff" },
  });
}

export async function buildAttestationPdf(input: {
  memberName: string;
  courseTitle: string;
  certificateNumber: string;
  issuedAt: string;
  verifyUrl: string;
  appName?: string;
}): Promise<Uint8Array> {
  const appName = input.appName ?? process.env.NEXT_PUBLIC_APP_NAME ?? "Learnoon Academy";
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const margin = 48;
  let y = 780;

  page.drawText(appName, {
    x: margin,
    y,
    size: 12,
    font: fontBold,
    color: rgb(0.76, 0.25, 0.05),
  });
  y -= 36;

  page.drawText("Attestation interne de parcours", {
    x: margin,
    y,
    size: 22,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 28;

  page.drawText("Confirme l'achevement du parcours sur la plateforme.", {
    x: margin,
    y,
    size: 11,
    font,
    color: rgb(0.35, 0.35, 0.35),
  });
  y -= 18;
  page.drawText("Ceci n'est pas un diplome reconnu par l'Etat.", {
    x: margin,
    y,
    size: 11,
    font,
    color: rgb(0.35, 0.35, 0.35),
  });
  y -= 40;

  const rows: Array<[string, string]> = [
    ["Apprenant", input.memberName || "—"],
    ["Formation", input.courseTitle],
    ["Numero", input.certificateNumber],
    ["Date", new Date(input.issuedAt).toLocaleDateString("fr-FR")],
    ["Statut", "Valide"],
  ];

  for (const [label, value] of rows) {
    page.drawText(label.toUpperCase(), {
      x: margin,
      y,
      size: 9,
      font,
      color: rgb(0.45, 0.45, 0.45),
    });
    y -= 16;
    page.drawText(value.slice(0, 90), {
      x: margin,
      y,
      size: 13,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 28;
  }

  const qrPng = await buildVerificationQrPng(input.verifyUrl);
  const qrImage = await pdf.embedPng(qrPng);
  const qrSize = 120;
  page.drawImage(qrImage, {
    x: margin,
    y: Math.max(80, y - qrSize - 10),
    width: qrSize,
    height: qrSize,
  });

  page.drawText("Scannez pour verifier", {
    x: margin + qrSize + 16,
    y: Math.max(140, y - 24),
    size: 10,
    font,
    color: rgb(0.35, 0.35, 0.35),
  });
  page.drawText(input.verifyUrl.slice(0, 70), {
    x: margin + qrSize + 16,
    y: Math.max(124, y - 40),
    size: 8,
    font,
    color: rgb(0.45, 0.45, 0.45),
  });

  return pdf.save();
}
