import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class CommentSection extends StatefulWidget {
  final String postId;

  const CommentSection({required this.postId});

  @override
  _CommentSectionState createState() => _CommentSectionState();
}

class _CommentSectionState extends State<CommentSection> {
  final TextEditingController _commentController = TextEditingController();
  final FirebaseAuth _auth = FirebaseAuth.instance;

  void _addComment() async {
    final text = _commentController.text.trim();
    if (text.isEmpty) return;

    final currentUser = _auth.currentUser;
    if (currentUser == null) return;

    final commentData = {
      'userId': currentUser.uid,
      'text': text,
      'createdAt': FieldValue.serverTimestamp(),
    };

    await FirebaseFirestore.instance
        .collection('posts')
        .doc(widget.postId)
        .collection('comments')
        .add(commentData);

    _commentController.clear();
    FocusScope.of(context).unfocus(); // Klavyeyi kapat
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 450,
      padding: EdgeInsets.all(10),
      child: Column(
        children: [
          Expanded(
            child: StreamBuilder<QuerySnapshot>(
              stream: FirebaseFirestore.instance
                  .collection('posts')
                  .doc(widget.postId)
                  .collection('comments')
                  .orderBy('createdAt', descending: true)
                  .snapshots(),
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return Center(child: CircularProgressIndicator());
                }

                var comments = snapshot.data!.docs;

                if (comments.isEmpty) {
                  return Center(child: Text("Henüz yorum yok."));
                }

                return ListView.builder(
                  itemCount: comments.length,
                  itemBuilder: (context, index) {
                    var comment = comments[index];
                    String commentUserId = comment['userId'];

                    return FutureBuilder<DocumentSnapshot>(
                      future: FirebaseFirestore.instance
                          .collection('users')
                          .doc(commentUserId)
                          .get(),
                      builder: (context, userSnapshot) {
                        if (!userSnapshot.hasData ||
                            !userSnapshot.data!.exists) {
                          return ListTile(
                            leading: CircleAvatar(
                              backgroundImage:
                                  AssetImage('assets/default_profile.png'),
                            ),
                            title: Text("Anonim Kullanıcı"),
                            subtitle: Text(comment['text'] ?? ''),
                          );
                        }

                        var userData = userSnapshot.data!;
                        String username = userData['username'] ?? "Bilinmeyen";
                        String? photoUrl = userData['photoURL'];

                        return ListTile(
                          leading: CircleAvatar(
                            backgroundImage: photoUrl != null
                                ? NetworkImage(photoUrl)
                                : AssetImage('assets/default_profile.png')
                                    as ImageProvider,
                          ),
                          title: Text(username),
                          subtitle: Text(comment['text'] ?? ''),
                        );
                      },
                    );
                  },
                );
              },
            ),
          ),
          Divider(thickness: 1),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _commentController,
                    decoration: InputDecoration(
                      hintText: "Bir yorum yazın...",
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.grey),
                      ),
                      contentPadding:
                          EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    ),
                  ),
                ),
                SizedBox(width: 8),
                IconButton(
                  icon: Icon(Icons.send, color: Colors.blue),
                  onPressed: _addComment,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
