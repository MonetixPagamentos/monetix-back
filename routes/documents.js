const express = require('express');
const Documents = require('../db/models/documents');
const multer = require('multer');
const path = require('path');


const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Diretório onde os arquivos serão salvos
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Gera nome único para cada arquivo
    }
});

const upload = multer({
    storage: storage,
    //limits: { fileSize: 100 * 1922 * 1922 }
});

router.use('/uploads', express.static(path.join(__dirname, 'uploads')));

router.get('/download/:filename', (req, res) => {
    try {
        
        const filename = req.params.filename;        
        const filepath = path.join(__dirname.replace('\\routes', ''), 'uploads', filename);
       
        res.download(filepath, (err) => {
            if (err) {
                console.error('Erro ao enviar o arquivo:', err);
                res.status(404).send('Arquivo não encontrado.');
            }
        });


    } catch (error) {
        console.log("erro ao baixar documento: " + error);
    }
});

router.post('/documentos-anexos', upload.fields([
    { name: 'file0', maxCount: 1 }, //contratoSocial
    { name: 'file1', maxCount: 1 }, // frente
    { name: 'file2', maxCount: 1 }, // verso
    { name: 'file3', maxCount: 1 } //selfie
]), async (req, res) => {
    const idUser = req.body.idUser;
    const idGateway = req.body.idGateway;

    if (!idGateway) {
        return res.status(400).send('ID da empresa é obrigatório!');
    }

    if (!req.files.file0 || !req.files.file1 || !req.files.file2 || !req.files.file3) {
        return res.status(400).send('Todos os arquivos são obrigatórios!');
    }

    const contratoSocialPath = req.files.file0[0].filename;
    const documentoFrentePath = req.files.file1[0].filename;
    const documentoVersoPath = req.files.file2[0].filename;
    const selfiePath = req.files.file3[0].filename;

    try {
        const existingDocument = await Documents.findOne({ where: { id_gateway: idGateway } });

        if (existingDocument) {
            const [updated] = await Documents.update({
                contrato_social: contratoSocialPath,
                documento_frente: documentoFrentePath,
                documento_verso: documentoVersoPath,
                selfie: selfiePath,
            }, {
                where: { id_gateway: idGateway }
            });

            if (updated === 0) {
                return res.status(404).send('Cliente não encontrado!');
            }
            res.status(200).json({ message: 'Documentos atualizados com sucesso!' });
        } else {
            // Se o documento não existir, crie um novo registro
            await Documents.create({
                id_gateway: idGateway,
                id_user: idUser,
                contrato_social: contratoSocialPath,
                documento_frente: documentoFrentePath,
                documento_verso: documentoVersoPath,
                selfie: selfiePath,
            });
            res.status(200).json({ message: 'Documentos inseridos com sucesso!' });
        }
    } catch (error) {
        console.error('Erro ao inserir ou atualizar os documentos no banco de dados:', error);
        res.status(500).send('Erro ao inserir ou atualizar documentos');
    }
});

router.post('/novo-documento', async (req, res) => {

    const {
        id_gateway,
        id_user,
        contrato_social,
        documento_frente,
        documento_verso,
        selfie
    } = req.body;

    try {
        const documents = await Documents.create({
            id_gateway,
            id_user,
            contrato_social,
            documento_frente,
            documento_verso,
            selfie
        });

        res.status(201).json(documents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao inserir dados do usuário.' });
    }
});

module.exports = router;