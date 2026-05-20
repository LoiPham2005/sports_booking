import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../shared/routing/safe_pop.dart';

import '../../shared/mock/mock_data.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/utils/format.dart';

class OwnerPayoutPage extends StatelessWidget {
  const OwnerPayoutPage({super.key});

  @override
  Widget build(BuildContext context) {
    const pendingAmount = 18450000;
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => safePop(context),
        ),
        title: const Text('Nhận tiền'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Pending amount card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primary, AppColors.primaryDark],
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Số dư chờ thanh toán',
                    style: TextStyle(color: Colors.white70, fontSize: 13)),
                const SizedBox(height: 4),
                Text(formatVND(pendingAmount),
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 32,
                        fontWeight: FontWeight.w800)),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'Thứ 2 hàng tuần · auto chuyển',
                    style: TextStyle(
                        color: Colors.white, fontSize: 11,
                        fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),
          const _Section('Tài khoản nhận tiền'),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: AppColors.border),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                Container(
                  height: 48,
                  width: 48,
                  decoration: BoxDecoration(
                    color: AppColors.vnpay.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  alignment: Alignment.center,
                  child: const Icon(Icons.account_balance,
                      color: AppColors.vnpay),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(MockData.ownerBankAccount['bankName']!,
                          style: const TextStyle(
                              fontWeight: FontWeight.w700)),
                      Text(MockData.ownerBankAccount['accountNumber']!,
                          style: const TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 13,
                              fontFamily: 'monospace')),
                      Text(MockData.ownerBankAccount['accountHolder']!,
                          style: const TextStyle(
                              color: AppColors.textMuted, fontSize: 11)),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.edit_outlined),
                  onPressed: () {},
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),
          const _Section('Lịch sử chuyển khoản'),
          ...MockData.payoutHistory.map(
            (p) => Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: AppColors.border),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: [
                  Container(
                    height: 36,
                    width: 36,
                    decoration: BoxDecoration(
                      color: AppColors.success.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.check,
                        color: AppColors.success, size: 18),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(formatDateLong(p.date),
                            style: const TextStyle(
                                fontWeight: FontWeight.w700, fontSize: 13)),
                        const Text('Đã chuyển thành công',
                            style: TextStyle(
                                color: AppColors.success, fontSize: 11)),
                      ],
                    ),
                  ),
                  Text(formatVND(p.amount),
                      style: const TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 14)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String text;
  // ignore: use_super_parameters
  const _Section(this.text);
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Text(text,
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
      );
}
