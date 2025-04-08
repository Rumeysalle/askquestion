import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class AddPostScreen extends StatefulWidget {
  @override
  _AddPostScreenState createState() => _AddPostScreenState();
}

class _AddPostScreenState extends State<AddPostScreen> {
  final TextEditingController _postController = TextEditingController();
  final String currentUserId = FirebaseAuth.instance.currentUser!.uid;

  void _sharePost() async {
    String content = _postController.text.trim();
    if (content.isEmpty) return;

    // 1. Gönderildi mesajı göster
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("Gönderin başarıyla paylaşıldı")),
    );

    // 2. Firestore'a kaydet
    await FirebaseFirestore.instance.collection('posts').add({
      'content': content,
      'userId': currentUserId,
      'timestamp': FieldValue.serverTimestamp(),
      'likes': [],
    });

    // 3. Sayfayı kapat
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(16),
      height: 500,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Üst kısım (İptal - Paylaş)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text("İptal", style: TextStyle(color: Colors.red)),
              ),
              ElevatedButton(
                onPressed: _sharePost,
                child: Text("Paylaş"),
              ),
            ],
          ),
          SizedBox(height: 10),
          // Opaklık seviyesi düşük yazı

          SizedBox(height: 10),
          // Kullanıcının yazı girdiği alan
          Expanded(
            child: TextField(
              controller: _postController,
              maxLines: null,
              decoration: InputDecoration(
                border: InputBorder.none,
                hintText: "Bir düşünceni paylaş...",
              ),
            ),
          ),
        ],
      ),
    );
  }
}
