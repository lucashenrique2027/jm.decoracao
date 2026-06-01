import { Resend } from "resend";
import crypto from "crypto";
import { pool } from "../../models/db.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export const gerarEEnviarToken = async (email) => {
  console.log(`[TOKEN_VERIFICACAO] Iniciando processo para: ${email}`);
  try {
    const token = crypto.randomBytes(32).toString("hex");
    const expira = new Date(Date.now() + 1000 * 60 * 60);

    const result = await pool.query(
      `UPDATE jm.clientes SET token_verificacao = $1, token_expira_em = $2 WHERE email = $3`,
      [token, expira, email]
    );

    if (result.rowCount === 0) throw new Error("Email não encontrado");

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Confirmação de email",
      html: `<h2>Seu código: ${token}</h2>`
    });

    console.log(`[TOKEN_VERIFICACAO] E-mail enviado com sucesso para: ${email}`);
    return true;
  } catch (error) {
    console.error(`[TOKEN_VERIFICACAO] Erro para ${email}:`, error.message);
    throw error;
  }
};

export const gerarEEnviarTokenRecuperacao = async (email) => {
  console.log(`[TOKEN_RECUPERACAO] Iniciando processo para: ${email}`);
  try {
    const token = crypto.randomBytes(32).toString("hex");
    const expira = new Date(Date.now() + 1000 * 60 * 15); 

    const result = await pool.query(
      `UPDATE jm.clientes SET reset_token = $1, reset_token_expira_em = $2 WHERE email = $3`,
      [token, expira, email]
    );

    if (result.rowCount === 0) throw new Error("Email não encontrado");

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Redefinição de senha",
      html: `
        <h2>Recuperação de Senha</h2>
        <p>Você solicitou a redefinição de sua senha. Seu código é:</p>
        <h3>${token}</h3>
        <p>Este código expira em 15 minutos.</p>
      `
    });

    console.log(`[TOKEN_RECUPERACAO] E-mail enviado com sucesso para: ${email}`);
    return true;
  } catch (error) {
    console.error(`[TOKEN_RECUPERACAO] Erro para ${email}:`, error.message);
    throw error;
  }
};