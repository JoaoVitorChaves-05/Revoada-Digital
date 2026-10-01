import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltam as variáveis de ambiente do Supabase (.env)');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadQuestionImageToSupabase(file: Express.Multer.File): Promise<string> {
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `questoes/${fileName}`;

  // 1. Faz o upload do Buffer para o Bucket do Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('questions-images') 
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Erro ao enviar imagem para o Supabase: ${uploadError.message}`);
  }

  // 2. Recupera a URL pública do arquivo
  const { data: publicUrlData } = supabase.storage
    .from('questions-images')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}