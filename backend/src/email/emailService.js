import { Resend } from "resend";
import crypto from "crypto";
import { pool } from "../../models/db.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export const gerarEEnviarToken = async (email) => {
  const token = crypto.randomBytes(32).toString("hex");
  const expira = new Date(Date.now() + 1000 * 60 * 60);

  const result = await pool.query(
    `
    UPDATE jm.clientes
    SET token_verificacao = $1,
        token_expira_em = $2
    WHERE email = $3
    `,
    [token, expira, email]
  );

  if (result.rowCount === 0) {
    throw new Error("Email não encontrado");
  }

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Confirmação de email",
    html: `<h2>Seu código: ${token}</h2>`
  });

  return true;
};