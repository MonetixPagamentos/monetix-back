const emailSolictacaoSaque = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background-color: #4caf50;
            color: #ffffff;
            text-align: center;
            padding: 20px;
        }
        .content {
            padding: 20px;
            color: #333333;
        }
        .footer {
            background-color: #f4f4f9;
            text-align: center;
            padding: 15px;
            font-size: 12px;
            color: #888888;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            font-size: 16px;
            color: #ffffff;
            background-color: #4caf50;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Solicitação de Saque Recebida</h1>
        </div>
        <div class="content">
            <p>Olá,</p>
            <p>Recebemos sua solicitação de saque e ela foi encaminhada para análise. Nossa equipe está trabalhando para processar sua solicitação o mais rápido possível.</p>
            <p><strong>Detalhes da Solicitação:</strong></p>
            <ul>
                <li><strong>Valor:</strong> R$ #valor# </li>
                <li><strong>Data da Solicitação:</strong> #data# </li>
                <li><strong>Status:</strong> Em análise</li>
            </ul>
            <p>Você será notificado assim que sua solicitação for concluída.</p>
            <p>Se você tiver dúvidas ou precisar de mais informações, entre em contato com nossa equipe de suporte.</p>
            <a href="mailto:suporte@monetixpagamentos.com" class="button">Entrar em Contato</a>
        </div>
        <div class="footer">
            <p>© 2024 Monetix Pagamentos. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>`;

const emailAprovacaoSaque = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background-color: #5cb85c;
            color: #ffffff;
            text-align: center;
            padding: 20px;
        }
        .content {
            padding: 20px;
            color: #333333;
        }
        .footer {
            background-color: #f4f4f9;
            text-align: center;
            padding: 15px;
            font-size: 12px;
            color: #888888;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            font-size: 16px;
            color: #ffffff;
            background-color: #5cb85c;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Pedido de Saque Aprovado</h1>
        </div>
        <div class="content">
            <p>Olá,</p>
            <p>Temos o prazer de informar que seu pedido de saque foi aprovado e o valor estará disponível em breve. Confira os detalhes abaixo:</p>
            <p><strong>Detalhes do Pedido:</strong></p>
            <ul>
                <li><strong>Valor:</strong> #valor# </li>
                <li><strong>Data da Solicitação:</strong> #data# </li>
                <li><strong>Status:</strong> Aprovado</li>
            </ul>
            <p>Se você tiver dúvidas ou precisar de suporte, nossa equipe estará à disposição para ajudar.</p>
            <a href="mailto:suporte@monetixpagamentos.com" class="button">Entrar em Contato</a>
        </div>
        <div class="footer">
            <p>© 2024 Monetix Pagamentos. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>`;

const emailCancelaSaque = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background-color: #d9534f;
            color: #ffffff;
            text-align: center;
            padding: 20px;
        }
        .content {
            padding: 20px;
            color: #333333;
        }
        .footer {
            background-color: #f4f4f9;
            text-align: center;
            padding: 15px;
            font-size: 12px;
            color: #888888;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            font-size: 16px;
            color: #ffffff;
            background-color: #d9534f;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Pedido de Saque Cancelado</h1>
        </div>
        <div class="content">
            <p>Olá,</p>
            <p>Informamos que seu pedido de saque foi cancelado. Veja abaixo os detalhes:</p>
            <p><strong>Detalhes do Pedido:</strong></p>
            <ul>
                <li><strong>Valor:</strong> R$ #valor#</li>
                <li><strong>Data da Solicitação:</strong> #data# </li>
                <li><strong>Status:</strong> Cancelado</li>
            </ul>            
            <p>Para mais detalhes ou para realizar uma nova solicitação, entre em contato com nossa equipe de suporte.</p>
            <a href="mailto:suporte@monetixpagamentos.com" class="button">Entrar em Contato</a>
        </div>
        <div class="footer">
            <p>© 2024 Monetix Pagamentos. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>`;


module.exports = {emailSolictacaoSaque, emailAprovacaoSaque, emailCancelaSaque};