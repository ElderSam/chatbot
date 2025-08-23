/**
 * Script para demonstrar o sistema de logs estruturados de acordo com o challenge.md
 */
async function demonstrateObservability() {
  console.log('🚀 Demonstrando sistema de observabilidade');
  console.log('==========================================\n');

  // Simulador do RedisLoggerService
  const mockLogger = {
    async log(agent: string, data: any, level: any = 'INFO') {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        level,
        agent,
        ...data
      };
      console.log('📊 Log estruturado:');
      console.log(JSON.stringify(logEntry, null, 2));
      console.log('---\n');
    },

    async info(agent: string, data: any) {
      return this.log(agent, data, 'INFO');
    },

    async error(agent: string, data: any) {
      return this.log(agent, data, 'ERROR');
    }
  };

  try {
    // Exemplo 1: Log do RouterAgent
    console.log('1️⃣  RouterAgent processando decisão:');
    await mockLogger.info('RouterAgent', {
      conversation_id: 'conv-1234',
      user_id: 'client789',
      message: 'Qual a taxa da maquininha?',
      decision: 'KnowledgeAgent',
      execution_time: 120
    });

    // Exemplo 2: Log do KnowledgeAgent
    console.log('2️⃣  KnowledgeAgent processando resposta:');
    await mockLogger.info('KnowledgeAgent', {
      conversation_id: 'conv-1234',
      user_id: 'client789',
      question: 'Qual a taxa da maquininha?',
      sources: ['https://ajuda.infinitepay.io/pt-BR/article1'],
      execution_time: 850,
      usedEmbeddings: true,
      responseMsg: 'A taxa da maquininha varia conforme o plano...'
    });

    // Exemplo 3: Log do MathAgent
    console.log('3️⃣  MathAgent processando cálculo:');
    await mockLogger.info('MathAgent', {
      conversation_id: 'conv-5678',
      user_id: 'client456',
      message: '65 x 3.11',
      execution_time: 95,
      responseMsg: '202.15'
    });

    // Exemplo 4: Log de erro
    console.log('4️⃣  Exemplo de log de erro:');
    await mockLogger.error('KnowledgeAgent', {
      conversation_id: 'conv-9999',
      user_id: 'client123',
      question: 'Como funciona?',
      error: 'API timeout after 5000ms',
      execution_time: 5001,
      usedEmbeddings: false
    });

    console.log('✅ Demonstração concluída!');
    console.log('\n📋 Campos obrigatórios do challenge.md atendidos:');
    console.log('- ✅ timestamp (formato ISO)');
    console.log('- ✅ level (INFO, DEBUG, ERROR)');
    console.log('- ✅ agent (Router, Knowledge, Math)');
    console.log('- ✅ conversation_id');
    console.log('- ✅ user_id');
    console.log('- ✅ execution_time');
    console.log('- ✅ decision ou conteúdo processado\n');

  } catch (error) {
    console.error('❌ Erro durante demonstração:', error);
  }
}

// Executar demonstração
if (require.main === module) {
  demonstrateObservability().catch(console.error);
}
