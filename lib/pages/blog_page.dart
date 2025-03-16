import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

class BlogPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance.collection('posts').snapshots(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return Center(child: CircularProgressIndicator());
          }

          var posts = snapshot.data!.docs;

          return ListView.builder(
            itemCount: posts.length,
            itemBuilder: (context, index) {
              var post = posts[index];
              String userId = post['userId']; // Gönderiyi paylaşan userId

              return FutureBuilder<DocumentSnapshot>(
                future: FirebaseFirestore.instance
                    .collection('users')
                    .doc(userId)
                    .get(),
                builder: (context, userSnapshot) {
                  if (!userSnapshot.hasData || !userSnapshot.data!.exists) {
                    print(
                        "Firestore Hata: Kullanıcı bulunamadı! userId: $userId");
                    return Center(child: Text("Kullanıcı bilgisi bulunamadı."));
                  }

                  var userDataMap =
                      userSnapshot.data!.data() as Map<String, dynamic>?;

                  print(
                      "Firestore Kullanıcı Verisi: $userDataMap"); // 🔥 Kullanıcı verisini yazdır

                  if (userDataMap == null ||
                      !userDataMap.containsKey('username')) {
                    print("Firestore Hata: 'username' alanı eksik!");
                    return Center(child: Text("Kullanıcı adı bulunamadı."));
                  }

                  String username = userDataMap['username'];
                  return PostCard(
                    username: username,
                    content: post['content'],
                    likes: post['likes'],
                    comments: post['comments'],
                  );
                },
              );
            },
          );
        },
      ),
    );
  }
}

class PostCard extends StatelessWidget {
  final String username;
  final String content;
  final int likes;
  final int comments;

  const PostCard({
    required this.username,
    required this.content,
    required this.likes,
    required this.comments,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      margin: EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              username, // Artık userId değil, gerçek username gösterilecek!
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            SizedBox(height: 6),
            Text(content, style: TextStyle(fontSize: 14)),
            SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(Icons.favorite, color: Colors.red),
                    SizedBox(width: 4),
                    Text('$likes'),
                    SizedBox(width: 10),
                    Icon(Icons.comment, color: Colors.grey),
                    SizedBox(width: 4),
                    Text('$comments'),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
