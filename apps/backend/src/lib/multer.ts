import multer from 'multer';

// Configura o armazenamento para manter o arquivo na memória RAM (Buffer)
const storage = multer.memoryStorage();

// Configura o upload limitando o tamanho (ex: máximo de 5MB por imagem)
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes em bytes
  },
  fileFilter: (req, file, cb) => {
    // Valida se o arquivo enviado é realmente uma imagem
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos!'));
    }
  },
});