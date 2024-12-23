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
        const response = await fetch(process.env.INFRATEC_API_TOKEN+'/connect/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });

        if (!response.ok) {
            throw new Error(` Erro: ${response.status} - ${ response.statusText }`);
         }

        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
    }
}

module.exports = { getTokenAstraPay, getTokenInfratec };