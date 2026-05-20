import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

class NativeAdFullScreen extends StatefulWidget {

  const NativeAdFullScreen({required this.ad, required this.onClosed, super.key});
  final NativeAd ad;
  final VoidCallback onClosed;

  @override
  State<NativeAdFullScreen> createState() => _NativeAdFullScreenState();
}

class _NativeAdFullScreenState extends State<NativeAdFullScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Stack(
          children: [
            // Nội dung Ad
            Positioned.fill(child: AdWidget(ad: widget.ad)),

            // Nút X ở góc trên
            Positioned(
              top: 10,
              right: 10,
              child: IconButton(
                icon: const Icon(Icons.close, color: Colors.black),
                onPressed: widget.onClosed,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
