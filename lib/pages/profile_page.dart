import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class ProfilePage extends StatefulWidget {
  @override
  _ProfilePageState createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  // Kullanıcının kimliğini almak için FirebaseAuth'ı kullanıyoruz.
  final String currentUserId = FirebaseAuth.instance.currentUser!.uid;

  late Future<Map<String, dynamic>> userData;

  @override
  void initState() {
    super.initState();
    userData =
        getUserData(); // Kullanıcı verilerini almak için fonksiyon çağırıyoruz.
  }

  // Firestore'dan kullanıcı verilerini çeken fonksiyon
  Future<Map<String, dynamic>> getUserData() async {
    DocumentSnapshot snapshot = await FirebaseFirestore.instance
        .collection(
            'users') // 'users' koleksiyonundaki kullanıcı verilerini çekiyoruz
        .doc(
            currentUserId) // Şu anki kullanıcının 'uid' bilgisine göre sorgulama yapıyoruz
        .get();

    // Veriyi bir map'e çeviriyoruz
    return snapshot.data() as Map<String, dynamic>;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Profil')),
      body: FutureBuilder<Map<String, dynamic>>(
        // Kullanıcı verisi çekildiğinde gösterilecek widget
        future: userData,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(
                child:
                    CircularProgressIndicator()); // Veriler yüklenirken gösterilen loading animasyonu
          } else if (snapshot.hasError) {
            return Center(
                child: Text('Bir hata oluştu!')); // Hata durumunda mesaj
          } else if (!snapshot.hasData) {
            return Center(child: Text('Kullanıcı verisi bulunamadı!'));
          } else {
            // Veriyi aldıktan sonra sayfa içeriğini oluşturuyoruz
            final user = snapshot.data!;
            return Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Profil bilgilerini gösteren alanlar
                  Text(
                    'Kullanıcı Adı: ${user['username']}',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'E-posta: ${user['email']}',
                    style: TextStyle(fontSize: 16),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Hesap Oluşturulma Tarihi: ${user['createdAt'].toDate().toString()}',
                    style: TextStyle(fontSize: 14, color: Colors.grey),
                  ),
                ],
              ),
            );
          }
        },
      ),
    );
  }
}
