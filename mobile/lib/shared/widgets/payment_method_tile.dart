import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

enum PaymentMethod { vnpay, momo, zalopay }

class PaymentMethodInfo {
  final PaymentMethod key;
  final String name;
  final String desc;
  final String letter;
  final List<Color> gradient;
  final String? badge;
  const PaymentMethodInfo({
    required this.key,
    required this.name,
    required this.desc,
    required this.letter,
    required this.gradient,
    this.badge,
  });

  static const all = [
    PaymentMethodInfo(
      key: PaymentMethod.vnpay,
      name: 'VNPay',
      desc: 'Thẻ ATM nội địa / Internet Banking / QR Pay',
      letter: 'V',
      gradient: [Color(0xFF3B82F6), Color(0xFF1E40AF)],
      badge: 'Phổ biến',
    ),
    PaymentMethodInfo(
      key: PaymentMethod.momo,
      name: 'Ví MoMo',
      desc: 'Quét QR hoặc đăng nhập ví MoMo. Hoàn tiền 5%.',
      letter: 'M',
      gradient: [Color(0xFFEC4899), Color(0xFFBE185D)],
      badge: 'Khuyến mãi',
    ),
    PaymentMethodInfo(
      key: PaymentMethod.zalopay,
      name: 'ZaloPay',
      desc: 'Thanh toán nhanh qua Zalo. Liên kết thẻ một lần.',
      letter: 'Z',
      gradient: [Color(0xFF0EA5E9), Color(0xFF0369A1)],
    ),
  ];
}

class PaymentMethodTile extends StatelessWidget {
  final PaymentMethodInfo info;
  final bool selected;
  final VoidCallback onTap;

  const PaymentMethodTile({
    super.key,
    required this.info,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Theme.of(context).cardTheme.color,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: selected ? AppColors.primary : AppColors.border,
            width: selected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              height: 48,
              width: 48,
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: info.gradient),
                borderRadius: BorderRadius.circular(12),
              ),
              alignment: Alignment.center,
              child: Text(
                info.letter,
                style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        info.name,
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                      ),
                      if (info.badge != null) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.accent.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            info.badge!,
                            style: const TextStyle(
                              color: AppColors.accent,
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    info.desc,
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Container(
              height: 22,
              width: 22,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: selected ? AppColors.primary : Colors.transparent,
                border: Border.all(
                  color: selected ? AppColors.primary : AppColors.border,
                  width: 2,
                ),
              ),
              alignment: Alignment.center,
              child: selected
                  ? const Icon(Icons.check, size: 14, color: Colors.white)
                  : const SizedBox.shrink(),
            ),
          ],
        ),
      ),
    );
  }
}
