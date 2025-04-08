import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:askquestion/comment_section.dart';
import 'addposts_page.dart';

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
              String userId = post['userId'];
              String postId = post.id;
              List<String> likes = List<String>.from(post['likes'] ?? []);

              return FutureBuilder<DocumentSnapshot>(
                future: FirebaseFirestore.instance
                    .collection('users')
                    .doc(userId)
                    .get(),
                builder: (context, userSnapshot) {
                  if (!userSnapshot.hasData || !userSnapshot.data!.exists) {
                    return Center(child: Text("Kullanıcı bilgisi bulunamadı."));
                  }

                  var userDataMap =
                      userSnapshot.data!.data() as Map<String, dynamic>?;

                  if (userDataMap == null ||
                      !userDataMap.containsKey('username')) {
                    return Center(child: Text("Kullanıcı adı bulunamadı."));
                  }

                  String username = userDataMap['username'];
                  String? photoUrl = userDataMap['photoUrl'];

                  return PostCard(
                    postId: postId,
                    username: username,
                    userPhoto: photoUrl,
                    content: post['content'],
                    likes: likes,
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

class PostCard extends StatefulWidget {
  final String postId;
  final String username;
  final String? userPhoto;
  final String content;
  final List<String> likes;

  const PostCard({
    required this.postId,
    required this.username,
    required this.userPhoto,
    required this.content,
    required this.likes,
  });

  @override
  _PostCardState createState() => _PostCardState();
}

class _PostCardState extends State<PostCard> {
  late List<String> likes;
  final String currentUserId = FirebaseAuth.instance.currentUser!.uid;

  @override
  void initState() {
    super.initState();
    likes = List.from(widget.likes);
  }

  void _toggleLike() async {
    final postRef =
        FirebaseFirestore.instance.collection('posts').doc(widget.postId);

    setState(() {
      if (likes.contains(currentUserId)) {
        likes.remove(currentUserId);
        postRef.update({
          'likes': FieldValue.arrayRemove([currentUserId])
        });
      } else {
        likes.add(currentUserId);
        postRef.update({
          'likes': FieldValue.arrayUnion([currentUserId])
        });
      }
    });
  }

  void _showLikers(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return LikersList(postId: widget.postId);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    bool isLiked = likes.contains(currentUserId);

    return Card(
      elevation: 3,
      margin: EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundImage: widget.userPhoto != null
                      ? NetworkImage(widget.userPhoto!)
                      : AssetImage('assets/default_profile.png')
                          as ImageProvider,
                  radius: 20,
                ),
                SizedBox(width: 10),
                Text(widget.username,
                    style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            SizedBox(height: 6),
            Text(widget.content, style: TextStyle(fontSize: 14)),
            SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    IconButton(
                      icon: Icon(
                        isLiked ? Icons.favorite : Icons.favorite_border,
                        color: isLiked ? Colors.red : Colors.grey,
                      ),
                      onPressed: _toggleLike,
                    ),
                    GestureDetector(
                      onTap: () => _showLikers(context),
                      child: Text('${likes.length} beğeni'),
                    ),
                  ],
                ),
                IconButton(
                  icon: Icon(Icons.comment, color: Colors.grey),
                  onPressed: () {
                    _showComments(context, widget.postId);
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showComments(BuildContext context, String postId) {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return CommentSection(postId: postId);
      },
    );
  }
}

class LikersList extends StatelessWidget {
  final String postId;

  LikersList({required this.postId});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 400,
      padding: EdgeInsets.all(10),
      child: Column(
        children: [
          Text("Beğenenler",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          Expanded(
            child: FutureBuilder<DocumentSnapshot>(
              future: FirebaseFirestore.instance
                  .collection('posts')
                  .doc(postId)
                  .get(),
              builder: (context, snapshot) {
                if (!snapshot.hasData || !snapshot.data!.exists) {
                  return Center(child: Text("Beğenen yok"));
                }

                var postData = snapshot.data!;
                List<dynamic> likes = postData['likes'] ?? [];

                if (likes.isEmpty) {
                  return Center(child: Text("Henüz kimse beğenmemiş."));
                }

                return ListView.builder(
                  itemCount: likes.length,
                  itemBuilder: (context, index) {
                    String userId = likes[index];

                    return FutureBuilder<DocumentSnapshot>(
                      future: FirebaseFirestore.instance
                          .collection('users')
                          .doc(userId)
                          .get(),
                      builder: (context, userSnapshot) {
                        if (!userSnapshot.hasData ||
                            !userSnapshot.data!.exists) {
                          return ListTile(title: Text("Anonim Kullanıcı"));
                        }

                        var userData = userSnapshot.data!;
                        String username = userData['username'] ?? "Bilinmeyen";
                        String? photoUrl = userData['photoUrl'];

                        return ListTile(
                          leading: CircleAvatar(
                            backgroundImage: photoUrl != null
                                ? NetworkImage(photoUrl)
                                : AssetImage('assets/default_profile.png')
                                    as ImageProvider,
                          ),
                          title: Text(username),
                        );
                      },
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
