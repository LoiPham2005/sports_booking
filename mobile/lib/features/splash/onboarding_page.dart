import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../shared/routing/route_paths.dart';
import '../../shared/theme/app_colors.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final _page = PageController();
  int _index = 0;

  final slides = const [
    _SlideData(emoji: '🏸', title: 'Đặt sân chỉ 30 giây', subtitle: 'Chọn môn, chọn giờ, thanh toán — đơn giản như đặt món ăn.'),
    _SlideData(emoji: '⚽', title: 'Đa dạng môn thể thao', subtitle: 'Bóng đá, cầu lông, tennis, pickleball, bóng rổ — 600+ sân khắp Việt Nam.'),
    _SlideData(emoji: '💳', title: 'Thanh toán an toàn', subtitle: 'VNPay, MoMo, ZaloPay. Mã hoá đầu-cuối, hoàn tiền linh hoạt.'),
  ];

  @override
  Widget build(BuildContext context) {
    final last = _index == slides.length - 1;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () => context.go(RoutePaths.login),
                  child: const Text('Bỏ qua'),
                ),
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _page,
                itemCount: slides.length,
                onPageChanged: (i) => setState(() => _index = i),
                itemBuilder: (_, i) => _Slide(data: slides[i]),
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(slides.length, (i) {
                final active = i == _index;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  height: 8,
                  width: active ? 24 : 8,
                  decoration: BoxDecoration(
                    color: active ? AppColors.primary : AppColors.border,
                    borderRadius: BorderRadius.circular(20),
                  ),
                );
              }),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: FilledButton(
                onPressed: () {
                  if (last) {
                    context.go(RoutePaths.login);
                  } else {
                    _page.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.ease);
                  }
                },
                child: Text(last ? 'Bắt đầu' : 'Tiếp tục'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SlideData {
  final String emoji, title, subtitle;
  const _SlideData({required this.emoji, required this.title, required this.subtitle});
}

class _Slide extends StatelessWidget {
  final _SlideData data;
  const _Slide({required this.data});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            height: 200,
            width: 200,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFFD1FAE5), Color(0xFFFED7AA)],
              ),
            ),
            alignment: Alignment.center,
            child: Text(data.emoji, style: const TextStyle(fontSize: 100)),
          ),
          const SizedBox(height: 40),
          Text(
            data.title,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.displaySmall,
          ),
          const SizedBox(height: 12),
          Text(
            data.subtitle,
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 15, height: 1.5),
          ),
        ],
      ),
    );
  }
}
