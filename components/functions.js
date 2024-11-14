
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


module.exports = {getTokenAstraPay};