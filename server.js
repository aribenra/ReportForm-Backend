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
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'Eres un asistente que genera informes técnicos resumidos y estructurados.' },
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
        const formattedReport = formatReport(filteredData, summary);

        res.json({ informe: formattedReport });
    } catch (error) {
        console.error('Error generating report:', error.response ? error.response.data : error.message);
        res.status(500).send('Error generating report');
    }
});

const generatePrompt = (data) => {
    return `Genera un informe basado en la siguiente información:

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

const formatReport = (data, summary) => {
    return `
        <h1>Informe de Resolución de Problemas de Conectividad</h1>
        <div>
            <h2>1. Descripción del Problema</h2>
        </div>
        <p>Problema: ${data.problema}</p>
        <div>
            <h2>2. Verificaciones y Acciones Realizadas</h2>
        </div>
        <p>Se llevaron a cabo las siguientes acciones para resolver el problema:</p>
        <ul>
            ${Object.keys(data).filter(key => key !== 'problema' && key !== 'recomendaciones' && key !== 'resultados' && key !== 'comentarios').map(key => `<li><span class="bold">${key.replace(/([A-Z])/g, ' $1').replace(/ W A N/g, ' WAN').replace(/ D N S/g, ' DNS').replace(/ O N T/g, ' ONT').replace(/ Wi Fi/g, ' WiFi').replace(/ Vo I P/g, ' VoIP').replace(/ App Fonowin/g, ' App Fonowin').toUpperCase()}:</span> Se realizó una configuración de la ${key} para optimizar la conexión a internet.</li>`).join('')}
        </ul>
        <div>
            <h2>3. Resultados</h2>
        </div>
        <p>${data.resultados}</p>
        <div>
            <h2>4. Comentarios Adicionales</h2>
        </div>
        <p>${data.comentarios}</p>
        <div>
            <h2>5. Recomendaciones</h2>
        </div>
        <p>${data.recomendaciones}</p>
    `;
};

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
