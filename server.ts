import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '25mb' }));

// Shared Gemini client configured according to official guidelines
function getAiClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient models list to prevent temporary 503 high-demand outages
const PRIMARY_MODELS = ['gemini-3-flash-preview', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];

async function generateWithFallback(callFn: (modelName: string) => Promise<any>) {
  let lastError: any = null;
  for (const model of PRIMARY_MODELS) {
    try {
      return await callFn(model);
    } catch (err: any) {
      console.warn(`[Gemini Model Error on ${model}]:`, err?.message || err);
      lastError = err;
      // If 503 or 429, continue to next fallback model
      continue;
    }
  }
  throw lastError || new Error('Todos os modelos de IA estão temporariamente indisponíveis.');
}

function cleanJsonString(str: string): string {
  if (!str) return '{}';
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned;
}

// Endpoint to analyze cervical mucus image
app.post('/api/analyze-mucus', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', reportedSensation, cycleDay } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Nenhuma imagem fornecida para análise.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Chave da API Gemini não configurada no ambiente.',
      });
    }

    const ai = getAiClient();
    // Clean base64 string if data URL prefix exists
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const promptText = `
Você é uma assistente especializada em saúde reprodutiva feminina e no Método de Ovulação Billings (MOB / WOOMB International).
Analise a fotografia anexada de muco cervical / fluido biológico para orientar o registro da usuária.

Dados contextuais relatados pela usuária:
- Sensação vulvar relatada hoje: "${reportedSensation || 'Não informada'}"
- Dia do ciclo: ${cycleDay || 'Não informado'}

Orientações de análise clínica:
1. Examine a transparência (translúcido vs. opaco/leitoso), textura aparente (filante/elástico vs. cremoso/pastoso vs. aquoso) e presença de filância (efeito Spinnbarkeit).
2. Classifique o muco quanto à correlação com fases hormonais (Estrogênico / Fértil vs. Progestogênico / PBI / Infértil).
3. Lembre a REGRA DE OURO DO MÉTODO BILLINGS: O aspecto visual é estritamente secundário! A SENSAÇÃO NA VULVA ao longo do dia (seca, úmida, molhada, escorregadia ou lubrificada) é o parâmetro diagnóstico primordial da fertilidade e da identificação do Ápice.
4. Identifique com rigor se há sinais de infecção ginecológica (corrimento acinzentado, amarelado/esverdeado com bolhas, ou grumos tipo nata de leite com queixa de prurido), alertando para buscar consulta médica se aplicável.
5. Seja empática, didática, cientificamente precisa e inclua o aviso de que a IA é um instrumento educativo complementar e não substitui a orientação de uma instrutora credenciada WOOMB ou consulta com ginecologista.
`;

    const response = await generateWithFallback((model) =>
      ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: cleanBase64,
              },
            },
            {
              text: promptText,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              consistencyClassification: {
                type: Type.STRING,
                description: 'Classificação da textura (ex: Elástico/Filante, Cremoso/Pastoso, Aquoso, Espesso/Opaco)',
              },
              appearanceDescription: {
                type: Type.STRING,
                description: 'Descrição visual objetiva do fluido analisado',
              },
              visualFertilityTendency: {
                type: Type.STRING,
                description: 'Tendência visual (ex: Padrão Estrogênico (Alta fertilidade), Padrão Progestogênico (Infértil/PBI), Transição, ou Indeterminado)',
              },
              suggestedBillingsStamp: {
                type: Type.STRING,
                description: 'Selo sugerido: "Branco com bebê", "Verde", "Amarelo", "Vermelho" ou "Ápice sob observação"',
              },
              billingsGoldenRule: {
                type: Type.STRING,
                description: 'Lembrete essencial sobre a supremacia da sensação vulvar no Método Billings',
              },
              clinicalObservations: {
                type: Type.STRING,
                description: 'Análise detalhada e reflexão sobre a evolução do ciclo',
              },
              infectionRiskAlert: {
                type: Type.BOOLEAN,
                description: 'Verdadeiro se houver qualquer suspeita de corrimento anormal ou infecção',
              },
              infectionNotes: {
                type: Type.STRING,
                description: 'Observações ou orientações sobre saúde vaginal / infecção se houver',
              },
              recommendation: {
                type: Type.STRING,
                description: 'Recomendação prática para o dia de hoje segundo o Método Billings',
              },
            },
            required: [
              'consistencyClassification',
              'appearanceDescription',
              'visualFertilityTendency',
              'suggestedBillingsStamp',
              'billingsGoldenRule',
              'clinicalObservations',
              'infectionRiskAlert',
              'recommendation',
            ],
          },
        },
      })
    );

    const parsedData = JSON.parse(cleanJsonString(response.text || '{}'));
    return res.json({
      success: true,
      analysis: parsedData,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error analyzing mucus with Gemini:', error);
    return res.status(500).json({
      error: 'Falha ao processar análise visual com Inteligência Artificial.',
      details: error.message || 'Erro interno no servidor.',
    });
  }
});

