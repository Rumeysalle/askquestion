import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:askquestion/comment_section.dart';

class PostCard extends StatefulWidget {
  final Map<String, dynamic> postData;
  final DocumentReference postRef;
  final String username;
  final String? userPhoto;
  final VoidCallback? onUserTap; // ✅ Kullanıcıya tıklama için eklendi

  const PostCard({
    required this.postData,
    required this.postRef,
    required this.username,
    required this.userPhoto,
    this.onUserTap, // ✅ Constructor'da tanımlandı
    Key? key,
  }) : super(key: key);

  @override
  _PostCardState createState() => _PostCardState();
}

class _PostCardState extends State<PostCard> {
  late List<String> likes;
  final String currentUserId = FirebaseAuth.instance.currentUser!.uid;

  @override
  void initState() {
    super.initState();
    likes = List<String>.from(widget.postData['likes'] ?? []);
  }

  void _toggleLike() async {
    final postRef = widget.postRef;

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

  void _showComments(BuildContext context, String postId) {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return CommentSection(postId: postId);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final createdAt = (widget.postData['createdAt'] as Timestamp?)?.toDate();
    bool isLiked = likes.contains(currentUserId);

    return Card(
      margin: EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                GestureDetector(
                  onTap: widget.onUserTap, // ✅ Profil fotoğrafına tıklayınca
                  child: CircleAvatar(
                    backgroundImage: widget.userPhoto != null
                        ? NetworkImage(widget.userPhoto!)
                        : AssetImage('assets/default_profile.png')
                            as ImageProvider,
                    radius: 20,
                  ),
                ),
                SizedBox(width: 10),
                GestureDetector(
                  onTap: widget.onUserTap, // ✅ Kullanıcı adına tıklayınca
                  child: Text(
                    widget.username,
                    style: TextStyle(
                      fontFamily: 'Montserrat',
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 10),
            Text(
              widget.postData['content'] ?? '',
              style: TextStyle(
                fontSize: 13,
                fontFamily: 'Montserrat',
              ),
            ),
            SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  createdAt != null
                      ? "${createdAt.day}/${createdAt.month}/${createdAt.year} ${createdAt.hour}:${createdAt.minute.toString().padLeft(2, '0')}"
                      : '',
                  style: TextStyle(
                    color: Colors.grey,
                    fontSize: 11,
                    fontFamily: 'Montserrat',
                  ),
                ),
                Row(
                  children: [
                    IconButton(
                      icon: Icon(
                        isLiked ? Icons.favorite : Icons.favorite_border,
                        color: isLiked ? Colors.red : Colors.grey,
                        size: 20,
                      ),
                      onPressed: _toggleLike,
                    ),
                    Text(
                      '${likes.length}',
                      style: TextStyle(fontSize: 12),
                    ),
                    SizedBox(width: 8),
                    IconButton(
                      icon: Icon(Icons.comment, size: 20, color: Colors.grey),
                      onPressed: () =>
                          _showComments(context, widget.postRef.id),
                    ),
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
