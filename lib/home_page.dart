import 'package:flutter/material.dart';
import 'pages/chat_page.dart';
import 'pages/groups_page.dart';
import 'pages/profile_page.dart';
import 'pages/blog_page.dart';

class HomePage extends StatefulWidget {
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedIndex = 0; // Seçili sekme indeksi

  // Sayfaları liste olarak tanımlıyoruz
  final List<Widget> _pages = [
    BlogPage(), // Ana Sayfa (Bloglar)
    ChatPage(), // Mesajlaşma (AI Chatbox)
    GroupsPage(), // Gruplar (Topluluklar)
    ProfilePage() // Profil (Kullanıcı Bilgileri)
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_selectedIndex], // Seçili sayfayı göster

      // ALT MENÜ
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.blue, // Seçili ikon rengi
        unselectedItemColor: Colors.grey, // Seçili olmayan ikon rengi
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Ana Sayfa',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.chat),
            label: 'Mesajlaşma',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.groups),
            label: 'Gruplar',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profil',
          ),
        ],
      ),

      // PAYLAŞIM BUTONU (Floating Action Button - FAB)
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Buraya yeni yazı paylaşma ekranına yönlendirme kodu gelecek
          print("Paylaşımınız tamamlandı!");
        },
        child: Icon(Icons.add),
        backgroundColor: Colors.blue,
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }
}
