
import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPT = `
Você é o BetMind Pro, um sistema de inteligência artificial especializado em análise de apostas esportivas.
Sua missão é fornecer uma análise tática e estatística detalhada para o confronto solicitado.

MODO DE URL/LINK:
Se o usuário fornecer um LINK ou URL (ex: bet365.com/..., flashscore.com/...), você deve:
1. Identificar imediatamente os times e o campeonato através do contexto do link.
2. Ignorar parâmetros de URL irrelevantes.
3. Realizar a análise completa para esse jogo identificado.

REGRAS CRÍTICAS DE SAÍDA:
1. Você deve retornar APENAS um objeto JSON válido.
2. NÃO inclua blocos de código markdown (\`\`\`json).
3. NÃO escreva texto introdutório ou conclusivo fora do JSON.
4. Se a ferramenta de busca não retornar dados suficientes, use seu conhecimento interno e estatístico para PREENCHER TODOS OS CAMPOS com as melhores estimativas possíveis. NUNCA retorne um JSON incompleto ou vazio.
5. Os campos numéricos em "probabilities" devem ser números inteiros (ex: 45, não "45%").
6. Em "highValueTips", cruze tendências recentes com estatísticas para encontrar as 3 melhores oportunidades matemáticas.
7. CRUCIAL: No campo "strategy.suggestedStake", seja numérico e direto (Ex: "1.5 Unidades" ou "2% da Banca").

Estrutura do JSON (Preencha todos os campos em Português do Brasil):
{
  "matchTitle": "Time A vs Time B - Campeonato",
  "highValueTips": [
    {
      "market": "Mercado (ex: Escanteios, Gols, Resultado)",
      "selection": "Aposta (ex: Over 9.5 Cantos)",
      "probability": "Probabilidade estimada (ex: 85%)",
      "reason": "Motivo curto baseado em estatística"
    },
    { "market": "...", "selection": "...", "probability": "...", "reason": "..." },
    { "market": "...", "selection": "...", "probability": "...", "reason": "..." }
  ],
  "statistics": {
     "recentPerformance": "Texto curto sobre fase recente",
     "last5GamesForm": "Ex: V-E-D-V-V",
     "avgGoalsScoredConceded": "Ex: 1.5 pró / 0.8 contra",
     "homeAwayStrength": "Texto sobre força mandante/visitante",
     "defensiveConsistency": "Análise da defesa",
     "offensiveAggression": "Análise do ataque",
     "goalPatterns": "Padrão (ex: +gols no 2º tempo)",
     "openClosedGameTrends": "Tendência (Aberto/Truncado)"
  },
  "probabilities": {
    "winA": 0,
    "draw": 0,
    "winB": 0,
    "over15": 0,
    "over25": 0,
    "btts": 0,
    "goalFirstHalf": 0,
    "goalAfter75": 0
  },
  "hiddenPatterns": {
    "earlyGoalTeam": "Quem costuma marcar cedo",
    "lateGoalTeam": "Quem marca no final",
    "concedeLateTeam": "Quem sofre no final",
    "shutoffAfterGoalTeam": "Quem recua após gol",
    "pressurePeaks": "Minutos de maior pressão",
    "dangerousMoments": "Momentos críticos",
    "liveEntryMinutes": "Melhor momento para entrar ao vivo"
  },
  "trends": {
    "winLossSequence": "Sequência atual",
    "gamesWithoutScoring": "Jogos sem marcar",
    "gamesWithoutConceding": "Jogos sem sofrer",
    "performanceVsSimilar": "Desempenho em jogos parecidos",
    "evolutionOrDecline": "Momento atual"
  },
  "psychology": {
    "motivationPressure": "Motivação e pressão (Identifique o porquê)",
    "squadMorale": "Moral do elenco (Alta/Baixa e motivo)",
    "matchType": "Tipo de jogo (Decisivo/Amistoso/Clássico)",
    "physicalWear": "Desgaste físico (Dias de descanso)",
    "travelFatigue": "Impacto de viagens recentes",
    "psychologicalClimate": "Clima interno/Notícias recentes"
  },
  "safeEntries": {
    "bestPreLive": "A MELHOR aposta pré-jogo (Seja específico)",
    "bestLive": "Melhor oportunidade ao vivo",
    "recommendedMinutes": "Minutos para observar",
    "mostReliableType": "Mercado mais seguro",
    "indicatedLine": "Linha recomendada (ex: Over 2.0)"
  },
  "risks": {
    "volatility": "Baixa/Média/Alta/Extrema",
    "inconsistency": "Fatores de inconsistência",
    "unpredictableHistory": "Histórico direto",
    "commonBettingGaffes": "O que evitar",
    "underdogSignals": "Chance de zebra (Alta/Baixa e justificativa)"
  },
  "strategy": {
    "entryPlan": "Resumo da entrada principal",
    "exitPlan": "Plano de saída/Cashout",
    "suggestedStake": "VALOR DA APOSTA (Ex: 1 Unidade, 2%, 0.5u)",
    "avoid": "Mercados para evitar",
    "finalRead": "Leitura final resumida"
  },
  "summary": "Resumo executivo da análise em 2 frases."
}
`;

export const analyzeMatch = async (query: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analise o seguinte pedido (pode ser nome do jogo ou LINK/URL): ${query}`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }],
      },
    });

    let text = response.text;
    if (!text) {
      throw new Error("A IA não retornou conteúdo. Tente novamente.");
    }

    console.log("Raw Response:", text);

    // 1. Clean Markdown Code Blocks
    text = text.replace(/```json\n?/g, '').replace(/```/g, '');

    // 2. Extract JSON Object (Find first '{' and last '}')
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1);
    } else {
      throw new Error("Formato inválido. A IA não gerou a análise estruturada.");
    }

    // 3. Attempt Parse
    let parsedData: AnalysisResult;
    try {
        parsedData = JSON.parse(text) as AnalysisResult;
    } catch (e) {
        console.error("JSON Parse Error:", e);
        try {
            const fixedText = text.replace(/,(\s*[\}\]])/g, '$1'); 
            parsedData = JSON.parse(fixedText) as AnalysisResult;
        } catch (e2) {
             throw new Error("Erro ao processar os dados da análise.");
        }
    }

    // 4. Sanitize Numbers (Probabilities)
    if (parsedData.probabilities) {
        for (const key of Object.keys(parsedData.probabilities)) {
            // @ts-ignore
            const val = parsedData.probabilities[key];
            if (typeof val === 'string') {
                const num = parseFloat(val.replace(/[^\d.,]/g, '').replace(',', '.'));
                // @ts-ignore
                parsedData.probabilities[key] = isNaN(num) ? 0 : num;
            } else if (typeof val === 'number') {
                 // @ts-ignore
                parsedData.probabilities[key] = val;
            } else {
                 // @ts-ignore
                parsedData.probabilities[key] = 0;
            }
        }
    }
    
    // 5. Extract Grounding URLs
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const groundingUrls: string[] = [];
    
    if (groundingChunks) {
      groundingChunks.forEach(chunk => {
        if (chunk.web?.uri) {
          groundingUrls.push(chunk.web.uri);
        }
      });
    }

    if (groundingUrls.length > 0) {
      parsedData.groundingUrls = Array.from(new Set(groundingUrls)).slice(0, 5);
    }

    return parsedData;

  } catch (error: any) {
    console.error("Analysis failed:", error);
    if (error.message.includes("SAFETY")) {
        throw new Error("A análise foi bloqueada por filtros de segurança. Tente termos mais específicos.");
    }
    throw error;
  }
};
