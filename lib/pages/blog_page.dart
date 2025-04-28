import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:askquestion/widgets/post_card.dart'; // PostCard dosyanı doğru import et
import 'package:askquestion/pages/profile_page.dart'; // Profil sayfanı da import et

class BlogPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance
            .collection('posts')
            .orderBy('createdAt', descending: true)
            .snapshots(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return Center(child: CircularProgressIndicator());
          }

          var posts = snapshot.data!.docs;

          return ListView.builder(
            itemCount: posts.length,
            itemBuilder: (context, index) {
              var post = posts[index];
              String userId = post['userId'];
              List<String> likes = List<String>.from(post['likes'] ?? []);

              return FutureBuilder<DocumentSnapshot>(
                future: FirebaseFirestore.instance
                    .collection('users')
                    .doc(userId)
                    .get(),
                builder: (context, userSnapshot) {
                  if (!userSnapshot.hasData || !userSnapshot.data!.exists) {
                    return SizedBox(); // Kullanıcı bulunamazsa boş bırak
                  }

                  var userData =
                      userSnapshot.data!.data() as Map<String, dynamic>;

                  String username = userData['username'] ?? "Bilinmeyen";
                  String? photoUrl = userData['photoURL'];

                  return PostCard(
                    postData: {
                      'content': post['content'],
                      'createdAt': post['createdAt'],
                      'likes': likes,
                      'userId': userId,
                    },
                    postRef: post.reference,
                    username: username,
                    userPhoto: photoUrl,
                    onUserTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => ProfilePage(uid: userId),
                        ),
                      );
                    },
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
