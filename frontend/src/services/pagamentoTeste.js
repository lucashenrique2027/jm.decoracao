const API_URL =
  'http://localhost:8080/api/pagamento';

/* =========================================================
   BUSCAR DADOS DO PAGAMENTO
   Usado pela página:
   /pagamento/:pedidoId
========================================================= */

export const buscarPagamento =
  async (pedidoId) => {
    try {
      const response = await fetch(
        `${API_URL}/${pedidoId}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      /* =============================================
         TRATAR ERROS
      ============================================= */
      if (!response.ok) {
        let erroBackend = {};
        try {
          erroBackend =
            await response.json();
        } catch {
          throw new Error(
            'Erro inesperado no servidor'
          );
        }
        throw new Error(
          erroBackend.erro ||
          'Erro ao buscar pagamento'
        );
      }
      /* =============================================
         SUCESSO
      ============================================= */
      return await response.json();
    } catch (error) {
      console.error(error);
      return {
        success: false,
        erro: error.message,
      };
    }
  };

/* =========================================================
   CONFIRMAR PAGAMENTO SIMULADO
========================================================= */

export const efetuarPagamentoTeste =
  async (
    pedidoId,
    tokenPagamento
  ) => {

    try {

      const response = await fetch(

        `${API_URL}/comprar`,

        {
          method: 'POST',

          credentials: 'include',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({

            pedidoId,

            tokenPagamento,
          }),
        }
      );

      /* =============================================
         TRATAR ERROS
      ============================================= */

      if (!response.ok) {

        let erroBackend = {};

        try {

          erroBackend =
            await response.json();

        } catch {

          throw new Error(
            'Erro inesperado no servidor'
          );
        }

        throw new Error(

          erroBackend.erro ||

          'Erro ao efetuar pagamento'
        );
      }

      /* =============================================
         SUCESSO
      ============================================= */

      return await response.json();

    } catch (error) {

      console.error(error);

      return {

        success: false,

        erro: error.message,
      };
    }
  };