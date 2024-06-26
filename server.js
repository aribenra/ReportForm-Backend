const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');  // Importa el paquete cors
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(cors());  // Usa el middleware cors

app.post('/api/generateReport', async (req, res) => {
    const formData = req.body;

    try {
        const response = await axios.post('https://api.openai.com/v1/completions', {
            model: 'gpt-3.5-turbo', // Modelo actualizado a gpt-3.5-turbo
            prompt: generatePrompt(formData),
            max_tokens: 150
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });

        res.json({ informe: response.data.choices[0].text });
    } catch (error) {
        console.error('Error generating report:', error.response ? error.response.data : error.message);
        if (error.response && error.response.data && error.response.data.error) {
            res.status(500).send(`Error generating report: ${error.response.data.error.message}`);
        } else {
            res.status(500).send('Error generating report');
        }
    }
});

const generatePrompt = (formData) => {
    let prompt = `Cliente: ${formData.cliente}\nTicket: ${formData.ticket}\nDescripción del Problema: ${formData.problema}\n`;

    const fields = [
        'configuracionWAN', 'optimizacionCanalesWiFi', 'cambioDNS', 'reinicioONT', 'reinicioMesh', 'sincronizacionMesh',
        'cambioContraseñaWiFi', 'implementacionCableadoRed', 'ajusteAnchoBanda', 'verificacionCoberturaWiFi',
        'revisionVelocidadDuplex', 'verificacionDispositivosAlternativos', 'configuracionVoIP', 'configuracionAppFonowin',
        'derivacionNOC', 'derivacionVT', 'supervisorNOC', 'supervisorVT', 'recomendaciones', 'resultados', 'comentarios'
    ];

    fields.forEach(field => {
        if (formData[field]) {
            prompt += `${field.replace(/([A-Z])/g, ' $1')}: ${formData[field]}\n`;
        }
    });

    return prompt;
};

app.listen(5000, () => console.log('Server running on port 5000'));
