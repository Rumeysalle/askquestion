import 'package:askquestion/home_page.dart';
import 'package:askquestion/auth_page.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class RegisterPage extends StatefulWidget {
  @override
  _RegisterPageState createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController confirmPasswordController =
      TextEditingController();
  String errorMessage = "";
  bool isLoading = false;
  bool passwordsMatch = false;

  @override
  void initState() {
    super.initState();
    passwordController.addListener(checkPasswords);
    confirmPasswordController.addListener(checkPasswords);
  }

  void checkPasswords() {
    setState(() {
      passwordsMatch =
          passwordController.text == confirmPasswordController.text &&
              passwordController.text.isNotEmpty;
    });
  }

  Future<void> signUp() async {
    if (passwordController.text != confirmPasswordController.text) {
      setState(() {
        errorMessage = "Şifreler eşleşmiyor. Lütfen kontrol edin.";
      });
      return;
    }

    try {
      setState(() {
        isLoading = true;
      });

      UserCredential userCredential =
          await _auth.createUserWithEmailAndPassword(
        email: emailController.text.trim(),
        password: passwordController.text,
      );

      User? user = userCredential.user;
      if (user != null) {
        await FirebaseFirestore.instance.collection('users').doc(user.uid).set({
          'username': user.email?.split('@')[0] ?? '',
          'email': user.email,
          'photoURL': user.photoURL ?? 'https://i.ibb.co/wh9SNVZY/user.png',
          'createdAt': FieldValue.serverTimestamp(),
        });

        await user.sendEmailVerification();

        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Text("Doğrulama Emaili Gönderildi"),
            content: Text(
              "Lütfen emailinizi kontrol edin ve hesabınızı doğrulayın.",
              style: TextStyle(fontFamily: 'Montserrat'),
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (context) => AuthPage()),
                  );
                },
                child: Text("Giriş Yap"),
              ),
            ],
          ),
        );
      }
    } on FirebaseAuthException catch (e) {
      setState(() {
        if (e.code == 'email-already-in-use') {
          errorMessage = "Bu e-posta zaten kullanımda.";
        } else if (e.code == 'weak-password') {
          errorMessage = "Şifre çok zayıf. Daha güçlü bir şifre belirleyin.";
        } else if (e.code == 'invalid-email') {
          errorMessage = "Geçersiz e-posta adresi.";
        } else {
          errorMessage = e.message ?? "Bir hata oluştu.";
        }
      });
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Container(
            width: double.infinity,
            height: double.infinity,
            color: Color(0xFF0A1231),
          ),
          Column(
            children: [
              Expanded(
                flex: 2,
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "Hemen kayıt ol",
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          fontFamily: 'Montserrat',
                        ),
                      ),
                      SizedBox(height: 10),
                      Text(
                        "Aramıza Katıl!",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 16,
                          fontStyle: FontStyle.italic,
                          color: Colors.white70,
                          fontFamily: 'Montserrat',
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              Expanded(
                flex: 3,
                child: ClipRRect(
                  borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
                  child: Container(
                    width: double.infinity,
                    padding: EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Color(0xFFE3E8FF),
                      borderRadius:
                          BorderRadius.vertical(top: Radius.circular(30)),
                    ),
                    child: SingleChildScrollView(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          buildTextField("Email", emailController, false),
                          SizedBox(height: 20),
                          buildTextField("Şifre", passwordController, true),
                          SizedBox(height: 20),
                          buildConfirmPasswordField(),
                          SizedBox(height: 30),
                          isLoading
                              ? CircularProgressIndicator()
                              : ElevatedButton(
                                  onPressed: signUp,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Color(0xFF1E1919),
                                    padding: EdgeInsets.symmetric(
                                        vertical: 15, horizontal: 100),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(5),
                                    ),
                                  ),
                                  child: Text(
                                    "Kayıt Ol",
                                    style: TextStyle(
                                      fontFamily: 'Montserrat',
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                      color: Color(0xFFE3E8FF),
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
                          GestureDetector(
                            onTap: () {
                              Navigator.pop(context);
                            },
                            child: Text(
                              "Zaten bir hesabın var mı? Giriş Yap",
                              style: TextStyle(
                                fontFamily: 'Montserrat',
                                fontStyle: FontStyle.italic,
                                fontWeight: FontWeight.w300,
                                color: Color(0xFF1E1919).withOpacity(0.5),
                                fontSize: 16,
                                decoration: TextDecoration.underline,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget buildTextField(
      String label, TextEditingController controller, bool isPassword) {
    return TextField(
      controller: controller,
      obscureText: isPassword,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(
          fontFamily: 'Montserrat',
          fontWeight: FontWeight.bold,
          color: Colors.black54,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
      ),
    );
  }

  Widget buildConfirmPasswordField() {
    return TextField(
      controller: confirmPasswordController,
      obscureText: true,
      decoration: InputDecoration(
        labelText: "Şifreyi Onayla",
        labelStyle: TextStyle(
          fontFamily: 'Montserrat',
          fontWeight: FontWeight.bold,
          color: Colors.black54,
        ),
        suffix: AnimatedOpacity(
          opacity: passwordsMatch ? 1.0 : 0.2,
          duration: Duration(milliseconds: 300),
          child: SizedBox(
            width: 32,
            height: 32,
            child: Image.asset(
              'assets/icons/checked.png',
              fit: BoxFit.contain,
              color: passwordsMatch ? Colors.green : Colors.grey,
            ),
          ),
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
      ),
    );
  }
}
