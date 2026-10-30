export type SeedOption = { text: string; isCorrect: boolean };
export type SeedQuestion = {
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  mediaSource?: 'UPLOAD' | 'YOUTUBE';
  options: SeedOption[];
};

export const IEQ_GROUP_NAME = '10 IEQ';

export const IEQ_QUESTIONS: SeedQuestion[] = [
  {
    text: 'Quem construiu a arca por ordem de Deus para salvar sua familia do diluvio?',
    mediaUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/Edward_Hicks%2C_American_-_Noah%27s_Ark_-_Google_Art_Project.jpg/960px-Edward_Hicks%2C_American_-_Noah%27s_Ark_-_Google_Art_Project.jpg',
    mediaType: 'image',
    mediaSource: 'UPLOAD',
    options: [
      { text: 'Noe', isCorrect: true },
      { text: 'Abraao', isCorrect: false },
      { text: 'Moses', isCorrect: false },
      { text: 'Davi', isCorrect: false },
    ],
  },
  {
    text: 'Quantos dias e noites durou o diluvio sobre a terra?',
    options: [
      { text: '40 dias e 40 noites', isCorrect: true },
      { text: '7 dias e 7 noites', isCorrect: false },
      { text: '12 dias e 12 noites', isCorrect: false },
      { text: '100 dias e 100 noites', isCorrect: false },
    ],
  },
  {
    text: 'Qual foi o sinal da alianca que Deus colocou no ceu apos o diluvio?',
    options: [
      { text: 'O arco-iris', isCorrect: true },
      { text: 'Uma estrela', isCorrect: false },
      { text: 'Uma nuvem de fogo', isCorrect: false },
      { text: 'Um pombo', isCorrect: false },
    ],
  },
  {
    text: 'A qual cidade Deus mandou Abraao ir, prometendo fazer dele uma grande nacao?',
    options: [
      { text: 'Canaa', isCorrect: true },
      { text: 'Egito', isCorrect: false },
      { text: 'Babilonia', isCorrect: false },
      { text: 'Roma', isCorrect: false },
    ],
  },
  {
    text: 'Quem foi vendido pelos irmaos como escravo e depois se tornou governador do Egito?',
    options: [
      { text: 'Jose', isCorrect: true },
      { text: 'Benjamin', isCorrect: false },
      { text: 'Judah', isCorrect: false },
      { text: 'Levi', isCorrect: false },
    ],
  },
  {
    text: 'Por meio de quem Deus libertou o povo de Israel da escravidao no Egito?',
    mediaUrl: 'https://www.youtube.com/watch?v=NoPGSqepbE4',
    mediaType: 'video',
    mediaSource: 'YOUTUBE',
    options: [
      { text: 'Moses', isCorrect: true },
      { text: 'Aarao', isCorrect: false },
      { text: 'Josue', isCorrect: false },
      { text: 'Calebe', isCorrect: false },
    ],
  },
  {
    text: 'Quantas pragas Deus enviou sobre o Egito antes do farao libertar o povo?',
    options: [
      { text: '10 pragas', isCorrect: true },
      { text: '7 pragas', isCorrect: false },
      { text: '12 pragas', isCorrect: false },
      { text: '3 pragas', isCorrect: false },
    ],
  },
  {
    text: 'Como se chama o mar que se abriu para o povo de Israel atravessar a pe?',
    options: [
      { text: 'Mar Vermelho', isCorrect: true },
      { text: 'Mar Morto', isCorrect: false },
      { text: 'Mar da Galileia', isCorrect: false },
      { text: 'Mar Mediterraneo', isCorrect: false },
    ],
  },
  {
    text: 'Em quantos mandamentos Deus entregou a lei a Moses no monte Sinai?',
    options: [
      { text: '10 mandamentos', isCorrect: true },
      { text: '12 mandamentos', isCorrect: false },
      { text: '7 mandamentos', isCorrect: false },
      { text: '40 mandamentos', isCorrect: false },
    ],
  },
  {
    text: 'Qual e o primeiro mandamento entregue por Deus a Moses?',
    options: [
      { text: 'Nao teras outros deuses diante de mim', isCorrect: true },
      { text: 'Nao furtaras', isCorrect: false },
      { text: 'Honra teu pai e tua mae', isCorrect: false },
      { text: 'Nao mataras', isCorrect: false },
    ],
  },
  {
    text: 'Quem derrotou o gigante Golias com uma funda e uma pedra?',
    mediaUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/70/Caravaggio_-_David_with_the_Head_of_Goliath_-_Vienna.jpg/960px-Caravaggio_-_David_with_the_Head_of_Goliath_-_Vienna.jpg',
    mediaType: 'image',
    mediaSource: 'UPLOAD',
    options: [
      { text: 'Davi', isCorrect: true },
      { text: 'Saul', isCorrect: false },
      { text: 'Jonatas', isCorrect: false },
      { text: 'Samuel', isCorrect: false },
    ],
  },
  {
    text: 'Quem sucedeu Moses e liderou o povo na conquista de Jerico?',
    options: [
      { text: 'Josue', isCorrect: true },
      { text: 'Calebe', isCorrect: false },
      { text: 'Gideao', isCorrect: false },
      { text: 'Sansao', isCorrect: false },
    ],
  },
  {
    text: 'Com quantos homens Gideao venceu os midianitas, mostrando o poder de Deus?',
    options: [
      { text: '300 homens', isCorrect: true },
      { text: '3000 homens', isCorrect: false },
      { text: '30 homens', isCorrect: false },
      { text: '1000 homens', isCorrect: false },
    ],
  },
  {
    text: 'De onde vinha a forca extraordinaria de Sansao?',
    options: [
      { text: 'De seu voto de nazireu consagrado a Deus', isCorrect: true },
      { text: 'De uma armadura magica', isCorrect: false },
      { text: 'De uma pocao especial', isCorrect: false },
      { text: 'De espadas de ferro', isCorrect: false },
    ],
  },
  {
    text: 'Qual jovem israelita se tornou rainha da Persia e salvou seu povo?',
    options: [
      { text: 'Ester', isCorrect: true },
      { text: 'Rute', isCorrect: false },
      { text: 'Raquel', isCorrect: false },
      { text: 'Débora', isCorrect: false },
    ],
  },
  {
    text: 'Quem foi engolido por um grande peixe ao fugir do chamado de Deus?',
    options: [
      { text: 'Jonas', isCorrect: true },
      { text: 'Naum', isCorrect: false },
      { text: 'Habacuque', isCorrect: false },
      { text: 'Elias', isCorrect: false },
    ],
  },
  {
    text: 'Quem foi lancado na cova dos leoes por orar a Deus, mas saiu ileso?',
    mediaUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/25/Sir_Peter_Paul_Rubens_-_Daniel_in_the_Lions%27_Den_-_Google_Art_Project.jpg/960px-Sir_Peter_Paul_Rubens_-_Daniel_in_the_Lions%27_Den_-_Google_Art_Project.jpg',
    mediaType: 'image',
    mediaSource: 'UPLOAD',
    options: [
      { text: 'Daniel', isCorrect: true },
      { text: 'Jeremias', isCorrect: false },
      { text: 'Ezequiel', isCorrect: false },
      { text: 'Isaias', isCorrect: false },
    ],
  },
  {
    text: 'Em qual cidade Jesus nasceu?',
    mediaUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/Cr%C3%A8che_-_bergers.jpg/960px-Cr%C3%A8che_-_bergers.jpg',
    mediaType: 'image',
    mediaSource: 'UPLOAD',
    options: [
      { text: 'Belem', isCorrect: true },
      { text: 'Nazare', isCorrect: false },
      { text: 'Jerusalem', isCorrect: false },
      { text: 'Cafarnaum', isCorrect: false },
    ],
  },
  {
    text: 'Quem batizou Jesus no rio Jordao?',
    options: [
      { text: 'Joao Batista', isCorrect: true },
      { text: 'Pedro', isCorrect: false },
      { text: 'Paulo', isCorrect: false },
      { text: 'Tiago', isCorrect: false },
    ],
  },
  {
    text: 'Quantos discipulos Jesus escolheu como apostolos?',
    options: [
      { text: '12 discipulos', isCorrect: true },
      { text: '7 discipulos', isCorrect: false },
      { text: '10 discipulos', isCorrect: false },
      { text: '70 discipulos', isCorrect: false },
    ],
  },
  {
    text: 'Qual apostolo negou Jesus tres vezes antes do galo cantar?',
    options: [
      { text: 'Pedro', isCorrect: true },
      { text: 'Judas', isCorrect: false },
      { text: 'Tome', isCorrect: false },
      { text: 'Andre', isCorrect: false },
    ],
  },
  {
    text: 'Qual apostolo traiu Jesus por trinta moedas de prata?',
    options: [
      { text: 'Judas Iscariotes', isCorrect: true },
      { text: 'Pedro', isCorrect: false },
      { text: 'Mateus', isCorrect: false },
      { text: 'Joao', isCorrect: false },
    ],
  },
  {
    text: 'Muitos chamam Jesus de o Bom Pastor. O que ele faz pelo rebanho?',
    options: [
      { text: 'Da a sua vida pelas ovelhas', isCorrect: true },
      { text: 'Foge quando vem o lobo', isCorrect: false },
      { text: 'Vende as ovelhas', isCorrect: false },
      { text: 'Deixa as ovelhas sozinhas', isCorrect: false },
    ],
  },
  {
    text: 'Qual foi o primeiro milagre de Jesus, realizado nas bodas de Cana?',
    mediaUrl: 'https://www.youtube.com/watch?v=qD-V3NTrG0M',
    mediaType: 'video',
    mediaSource: 'YOUTUBE',
    options: [
      { text: 'Transformar agua em vinho', isCorrect: true },
      { text: 'Curar um cego', isCorrect: false },
      { text: 'Acalmar a tempestade', isCorrect: false },
      { text: 'Multiplicar os paes', isCorrect: false },
    ],
  },
  {
    text: 'Na parabola do filho prodigo, o que o pai faz quando o filho retorna?',
    options: [
      { text: 'Corre ao seu encontro e o recebe com festa', isCorrect: true },
      { text: 'Expulsa o filho de casa', isCorrect: false },
      { text: 'Cobra tudo o que ele gastou', isCorrect: false },
      { text: 'Finge que nao o viu', isCorrect: false },
    ],
  },
  {
    text: 'Na parabola do bom samaritano, quem ajudou o homem ferido na estrada?',
    mediaUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/Vincent_van_Gogh_-_The_Good_Samaritan%2C_1890_-_Google_Art_Project.jpg/960px-Vincent_van_Gogh_-_The_Good_Samaritan%2C_1890_-_Google_Art_Project.jpg',
    mediaType: 'image',
    mediaSource: 'UPLOAD',
    options: [
      { text: 'Um samaritano', isCorrect: true },
      { text: 'Um sacerdote', isCorrect: false },
      { text: 'Um levita', isCorrect: false },
      { text: 'Um soldado romano', isCorrect: false },
    ],
  },
  {
    text: 'O que significa a palavra Evangelho?',
    options: [
      { text: 'Boas novas', isCorrect: true },
      { text: 'Livro antigo', isCorrect: false },
      { text: 'Caminho estreito', isCorrect: false },
      { text: 'Oracao secreta', isCorrect: false },
    ],
  },
  {
    text: 'Quantos livros tem o Novo Testamento?',
    options: [
      { text: '27 livros', isCorrect: true },
      { text: '39 livros', isCorrect: false },
      { text: '12 livros', isCorrect: false },
      { text: '50 livros', isCorrect: false },
    ],
  },
  {
    text: 'Onde Jesus foi crucificado?',
    options: [
      { text: 'No monte Gólgota (Calvario)', isCorrect: true },
      { text: 'No monte Sinai', isCorrect: false },
      { text: 'No monte das Oliveiras', isCorrect: false },
      { text: 'No monte Carmelo', isCorrect: false },
    ],
  },
  {
    text: 'O que aconteceu com Jesus no terceiro dia apos a sua morte?',
    mediaUrl: 'https://www.youtube.com/watch?v=5HiK7BFZc5w',
    mediaType: 'video',
    mediaSource: 'YOUTUBE',
    options: [
      { text: 'Ressuscitou dos mortos', isCorrect: true },
      { text: 'Foi levado para a Babilonia', isCorrect: false },
      { text: 'Voltou para Nazare', isCorrect: false },
      { text: 'Desceu ao Egito', isCorrect: false },
    ],
  },
  {
    text: 'Em qual livro da Bíblia esta escrito: No principio Deus criou os ceus e a terra?',
    options: [
      { text: 'Genesis', isCorrect: true },
      { text: 'Exodo', isCorrect: false },
      { text: 'Salmos', isCorrect: false },
      { text: 'Joao', isCorrect: false },
    ],
  },
  {
    text: 'Qual e o maior mandamento segundo Jesus?',
    options: [
      { text: 'Amar a Deus sobre todas as coisas e ao proximo como a ti mesmo', isCorrect: true },
      { text: 'Nao furtar', isCorrect: false },
      { text: 'Guardar o sabado', isCorrect: false },
      { text: 'Jejuar todos os dias', isCorrect: false },
    ],
  }
];
