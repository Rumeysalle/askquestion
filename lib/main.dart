import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'auth_page.dart';
import 'home_page.dart';
import 'auth_page.dart';
import 'package:askquestion/pages/addposts_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(); // Firebase başlatılıyor
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Firebase Auth',
      home: AuthPage(),
    );
  }
}
