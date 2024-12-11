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
    params.append('client_id', '2593cb50-aeb2-4e98-b3d0-5b2cedb0803b');
    params.append('client_secret', '528f5f9f-df66-4bf3-9523-583819154211');
    params.append('scope', 'demonstracao offline_access');
    params.append('grant_type', 'password');
    params.append('username', 'demonstracao');
    params.append('password', 'c909d7ee-33d2-4869-803b-02c55cdffaae');

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