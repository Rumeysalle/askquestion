import 'package:flutter/material.dart';
import 'package:askquestion/pages/addposts_page.dart';
import 'package:askquestion/pages/chat_page.dart';
import 'package:askquestion/pages/groups_page.dart';
import 'package:askquestion/pages/profile_page.dart';
import 'package:askquestion/pages/blog_page.dart';

class HomePage extends StatefulWidget {
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedIndex = 0; // Seçili sayfa indeksi

  // Sayfaları liste olarak tanımlıyoruz
  final List<Widget> _pages = [
    BlogPage(), // Ana Sayfa (Bloglar)
    ChatPage(), // Mesajlaşma (AI Chatbox)
    GroupsPage(), // Gruplar (Topluluklar)
    ProfilePage(),
    AddPostScreen(), // Profil
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_selectedIndex], // Seçili sayfayı göster

      // Ortada mavi + butonu
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Paylaşım yapma sayfasına git
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => AddPostScreen()),
          );
        },
        child: Icon(Icons.add, color: Colors.white),
        backgroundColor: Colors.blue, // Buton rengi
      ),
      floatingActionButtonLocation:
          FloatingActionButtonLocation.centerDocked, // Buton ortada

      // Alt kısımda navigation bar yok
      bottomNavigationBar: BottomAppBar(
        color: const Color.fromARGB(27, 60, 87, 93),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            IconButton(
              icon: Icon(Icons.home, color: Colors.white),
              onPressed: () {
                setState(() {
                  _selectedIndex = 0;
                });
              },
            ),
            IconButton(
              icon: Icon(Icons.chat, color: Colors.white),
              onPressed: () {
                setState(() {
                  _selectedIndex = 1;
                });
              },
            ),
            // Diğer butonlar (Boş bırakılacak, çünkü + butonu ortada olacak)
            SizedBox(width: 48), // Butonlar arasında boşluk bırakmak için
            IconButton(
              icon: Icon(Icons.groups, color: Colors.white),
              onPressed: () {
                setState(() {
                  _selectedIndex = 2;
                });
              },
            ),
            IconButton(
              icon: Icon(Icons.person, color: Colors.white),
              onPressed: () {
                setState(() {
                  _selectedIndex = 3;
                });
              },
            ),
          ],
        ),
      ),
    );
  }
}
