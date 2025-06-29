import nodemailer from "nodemailer";
import path from "path";

export async function sendMail(xlsxPath: string): Promise<void> {
  // Créer le transporteur SMTP
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "scraper.logpro@gmail.com",
      pass: "ryop uslc xnbp apvh",
    },
  });

  const today = new Date();
  const formattedDate = today.toLocaleDateString("fr-FR");

  const htmlContent = `
    <h1>Recherche d'informations sur les entreprises transmises - ${formattedDate}</h1>
    <p>Bonjour,</p><br/>
    <p>Vous trouverez en PJ le fichier Excel avec les informations sur les dirigeants</p><br/>
    <p>Cordialement</p
  `;

  const attachment = {
    path: path.resolve(xlsxPath),
  };

  const mailOptions = {
    from: '"LOGPRO Scraper" <scraper.logpro@gmail.com>',
    to: ["welance.mail@gmail.com", "act2011@hotmail.fr"],
    subject: `Recherche d'informations sur les entreprises transmises - ${formattedDate}`,
    html: htmlContent,
    attachments: [attachment],
  };

  try {
    // Envoyer l'email
    await transporter.sendMail(mailOptions);
    console.log("✅ Email envoyé avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email :", error);
  }
}
