import { createClient } from '@supabase/supabase-js';

// Remoção da validação if (!supabaseUrl || !supabaseKey) que acontecia antes do Mock
export async function uploadQuestionImageToSupabase(file: Express.Multer.File): Promise<string> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltam as variáveis de ambiente do Supabase (.env)');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const fileExt = file.originalname.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `questoes/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('questoes-imagens')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Erro ao enviar imagem para o Supabase: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('questoes-imagens')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}