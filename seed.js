const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/database');
const { 
  Usuario, 
  Genero, 
  Historia, 
  Capitulo, 
  Comentario, 
  Curtida, 
  HistoriaGenero,
  Figurinha,
  figurinhasPadrao,
  inicializarGeneros 
} = require('./models');
require('dotenv').config();

// Dados de exemplo
const dadosIniciais = async () => {
  try {
    console.log('🌱 Iniciando seed do banco de dados MariaDB...');
    
    // Testar conexão
    await sequelize.authenticate();
    console.log('✅ Conectado ao MariaDB');
    
    // Sincronizar tabelas
    await sequelize.sync({ force: true });
    console.log('✅ Tabelas criadas');
    
    // Inicializar gêneros
    await inicializarGeneros();
    
    // Buscar gêneros
    const generos = await Genero.findAll();
    const generoRomance = generos.find(g => g.name === 'Romance');
    const generoDrama = generos.find(g => g.name === 'Drama');
    const generoPoesia = generos.find(g => g.name === 'Poesia');
    const generoFantasia = generos.find(g => g.name === 'Fantasia');
    const generoTerror = generos.find(g => g.name === 'Terror');
    const generoAdulto = generos.find(g => g.name === 'Literatura Adulta');
    
    // Criar usuários de exemplo
    const senhaHash = await bcrypt.hash('senha123', 12);
    
    const usuarios = await Usuario.bulkCreate([
      {
        username: 'ana_escritora',
        display_name: 'Ana Escritora',
        email: 'ana@catcativa.com',
        password_hash: senhaHash,
        bio: 'Amante de histórias românticas e dramas emocionantes. Escrevo desde os 15 anos.',
        avatar_url: '/assets/logo/isotipo-gato.png',
        is_admin: true
      },
      {
        username: 'pedro_poeta',
        display_name: 'Pedro Poeta',
        email: 'pedro@catcativa.com',
        password_hash: senhaHash,
        bio: 'Poeta nas horas vagas. Amo escrever sobre amor, saudade e a vida.',
        avatar_url: '/assets/logo/isotipo-gato.png'
      },
      {
        username: 'maria_fantasia',
        display_name: 'Maria Fantasia',
        email: 'maria@catcativa.com',
        password_hash: senhaHash,
        bio: 'Escritora de fantasia e ficção científica. Mundo mágicos são meu forte!',
        avatar_url: '/assets/logo/isotipo-gato.png'
      },
      {
        username: 'lucas_terror',
        display_name: 'Lucas Terror',
        email: 'lucas@catcativa.com',
        password_hash: senhaHash,
        bio: 'Escritor de terror e suspense. Prepare-se para se arrepiar!',
        avatar_url: '/assets/logo/isotipo-gato.png'
      }
    ]);
    
    console.log(`👥 ${usuarios.length} usuários criados`);
    
    // Adicionar figurinhas para cada usuário
    for (const usuario of usuarios) {
      const figurinhasIniciais = figurinhasPadrao.slice(0, 6);
      for (const codigo of figurinhasIniciais) {
        await Figurinha.create({
          usuario_id: usuario.id,
          codigo
        });
      }
    }
    
    // Criar histórias de exemplo
    const historiasData = [
      {
        title: 'Please, Feel The Same',
        description: 'Uma história de amor proibido entre dois mundos diferentes. Será que o amor verdadeiro pode superar todas as barreiras?',
        author_id: usuarios[0].id,
        classificacao: '+16',
        status: 'EM ANDAMENTO',
        views: 1250,
        likes_count: 89,
        comments_count: 45,
        generos: [generoRomance.id, generoDrama.id]
      },
      {
        title: 'Amor Unilateral',
        description: 'Uma coletânea de poemas sobre amores não correspondidos e a dor de amar em silêncio.',
        author_id: usuarios[1].id,
        classificacao: 'LIVRE',
        status: 'COMPLETA',
        views: 890,
        likes_count: 156,
        comments_count: 32,
        generos: [generoPoesia.id, generoDrama.id]
      },
      {
        title: 'O Reino das Sombras',
        description: 'Em um mundo onde a magia é proibida, uma jovem descobre ter poderes que podem mudar o destino de todo o reino.',
        author_id: usuarios[2].id,
        classificacao: '+12',
        status: 'EM ANDAMENTO',
        views: 2100,
        likes_count: 234,
        comments_count: 78,
        generos: [generoFantasia.id]
      },
      {
        title: 'A Mansão Assombrada',
        description: 'Um grupo de amigos decide passar uma noite em uma mansão abandonada. O que eles não sabem é que a casa guarda segredos sombrios.',
        author_id: usuarios[3].id,
        classificacao: '+18',
        status: 'EM ANDAMENTO',
        views: 1567,
        likes_count: 178,
        comments_count: 56,
        generos: [generoTerror.id]
      },
      {
        title: 'Noites de Paixão',
        description: 'Uma história intensa sobre desejos, paixões e segredos que mudam vidas para sempre.',
        author_id: usuarios[0].id,
        classificacao: '+18',
        status: 'COMPLETA',
        views: 3200,
        likes_count: 445,
        comments_count: 123,
        generos: [generoRomance.id, generoAdulto.id]
      },
      {
        title: 'Entre Dois Mundos',
        description: 'Dois adolescentes de realidades completamente diferentes se encontram e descobrem que têm mais em comum do que imaginavam.',
        author_id: usuarios[0].id,
        classificacao: '+14',
        status: 'EM ANDAMENTO',
        views: 980,
        likes_count: 67,
        comments_count: 28,
        generos: [generoRomance.id, generoDrama.id]
      }
    ];
    
    const historias = [];
    for (const h of historiasData) {
      const { generos, ...historiaData } = h;
      const historia = await Historia.create(historiaData);
      
      // Adicionar gêneros
      for (const generoId of generos) {
        await HistoriaGenero.create({
          historia_id: historia.id,
          genero_id: generoId
        });
      }
      
      historias.push(historia);
    }
    
    console.log(`📚 ${historias.length} histórias criadas`);
    
    // Criar capítulos para as histórias
    const capitulosData = [];
    
    // Capítulos para "Please, Feel The Same"
    for (let i = 1; i <= 5; i++) {
      capitulosData.push({
        historia_id: historias[0].id,
        title: `Capítulo ${i}: O Encontro`,
        content: `<p>Este é o capítulo ${i} da história "Please, Feel The Same".</p>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>`,
        chapter_number: i,
        views: Math.floor(Math.random() * 200) + 50
      });
    }
    
    // Capítulos para "Amor Unilateral"
    for (let i = 1; i <= 3; i++) {
      capitulosData.push({
        historia_id: historias[1].id,
        title: `Parte ${i}: Versos do Coração`,
        content: `<h3>Poema ${i}</h3>
<p>Amar é sentir<br>
Que o mundo para quando você está perto<br>
Que o coração dispara<br>
Ao ouvir sua voz</p>
<p>Mas amar em silêncio<br>
É uma dor que ninguém vê<br>
É sorrir por fora<br>
E chorar por dentro</p>
<p>Espero um dia<br>
Que você perceba<br>O que sinto por você<br>
Antes que seja tarde demais</p>`,
        chapter_number: i,
        views: Math.floor(Math.random() * 150) + 30
      });
    }
    
    // Capítulos para "O Reino das Sombras"
    for (let i = 1; i <= 8; i++) {
      capitulosData.push({
        historia_id: historias[2].id,
        title: `Capítulo ${i}: A Descoberta`,
        content: `<p>O vento soprava forte pelas ruas do reino, trazendo consigo um ar de mistério e magia proibida.</p>
<p>Elara caminhava pelas ruas estreitas, sempre atenta aos guardas que patrulhavam a cidade. Desde que descobrira seus poderes, vivera com medo constante de ser descoberta.</p>
<p>A magia havia sido banida há séculos, após a Grande Guerra que quase destruiu todo o reino. Agora, qualquer pessoa encontrada com poderes mágicos era imediatamente presa - ou pior.</p>
<p>Mas Elara não escolhera ter esses poderes. Eles simplesmente apareceram em um momento de grande perigo, quando ela tinha apenas doze anos...</p>`,
        chapter_number: i,
        views: Math.floor(Math.random() * 300) + 100
      });
    }
    
    // Capítulos para "A Mansão Assombrada"
    for (let i = 1; i <= 4; i++) {
      capitulosData.push({
        historia_id: historias[3].id,
        title: `Noite ${i}: O Terror Começa`,
        content: `<p>A mansão se erguia contra a lua cheia, suas janelas quebradas refletindo a luz pálida como olhos demoníacos.</p>
<p>— Você tem certeza de que quer fazer isso? — perguntou Marcos, sua voz trêmula.</p>
<p>— Claro! — respondeu Julia, tentando parecer corajosa, embora seu coração batesse descontroladamente. — É só uma casa velha. Não há nada de sobrenatural aqui.</p>
<p>Os quatro amigos se aproximaram da porta principal, que rangeu ao ser empurrada. Um cheiro de mofo e decadência os atingiu, fazendo Julia querer vomitar.</p>
<p>O que eles não sabiam é que, uma vez dentro, não seriam mais os mesmos...</p>`,
        chapter_number: i,
        views: Math.floor(Math.random() * 250) + 80
      });
    }
    
    // Capítulos para "Noites de Paixão"
    for (let i = 1; i <= 10; i++) {
      capitulosData.push({
        historia_id: historias[4].id,
        title: `Capítulo ${i}: Desejos`,
        content: `<p>Aquela noite mudaria tudo entre eles.</p>
<p>O encontro casual em um bar movimentado da cidade parecia ter sido planejado pelo destino. Olhares se cruzaram, sorrisos foram trocados, e antes que percebessem, já estavam envolvidos em uma conversa que parecia não ter fim.</p>
<p>Havia algo magnético entre eles, uma atração que transcendia a lógica e a razão. Era como se seus corpos reconhecessem algo que suas mentes ainda não compreendiam.</p>
<p>— Você acredita em amor à primeira vista? — ela perguntou, seus olhos brilhando na luz tênue do bar.</p>
<p>— Não — ele respondeu, aproximando-se. — Mas estou começando a mudar de ideia.</p>`,
        chapter_number: i,
        views: Math.floor(Math.random() * 400) + 150
      });
    }
    
    await Capitulo.bulkCreate(capitulosData);
    console.log(`📖 ${capitulosData.length} capítulos criados`);
    
    // Criar comentários
    const comentariosData = [
      {
        usuario_id: usuarios[1].id,
        historia_id: historias[0].id,
        content: 'Estou amando essa história! Mal posso esperar pelo próximo capítulo!',
        stickers: ['❤️', '⭐']
      },
      {
        usuario_id: usuarios[2].id,
        historia_id: historias[0].id,
        content: 'Que enredo incrível! A escrita é maravilhosa.',
        stickers: ['✨']
      },
      {
        usuario_id: usuarios[0].id,
        historia_id: historias[1].id,
        content: 'Lindos poemas! Me emocionei muito lendo.',
        stickers: ['😢', '❤️']
      },
      {
        usuario_id: usuarios[3].id,
        historia_id: historias[2].id,
        content: 'Adoro histórias de fantasia! Continue assim!',
        stickers: ['🔮', '✨']
      },
      {
        usuario_id: usuarios[0].id,
        historia_id: historias[3].id,
        content: 'Arrepiei lendo! Muito bom!',
        stickers: ['💀', '👻']
      }
    ];
    
    await Comentario.bulkCreate(comentariosData);
    console.log(`💬 ${comentariosData.length} comentários criados`);
    
    // Criar curtidas
    const curtidasData = [];
    for (const historia of historias) {
      // Cada história recebe algumas curtidas aleatórias
      const numCurtidas = Math.floor(Math.random() * 4) + 1;
      
      for (let i = 0; i < numCurtidas && i < usuarios.length; i++) {
        if (usuarios[i].id !== historia.author_id) {
          curtidasData.push({
            usuario_id: usuarios[i].id,
            historia_id: historia.id
          });
        }
      }
    }
    
    await Curtida.bulkCreate(curtidasData);
    console.log(`❤️ ${curtidasData.length} curtidas criadas`);
    
    console.log('\n✅ Seed concluído com sucesso!');
    console.log('\n📋 Dados de login para teste:');
    console.log('   Email: ana@catcativa.com');
    console.log('   Senha: senha123');
    console.log('   (Todos os usuários têm a mesma senha)');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    await sequelize.close();
    process.exit(1);
  }
};

dadosIniciais();
