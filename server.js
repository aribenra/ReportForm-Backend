const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/generateReport', async (req, res) => {
    const formData = req.body;

    try {
        const filteredData = Object.keys(formData)
            .filter(key => formData[key] === true || (formData[key] && typeof formData[key] === 'string' && formData[key].trim() !== ''))
            .reduce((obj, key) => {
                obj[key] = formData[key];
                return obj;
            }, {});

        const prompt = generatePrompt(filteredData);

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo', // o 'gpt-4' si tienes acceso
            messages: [
                { role: 'system', content: 'Eres un asistente que genera informes técnicos resumidos, descriptivos y estructurados.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 150,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const summary = response.data.choices[0].message.content;

        res.json({ informe: summary });
    } catch (error) {
        console.error('Error generating report:', error.response ? error.response.data : error.message);
        res.status(500).send('Error generating report');
    }
});

const generatePrompt = (data) => {
    return `Genera un informe detallado y estructurado basado en la siguiente información:

1. Descripción del Problema:
   Problema: ${data.problema}

2. Verificaciones y Acciones Realizadas:
   Se llevaron a cabo las siguientes acciones para resolver el problema:
   - ${Object.keys(data).filter(key => key !== 'problema' && key !== 'recomendaciones' && key !== 'resultados' && key !== 'comentarios').map(key => key.replace(/([A-Z])/g, ' $1').replace(/ W A N/g, ' WAN').replace(/ D N S/g, ' DNS').replace(/ O N T/g, ' ONT').replace(/ Wi Fi/g, ' WiFi').replace(/ Vo I P/g, ' VoIP').replace(/ App Fonowin/g, ' App Fonowin').toUpperCase()).join('\n   - ')}

3. Resultados:
   ${data.resultados}

4. Comentarios Adicionales:
   ${data.comentarios}

5. Recomendaciones:
   ${data.recomendaciones}`;
};

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
