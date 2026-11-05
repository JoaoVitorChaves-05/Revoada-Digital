import { prisma } from '../lib/prisma';

export class EmailVerificationRepository {
  // Cria um token novo, invalidando (removendo) tokens anteriores do mesmo usuario.
  async createToken(userId: string, token: string, expiresAt: Date) {
    await prisma.emailVerificationToken.deleteMany({ where: { userId, usedAt: null } });
    return prisma.emailVerificationToken.create({
      data: { userId, token, expiresAt },
    });
  }

  findByToken(token: string) {
    return prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true, emailVerified: true } } },
    });
  }

  async markUsedAndVerifyUser(tokenId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.emailVerificationToken.update({
        where: { id: tokenId },
        data: { usedAt: new Date() },
      });
      await tx.user.update({
        where: { id: userId },
        data: { emailVerified: true },
      });
    });
  }

  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, emailVerified: true },
    });
  }
}