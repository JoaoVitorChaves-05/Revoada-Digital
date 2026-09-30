import { Router} from 'express';
import { upload } from './multer.js';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const questionsRouter = Router();
const prisma = new PrismaClient();
const supabase = createClient(
    process.env.DATABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// atulizar o '/questions' para nome do arquivo quesyions.post
questionsRouter.post('/questions', upload.single('imageURL'), async (req, res) => {
    try{
        const { QStem, Level } = req.body;
        const file = req.file as Express.Multer.File | undefined; // questões com ou sem imagens
        let imageURL: string | null = null;

        if (file) {
            const fileName =  `${Date.now()}-${file.originalname}`;
           // const {error} = await supabase.storage.from('questions').upload(fileName, file.buffer, {

    }

});