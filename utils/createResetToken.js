const crypto = require('crypto');
const { prisma } = require('../DB/db.config');

exports.createResetToken = async (user) => {
  const resetToken = crypto.randomBytes(32).toString('hex');

  const hashedToken = (user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex'));

  const expiresAt = (user.passwordResetExpires = new Date(
    Date.now() + 10 * 60 * 1000
  ));

  await prisma.user.update({
    where: { email: user.email },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpires: expiresAt,
    },
  });
  return resetToken;
};