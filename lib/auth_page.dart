import 'package:askquestion/home_page.dart';
import 'package:askquestion/register_page.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthPage extends StatefulWidget {
  @override
  _AuthPageState createState() => _AuthPageState();
}

class _AuthPageState extends State<AuthPage> {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  String errorMessage = "";

  Future<void> signIn() async {
    try {
      await _auth.signInWithEmailAndPassword(
        email: emailController.text.trim(),
        password: passwordController.text,
      );
      // Giriş başarılı olursa HomePage'e yönlendir
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => HomePage()),
      );
    } on FirebaseAuthException catch (e) {
      setState(() {
        if (e.code == 'user-not-found') {
          errorMessage = "Bu e-posta ile kayıtlı bir hesap bulunamadı.";
        } else if (e.code == 'wrong-password') {
          errorMessage = "Şifre yanlış. Lütfen tekrar deneyin.";
        } else if (e.code == 'invalid-email') {
          errorMessage = "Geçersiz e-posta adresi girdiniz.";
        } else {
          errorMessage = e.message ?? "Bir hata oluştu.";
        }
      });
    }
  }

  Future<void> signOut() async {
    await _auth.signOut();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF0014A8),
              Color(0xFF1920A0),
              Color(0xFF4000a8),
            ], // Gradient arka plan
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextField(
                controller: emailController,
                decoration: InputDecoration(
                  labelText: "Email",
                  labelStyle: TextStyle(
                      color: Colors.white.withOpacity(0.5)), // Opaklık eklendi
                  enabledBorder: OutlineInputBorder(
                    borderSide: BorderSide(
                        color: Color(0xFFA5BCEF)
                            .withOpacity(0.7)), // Opaklık eklendi
                    borderRadius: BorderRadius.circular(10),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderSide: BorderSide(
                        color: const Color(0xFFE7E7E7)
                            .withOpacity(0.7)), // Opaklık eklendi
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),

                style: TextStyle(
                    color: const Color(0xFFE7E7E7)
                        .withOpacity(0.7)), // Opaklık eklendi
              ),
              SizedBox(height: 20),
              TextField(
                controller: passwordController,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: "Şifre",
                  labelStyle: TextStyle(
                      color: const Color(0xFFE7E7E7)
                          .withOpacity(0.5)), // Opaklık eklendi
                  enabledBorder: OutlineInputBorder(
                    borderSide: BorderSide(
                        color: Color(0xFFA5BCEF)
                            .withOpacity(0.7)), // Opaklık eklendi
                    borderRadius: BorderRadius.circular(10),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderSide: BorderSide(
                        color: const Color(0xFFE7E7E7)
                            .withOpacity(0.7)), // Opaklık eklendi
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),

                style: TextStyle(
                    color: const Color(0xFFE7E7E7)
                        .withOpacity(0.5)), // Opaklık eklendi
              ),
              SizedBox(height: 20),
              SizedBox(height: 20),
              ElevatedButton(
                onPressed: signIn,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFA5BCEF),
                  padding: EdgeInsets.symmetric(vertical: 10, horizontal: 100),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(5),
                  ),
                ),
                child: Text(
                  "Giriş Yap",
                  style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.black),
                ),
              ),
              SizedBox(height: 20),
              if (errorMessage.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(
                    errorMessage,
                    style: TextStyle(color: Colors.red),
                  ),
                ),
              SizedBox(height: 20),
              GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => RegisterPage()),
                  );
                },
                child: Text(
                  "Hesabın yok mu? Kayıt Ol",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    decoration: TextDecoration.underline,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
