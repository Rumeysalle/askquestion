import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:askquestion/widgets/post_card.dart';

class ProfilePage extends StatelessWidget {
  final String uid;

  const ProfilePage({required this.uid});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<DocumentSnapshot>(
      future: FirebaseFirestore.instance.collection('users').doc(uid).get(),
      builder: (context, snapshot) {
        if (!snapshot.hasData || !snapshot.data!.exists) {
          return Scaffold(body: Center(child: CircularProgressIndicator()));
        }

        final data = snapshot.data!.data() as Map<String, dynamic>;

        String bioname = data['bio'] ?? '';
        String username = data['username'] ?? '';
        String photoURL = data['photoURL'] ?? 'https://i.pravatar.cc/300';
        String joinDate = (data['createdAt'] as Timestamp?)
                ?.toDate()
                .toString()
                .substring(0, 10) ??
            '';

        return Scaffold(
          appBar: AppBar(
            toolbarHeight: 48,
            backgroundColor: Colors.white,
            foregroundColor: Colors.black,
            elevation: 0,
            leading: BackButton(color: Colors.black),
          ),
          backgroundColor: Colors.white,
          body: SingleChildScrollView(
            padding:
                EdgeInsets.zero, // ✅ SafeArea kaldırıldı, padding sıfırlandı
            physics: AlwaysScrollableScrollPhysics(),
            child: Padding(
              padding: const EdgeInsets.symmetric(
                  horizontal: 16.0, vertical: 0), // ✅ sadece yatay padding
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Profil header
                  SizedBox(height: 12), // küçük bir boşluk
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      CircleAvatar(
                        radius: 40,
                        backgroundImage: NetworkImage(photoURL),
                      ),
                      SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '@$username',
                              style: TextStyle(
                                fontFamily: 'Montserrat',
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                              ),
                            ),
                            SizedBox(height: 4),
                            Text(
                              bioname,
                              style: TextStyle(
                                fontFamily: 'Montserrat',
                                fontSize: 16,
                              ),
                            ),
                            SizedBox(height: 4),
                            Row(
                              children: [
                                Icon(Icons.calendar_today,
                                    size: 14, color: Colors.grey),
                                SizedBox(width: 4),
                                Text(
                                  "Joined $joinDate",
                                  style: TextStyle(
                                    fontFamily: 'Montserrat',
                                    fontSize: 13,
                                    color: Colors.grey,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 12),

                  // 3 ikonlu buton satırı
                  Row(
                    children: [
                      Expanded(
                        child: IconButton(
                          onPressed: () {},
                          icon:
                              Image.asset('assets/icons/chats.png', height: 32),
                        ),
                      ),
                      Expanded(
                        child: IconButton(
                          onPressed: () {},
                          icon:
                              Image.asset('assets/icons/team.png', height: 32),
                        ),
                      ),
                      Expanded(
                        child: IconButton(
                          onPressed: () {},
                          icon:
                              Image.asset('assets/icons/edit.png', height: 32),
                        ),
                      ),
                    ],
                  ),
                  Divider(),

                  // Gönderiler
                  StreamBuilder<QuerySnapshot>(
                    stream: FirebaseFirestore.instance
                        .collection('posts')
                        .where('userId', isEqualTo: uid)
                        .orderBy('createdAt', descending: true)
                        .snapshots(),
                    builder: (context, postSnapshot) {
                      if (!postSnapshot.hasData) {
                        return Center(child: CircularProgressIndicator());
                      }

                      final posts = postSnapshot.data!.docs;

                      if (posts.isEmpty) {
                        return Center(child: Text("Henüz hiç paylaşım yok."));
                      }

                      return ListView.builder(
                        shrinkWrap: true,
                        physics: NeverScrollableScrollPhysics(),
                        itemCount: posts.length,
                        itemBuilder: (context, index) {
                          final postData =
                              posts[index].data() as Map<String, dynamic>;
                          final postRef = posts[index].reference;

                          return PostCard(
                            postData: postData,
                            postRef: postRef,
                            username: username,
                            userPhoto: photoURL,
                          );
                        },
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
