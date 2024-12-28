require('dotenv').config();

async function getTokenAstraPay() {
    try {
        const response = await fetch(process.env.URL_ASTRAPAY + 'oauth/v1/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET
            })
        });
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Erro ao obter token:', error);
    }
}

async function integraUserRastrac(data) {
    try {
          const response = await fetch(process.env.API_RASTRAC+'/user/register-rastrac', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
      
          if (response.ok) {
            const result = await response.json();
            console.log('Usuário registrado com sucesso:', result);
          } else {
            const error = await response.json();
            console.error('Erro ao registrar o usuário:', error.message || error);
          }
        } catch (err) {
          console.error('Erro na requisição:', err);
        }
}

async function integraPedidoRastrac(pedido, item, seller, token) {
    const data = {
        pedido,
        item,
        seller
    }

    try {
        const response = await fetch(`${process.env.API_RASTRAC}/webhook/pedido/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Usuário registrado com sucesso:', result);
        } else {
            const error = await response.json();
            console.error('Erro ao registrar o usuário:', error.message || error);
        }
    } catch (err) {
        console.error('Erro na requisição:', err);
    }
};

async function getTokenInfratec() {
    const params = new URLSearchParams();
    const client_id = process.env.INFRATEC_CLIENT_ID;
    const username = process.env.INFRATEC_USERNAME;
    const client_secret = process.env.INFRATEC_SECRET_ID;
    const scope = process.env.INFRATEC_SCOPE;
    const password = process.env.INFRATEC_PASSWORD;

    params.append('client_id', client_id);
    params.append('client_secret', client_secret);
    params.append('scope', scope);
    params.append('grant_type', 'password');
    params.append('username', username);
    params.append('password', password);

    try {
        console.log(process.env.INFRATEC_API_TOKEN + '/connect/token')
        const response = await fetch(process.env.INFRATEC_API_TOKEN + '/connect/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });

        if (!response.ok) {
            throw new Error(` Erro: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
    }
}

getTokenInfratec();

module.exports = { getTokenAstraPay, getTokenInfratec, integraPedidoRastrac, integraUserRastrac };