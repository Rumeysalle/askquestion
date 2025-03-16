import 'package:askquestion/home_page.dart';
import 'package:askquestion/register_page.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

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
        color: Color(0xFFE3E8FF), // Arka plan rengi
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
                      fontFamily: 'Montserrat',
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF1E1919)
                          .withOpacity(0.5)), // Opaklık eklendi
                  enabledBorder: OutlineInputBorder(
                    borderSide: BorderSide(
                        color: Color(0xFFA49B93)
                            .withOpacity(0.7)), // Opaklık eklendi
                    borderRadius: BorderRadius.circular(10),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderSide: BorderSide(
                        color: const Color(0xFFA49B93)
                            .withOpacity(0.7)), // Opaklık eklendi
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                style: TextStyle(
                    color: const Color(0xFF1E1919)
                        .withOpacity(0.7)), // Opaklık eklendi
              ),
              SizedBox(height: 20),
              TextField(
                controller: passwordController,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: "Şifre",
                  labelStyle: TextStyle(
                      fontFamily: 'Montserrat',
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF1E1919)
                          .withOpacity(0.5)), // Opaklık eklendi
                  enabledBorder: OutlineInputBorder(
                    borderSide: BorderSide(
                        color: Color(0xFFA49B93)
                            .withOpacity(0.7)), // Opaklık eklendi
                    borderRadius: BorderRadius.circular(10),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderSide: BorderSide(
                        color: const Color(0xFFA49B93)
                            .withOpacity(0.7)), // Opaklık eklendi
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                style: TextStyle(
                    color: const Color(0xFF1E1919)
                        .withOpacity(0.7)), // Opaklık eklendi
              ),
              SizedBox(height: 50),
              ElevatedButton(
                onPressed: signIn,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E1919), // Buton rengi
                  padding: EdgeInsets.symmetric(vertical: 15, horizontal: 100),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(5),
                  ),
                ),
                child: Text(
                  "Giriş Yap",
                  style: TextStyle(
                    fontFamily: 'Montserrat',
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: const Color(0xFFE3E8FF), // Yazı rengi
                    letterSpacing: 1.0, // Harfler arasındaki boşluk artırıldı
                  ),
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
              Row(
                children: [
                  Expanded(
                    child: Divider(
                      color: Color(0xFF1E1919).withOpacity(0.3), // Çizgi rengi
                      thickness: 1,
                      indent: 10,
                      endIndent: 10, // Ortada boşluk için
                    ),
                  ),
                  Padding(
                    padding: EdgeInsets.symmetric(
                        horizontal: 8), // Yazı ile çizgi arasındaki boşluk
                    child: Text(
                      'veya', // Ortaya yazılacak metin
                      style: TextStyle(
                          fontFamily: 'Montserrat',
                          fontSize: 16,
                          fontWeight: FontWeight.w300),
                    ),
                  ),
                  Expanded(
                    child: Divider(
                      color: Color(0xFF1E1919).withOpacity(0.3), // Çizgi rengi
                      thickness: 1,
                      indent: 10,
                      endIndent: 10, // Ortada boşluk için
                    ),
                  ),
                ],
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
                    fontFamily: 'Montserrat',
                    fontStyle: FontStyle.italic,
                    fontWeight: FontWeight.w300,
                    color: const Color(0xFF1E1919).withOpacity(0.5),
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
