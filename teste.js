const fetch = require('node-fetch');

async function sendPayment() {
  const token = ' Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJVVTk0SG9WcC1fRTM3d2pGVmV1Nm5TOEZHLXc5c0hkRHRzVHB5TkN1QkRBIn0.eyJleHAiOjE3MzA5OTg1MDYsImlhdCI6MTczMDk5NDkwNiwianRpIjoiODAzOTFlMTQtOGM3Mi00ZGY1LWExMGUtYzNlNDI3NWYyZmQ2IiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay1obWwuYXN0cmFwYXkuY29tLmJyL2F1dGgvcmVhbG1zL2V4dGVybmFsLWN1c3RvbWVycyIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI1NjJjZjk3ZC00NDhjLTRhODUtYmJhMi02MjQwN2Q1ZjRhNDYiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiI1MDYyMTMzNTAwMDEwMyIsImFjciI6IjEiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1leHRlcm5hbC1jdXN0b21lcnMiLCJvZmZsaW5lX2FjY2VzcyIsIkNVU1RPTUVSIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiNTA2MjEzMzUwMDAxMDMiOnsicm9sZXMiOlsidW1hX3Byb3RlY3Rpb24iXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgcHJvZmlsZSIsImNsaWVudEhvc3QiOiI1Mi43MS4xMS4xNDYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImN1c3RvbWVySWRDbGllbnQiOiI1NiIsInByZWZlcnJlZF91c2VybmFtZSI6InNlcnZpY2UtYWNjb3VudC01MDYyMTMzNTAwMDEwMyIsImNsaWVudEFkZHJlc3MiOiI1Mi43MS4xMS4xNDYifQ.MDxih0jnM_urrGxOVCY0VCOx4410dbUZ7c_9zsYOIql8mI4KaseCRuTnt58kmnNldtS2GhKC7oyWCU7kT3sqROu2B0KgHdXkrL2FO0m1lgAR_x5CinSGh7q8fpHKmp2UTKIOZKIvS6NlgUhRR17QM4bo5EZMxcX6qlMbMclLQyD9UrqSdvxbFfzOixOOqLGpMM6XA2CQe3oO4rSF2EpiU_BsKRNfKvpKQzN1SGJgFhHBiWwQKRuqfbGrzNEWKOXhNr0uNszzsJ9meU54KR31ysrGIsy-wAgUGwgeCbHgz6-gkp5bi0mpavxjtPTRwyGqPzq43ePtVj5IIC39yP49ww'
  try {
    const response = await fetch('https://api-sandbox.astrapay.com.br/card/v1/credit', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'x-transaction-id': 'ae3709fa-531e-4b47-91d1-5665c99b0f91',
        'Content-Type': 'application/json',
        'Authorization': token 
      },
      body: JSON.stringify({
        nameCreditCard: "TESTE",
        expirationDate: "202512",
        cvv: 123,
        amount: 15000,
        numberInstallments: 1,
        idOrigimTransaction: 32,
        description: "Pagamento de Teste",
        cardNumber: "4111111111111111",
        typePayment: "A_VISTA"
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Erro:', error);
  }
}
sendPayment();
