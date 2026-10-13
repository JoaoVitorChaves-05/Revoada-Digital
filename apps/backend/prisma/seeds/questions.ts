import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { prisma } from '../../src/lib/prisma';

interface SeedAlternative {
    text: string;
    isCorrect: boolean;
}

interface SeedQuestion {
    text: string;
    difficulty: number;
    alternatives: SeedAlternative[];
    subject: string[];
    concept: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractQuestions(data: unknown): SeedQuestion[] {
    if (!isRecord(data) || !Array.isArray(data.questions)) {
        throw new Error('Expected the JSON to contain a "questions" array.');
    }

    return data.questions.map((raw, index) => {
        if (!isRecord(raw)) {
            throw new Error(`Question ${index} is not an object.`);
        }
        const text = raw.text;
        const difficulty = raw.difficulty;
        const rawAlternatives = raw.alternatives;
        const rawSubject = raw.subject;
        const rawConcept = raw.concept;

        if (typeof text !== 'string' || !text.trim()) {
            throw new Error(`Question ${index} has no valid text.`);
        }

        if (
            typeof difficulty !== 'number' ||
            !Number.isInteger(difficulty)  //||
            // !(difficulty > 0 && difficulty < 4)
        ) {
            throw new Error(`Question ${index} has invalid difficulty.`);
        }

        if (!Array.isArray(rawAlternatives) || rawAlternatives.length === 0) {
            throw new Error(`Question ${index} has no alternatives.`);
        }

        const alternatives = rawAlternatives.map((rawAlternative, altIndex) => {
            if (!isRecord(rawAlternative)) {
                throw new Error(
                    `Question ${index}, alternative ${altIndex} is invalid.`,
                );
            }
            const alternativeText = rawAlternative.text?.trim() ? rawAlternative.text : ' ';
            const isCorrect = rawAlternative.isCorrect;
          
            if (
                typeof alternativeText !== 'string' ||
                !alternativeText.trim()
            ) {
                /**
                throw new Error(
                    `Question ${index}, alternative ${altIndex} has no text.`,
                );
                */
            }
            
            if (typeof isCorrect !== 'boolean') {
                throw new Error(
                    `Question ${index}, alternative ${altIndex} has invalid correctness.`,
                );
            }

            return {
                text: alternativeText.trim(),
                isCorrect,
            };
        });

        const subject = rawSubject.map((item, subIndex) => {
            if (typeof item !== 'string' || !item.trim()) {
                throw new Error(`Question ${index}, subject ${subIndex} is not a valid string.`);
            }
            return item.trim();
        });

        const concept = rawConcept.map((item, conIndex) => {
            if (typeof item !== 'string' || !item.trim()) {
                throw new Error(`Question ${index}, concept ${conIndex} is not a valid string.`);
            }
            return item.trim();
        });

        if (alternatives.filter((alternative) => alternative.isCorrect).length !== 1) {
            throw new Error(
                `Question ${index} must have exactly one correct alternative.`,
            );
        }

        return {
            text: text.trim(),
            difficulty,
            alternatives,
            subject,
            concept,
        };
    });
}

async function main(): Promise<void> {
    const filePath = join(__dirname, 'data', 'QuestionsFinal.json');
    const contents = await readFile(filePath, 'utf-8');
    const json: unknown = JSON.parse(contents);

    const questions = extractQuestions(json);

    const seenTexts = new Set<string>();

    for (const question of questions) {
        if (seenTexts.has(question.text)) {
            throw new Error(`Duplicate question text in JSON: "${question.text}"`);
        }

        seenTexts.add(question.text);
    }

    let inserted = 0;
    let skipped = 0;

    await prisma.$transaction(async (tx) => {
        for (const question of questions) {
            const existing = await tx.question.findUnique({
                where: { text: question.text },
                select: { id: true },
            });

            if (existing) {
                skipped++;
                continue;
            }

            await tx.question.create({
                data: {
                    text: question.text,
                    difficulty: question.difficulty,
                    alternatives: {
                        create: question.alternatives,
                    },
                    subject: question.subject,
                    concept: question.concept,            
                },
            });

            inserted++;
        }
    }, { timeout: 10 * 60 * 1000, maxWait: 60 * 1000 });

    console.log(`Questions in file: ${questions.length}`);
    console.log(`Inserted:          ${inserted}`);
    console.log(`Skipped existing:  ${skipped}`);
}

main()
    .catch((error: unknown) => {
        console.error('Question seeding failed:');

        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }

        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

