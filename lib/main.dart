import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:askquestion/home_page.dart'; // Senin ana sayfan
import 'package:askquestion/auth_page.dart'; // Eğer giriş yapmadıysa

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(); // 🔥 Firebase başlatılıyor
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Ask Question',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        fontFamily: 'Montserrat',
      ),
      home: AuthPage(), // İlk açılan sayfa burası olacak (giriş ekranı)
    );
  }
}
