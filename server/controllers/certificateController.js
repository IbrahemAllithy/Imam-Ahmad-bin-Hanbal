import Certificate from '../models/Certificate.js';
import AppError from '../utils/AppError.js';

export const getMyCertificates = async (req, res, next) => {
  try {
    const certs = await Certificate.find({ user: req.user._id })
      .sort({ issuedAt: -1 })
      .populate('user', 'name email');

    res.json({ success: true, data: certs });
  } catch (err) {
    next(err);
  }
};

export const getCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findById(req.params.id).populate('user', 'name email');
    if (!cert) return next(new AppError('الشهادة غير موجودة', 404));

    if (
      req.user.role !== 'admin' &&
      String(cert.user._id || cert.user) !== String(req.user._id)
    ) {
      return next(new AppError('ليس لديك صلاحية لعرض هذه الشهادة', 403));
    }

    res.json({ success: true, data: cert });
  } catch (err) {
    next(err);
  }
};
