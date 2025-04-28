import 'package:firebase_auth/firebase_auth.dart';
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
  int _selectedIndex = 0;

  final List<Widget> _pages = [
    BlogPage(),
    GroupsPage(),
    ChatPage(),
    ProfilePage(uid: FirebaseAuth.instance.currentUser!.uid),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_selectedIndex],
      bottomNavigationBar: BottomAppBar(
        color: Color(0xFF454679), // Zemin rengi
        shape: CircularNotchedRectangle(),
        notchMargin: 8,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildNavItem(0, 'assets/icons/home.png'),
            _buildNavItem(1, 'assets/icons/chats.png'),
            _buildNavItem(2, 'assets/icons/people.png'),
            _buildNavItem(3, 'assets/icons/user.png'),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, String iconPath) {
    bool isSelected = _selectedIndex == index;

    return IconButton(
      onPressed: () => _onItemTapped(index),
      icon: Image.asset(
        iconPath,
        height: 28,
        fit: BoxFit.contain,
        color: isSelected
            ? const Color(0xFF7B7B7B)
            : const Color(0xFFF8F8F8), // Seçili ve seçilmemiş renkler
      ),
    );
  }
}
