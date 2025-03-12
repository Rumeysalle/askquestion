import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Ana Sayfa"),
        actions: [
          IconButton(
            icon: Icon(Icons.logout),
            onPressed: () async {
              await FirebaseAuth.instance.signOut();
              Navigator.pop(context); // Çıkış yapınca önceki ekrana dön
            },
          )
        ],
      ),
      body: Center(
        child: Text(
          "Hoş Geldin!",
          style: TextStyle(fontSize: 24),
        ),
      ),
    );
  }
}