// Endpoint for generating a clinical synthesis for healthcare professionals
app.post('/api/clinical-summary', async (req, res) => {
  try {
    const { cycleData, userProfile } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Chave da API Gemini não configurada.' });
    }

    const ai = getAiClient();
    const summaryPrompt = `
Você é um médico ginecologista e instrutor sênior credenciado pela WOOMB International.
Elabore um parecer clínico conciso e formal em português para compor o Relatório Mensal do Método de Ovulação Billings.

Dados da Paciente:
${JSON.stringify(userProfile, null, 2)}

Resumo do Ciclo Atual e Registros:
${JSON.stringify(cycleData, null, 2)}

Por favor, forneça em JSON estruturado:
1. "cycleOverview": síntese do comprimento do ciclo, duração da menstruação e fase folicular.
2. "peakEvaluation": identificação do Dia Ápice e se a contagem 1-2-3 pós-ápice foi cumprida.
3. "lutealPhaseSufficiency": avaliação da duração da fase lútea (normal: 11-16 dias; alerta se < 10 dias sugerindo deficiência de corpo lúteo / progesterona).
4. "instructorNotes": observações para a instrutora ou médico ginecologista assistente.
5. "recommendations": recomendações de conduta para o próximo ciclo de acordo com o objetivo da paciente.
`;

    const response = await generateWithFallback((model) =>
      ai.models.generateContent({
        model,
        contents: summaryPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cycleOverview: { type: Type.STRING },
              peakEvaluation: { type: Type.STRING },
              lutealPhaseSufficiency: { type: Type.STRING },
              instructorNotes: { type: Type.STRING },
              recommendations: { type: Type.STRING },
            },
            required: [
              'cycleOverview',
              'peakEvaluation',
              'lutealPhaseSufficiency',
              'instructorNotes',
              'recommendations',
            ],
          },
        },
      })
    );

    const parsed = JSON.parse(cleanJsonString(response.text || '{}'));
    return res.json({ success: true, summary: parsed });
  } catch (error: any) {
    console.error('Error generating clinical summary:', error);
    return res.status(500).json({
      error: 'Falha ao gerar síntese clínica.',
      details: error.message,
    });
  }
});

// Endpoint for conversational Billings Chatbot queries
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userProfile, currentCycleDay } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Nenhuma mensagem fornecida.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Chave da API Gemini não configurada no servidor.' });
    }

    const ai = getAiClient();
    const systemInstruction = `
Você é a "Assistente Especialista Billings", uma educadora em saúde reprodutiva e no Método de Ovulação Billings (MOB / WOOMB International).
Sua missão é tirar dúvidas dos usuários sobre o Método Billings, sobre o funcionamento do aplicativo Billings Life, sobre a identificação do Padrão Básico de Infertilidade (PBI), a Regra do Ápice, as 4 Regras oficiais, interpretação dos selos e acompanhamento ginecológico.

Diretrizes obrigatórias:
1. Embase-se estritamente nas regras oficiais da WOOMB International e do CENPLAFAM (Drs. John e Evelyn Billings).
2. Lembre sempre a Regra de Ouro: o parâmetro fundamental da fertilidade no Billings é a SENSAÇÃO na vulva durante as atividades do dia (seca, úmida, molhada, escorregadia ou lubrificada), e não apenas a visão do muco ou temperatura.
3. As 4 Regras:
   - Regra 1: Evitar relações nos dias de sangramento intenso da menstruação.
   - Regra 2: Relações em noites alternadas nos dias de PBI confirmado na fase pré-ovulatória.
   - Regra 3: Evitar relações em dias de mudança do PBI; aguardar 3 dias de PBI reestabelecido antes de retomar a Regra 2.
   - Regra do Ápice: Relações liberadas a partir da 4ª manhã pós-ápice até a próxima menstruação.
4. Responda em português claro, empático, acolhedor e cientificamente embasado.
5. Se o usuário relatar sintomas de infecção (odor forte, coceira intensa, dor pélvica febril, corrimento verde-acinzentado), oriente formalmente a procurar um ginecologista.
6. Deixe claro que a IA é um suporte educativo complementar e não substitui o acompanhamento por uma instrutora credenciada WOOMB ou médico.

Contexto da Usuária atual no app:
- Objetivo: ${userProfile?.goal || 'Não especificado'}
- Tipo de PBI diagnosticado: ${userProfile?.diagnosedBipType || 'Secura'}
- Dia do ciclo atual: D${currentCycleDay || 'N/A'}
`;

    // Format chat contents for Gemini SDK
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text || m.content || '' }],
    }));

    const response = await generateWithFallback((model) =>
      ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      })
    );

    const replyText = response.text || 'Desculpe, não consegui processar a resposta no momento.';

    return res.json({
      success: true,
      reply: replyText,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: 'Falha ao processar resposta do chatbot.',
      details: error.message,
    });
  }
});

// Setup Vite middleware in dev or static files in production
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Billings Life Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
